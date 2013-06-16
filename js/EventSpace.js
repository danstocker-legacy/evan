/**
 * Event Space
 *
 * Events traverse within a confined event space.
 */
/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'EventSpace', function () {
    "use strict";

    var Event = evan.Event;

    /**
     * @class evan.EventSpace
     * @extends troop.Base
     */
    evan.EventSpace = troop.Base.extend()
        .addPrivateMethods(/** @lends evan.EventSpace */{
            /**
             * Generates a stub for event handlers. (An empty array)
             * @return {Array}
             * @private
             */
            _generateHandlersStub: function () {
                return [];
            },

            /**
             * Generates a stub for empty paths buffer.
             * @return {sntls.OrderedStringList}
             * @private
             */
            _generatePathsStub: function () {
                return sntls.OrderedStringList.create();
            }
        })
        .addMethods(/** @lends evan.EventSpace */{
            /**
             * @name evan.EventSpace.create
             * @return {evan.EventSpace}
             */

            /**
             */
            init: function () {
                /**
                 * Lookup for subscribed event handlers.
                 * @type {sntls.Tree}
                 * @constant
                 * @example {myEvent: {handlers: {myPath: [func1, func2]}, paths: [myPath]}}
                 */
                this.eventRegistry = sntls.Tree.create();
            },

            /**
             * Creates an event in the context of the current event space.
             * @param {string} eventName Event name
             * @return {evan.Event} New event instance
             */
            spawnEvent: function (eventName) {
                return Event.create(this, eventName);
            },

            /**
             * Subscribes to event.
             * @param {string} eventName Name of event to be triggered.
             * @param {sntls.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {evan.EventSpace}
             */
            subscribeTo: function (eventName, eventPath, handler) {
                dessert.isFunction(handler, "Invalid event handler function");

                var eventRegistry = this.eventRegistry,
                    eventPathString = eventPath.toString(),
                    handlers = /** @type {Array} */ eventRegistry.getSafeNode(
                        [eventName, 'handlers', eventPathString].toPath(),
                        this._generateHandlersStub),
                    pathList = eventRegistry.getSafeNode(
                        [eventName, 'paths'].toPath(),
                        this._generatePathsStub
                    );

                // adding handler to handlers
                handlers.push(handler);

                // adding paths to ordered path list
                pathList.addItem(eventPathString);

                return this;
            },

            /**
             * Unsubscribes from event.
             * @param {string} eventName Name of event to be triggered.
             * @param {sntls.Path} eventPath Path we're listening to
             * @param {function} [handler] Event handler function
             * @return {evan.EventSpace}
             */
            unsubscribeFrom: function (eventName, eventPath, handler) {
                dessert.isFunctionOptional(handler, "Invalid event handler function");

                var eventRegistry = this.eventRegistry,
                    eventPathString = eventPath.toString(),
                    handlersPath = [eventName, 'handlers', eventPathString].toPath(),
                    handlers = eventRegistry.getNode(handlersPath),
                    handlerIndex,
                    pathsPath, pathList;

                if (handlers) {
                    pathsPath = [eventName, 'paths'].toPath();
                    pathList = /** @type {sntls.OrderedStringList} */ eventRegistry.getNode(pathsPath);

                    if (handler) {
                        // obtaining handler index
                        handlerIndex = handlers.indexOf(handler);
                        if (handlerIndex > -1) {
                            // unsubscribing one specific handler
                            handlers.splice(handlerIndex, 1);

                            // removing path from ordered path list
                            pathList.removeItem(eventPathString);
                        }

                        if (!handlers.length) {
                            // removing handlers stub
                            eventRegistry.unsetNode(handlersPath);
                        }
                    } else {
                        // unsubscribing all handlers from event name / path
                        eventRegistry.unsetNode(handlersPath);

                        // removing all items pointing to this path
                        pathList.removeEvery(eventPathString);
                    }
                }

                return this;
            },

            /**
             * Subscribes to event and unsubscribes after first trigger.
             * @param {string} eventName Name of event to be triggered.
             * @param {sntls.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {function} Event handler actually subscribed. Use this for unsubscribing.
             */
            subscribeToUntilTriggered: function (eventName, eventPath, handler) {
                /**
                 * Handler wrapper for events that automatically unsubscribe
                 * after the first trigger.
                 * @param {evan.Event} event
                 * @param {*} data
                 * @return {*} Whatever the user-defined handler returns (possibly a `false`)
                 */
                function oneHandler(event, data) {
                    /*jshint validthis: true */
                    handler.call(this, event, data);
                    return event.eventSpace.unsubscribeFrom(event.eventName, event.currentPath, oneHandler);
                }

                // subscribing delegate handler to capturing path
                this.subscribeTo(eventName, eventPath, oneHandler);

                return oneHandler;
            },

            /**
             * Delegates event capturing to a path closer to the root.
             * Handlers subscribed this way CANNOT be unsubscribed individually.
             * @param {string} eventName
             * @param {sntls.Path} capturePath Path where the event will actually subscribe
             * @param {sntls.Path} delegatePath Path we're listening to. (Could be derived, eg. Query)
             * @param {function} handler Event handler function
             * @return {function} Event handler actually subscribed. Use this for unsubscribing.
             */
            delegateSubscriptionTo: function (eventName, capturePath, delegatePath, handler) {
                dessert
                    .assert(delegatePath.isRelativeTo(capturePath), "Delegate path is not relative to capture path")
                    .isFunction(handler, "Invalid event handler function");

                /**
                 * Handler wrapper for subscribing delegates
                 * @param {evan.Event} event Event object passed down by the triggering process
                 * @param {*} data Custom event data
                 * @return {*} Whatever the user-defined handler returns (possibly a `false`)
                 */
                function delegateHandler(event, data) {
                    /*jshint validthis: true */
                    var originalPath = event.originalPath,
                        broadcastPath = event.broadcastPath;

                    if (originalPath.isRelativeTo(delegatePath) ||
                        broadcastPath && delegatePath.isRelativeTo(broadcastPath)) {
                        // triggering handler and passing forged current path set to delegatePath
                        return handler.call(this, event.clone(delegatePath), data);
                    }
                }

                // subscribing delegate handler to capturing path
                this.subscribeTo(eventName, capturePath, delegateHandler);

                return delegateHandler;
            },

            /**
             * Calls handlers associated with an event name and path.
             * Handlers are assumed to be synchronous.
             * @param {evan.Event} event
             * @return {*}
             * @see evan.Event.trigger
             */
            callHandlers: function (event) {
                var handlersPath = [event.eventName, 'handlers', event.currentPath.toString()].toPath(),
                    handlers = this.eventRegistry.getNode(handlersPath),
                    i, result;

                if (handlers) {
                    // iterating over subscribed functions
                    // handlers is assumed to be array of functions
                    for (i = 0; i < handlers.length; i++) {
                        // calling subscribed function
                        result = handlers[i].call(this, event, event.data);

                        if (result === false) {
                            // iteration stops here and prevents further bubbling
                            return false;
                        }
                    }
                }
            },

            /**
             * Retrieves subscribed paths that are relative to the specified path.
             * @param {string} eventName
             * @param {sntls.Path} path
             * @return {evan.PathCollection} Collection of paths relative to (not including) `path`
             * Question is which lib/class should delegate the method.
             */
            getPathsRelativeTo: function (eventName, path) {
                return /** @type evan.PathCollection */ this.eventRegistry
                    // obtaining all paths associated with event name
                    // node holds an OrderedStringList
                    .getNode([eventName, 'paths'].toPath())

                    // querying collection of strings that are relative to `path`
                    .getRangeByPrefixAsHash(path.toString(), true)
                    .toStringCollection()

                    // converting them to a collection of paths
                    .toPathOrQuery().asType(evan.PathCollection);
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isEventSpace: function (expr) {
            return evan.EventSpace.isPrototypeOf(expr);
        },

        isEventSpaceOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   evan.EventSpace.isPrototypeOf(expr);
        }
    });
}());
