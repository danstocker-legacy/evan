/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'EventSpace', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * Instantiates an EventSpace.
     * Make sure the number of event spaces are kept to a minimum, as all EventSpace instances
     * will be permanently stored in evan.eventSpaceRegistry.
     * @name evan.EventSpace.create
     * @function
     * @return {evan.EventSpace}
     */

    /**
     * Events traverse within a confined event space.
     * @class
     * @extends troop.Base
     * @extends evan.EventSpawner
     * @extends evan.EventTarget
     */
    evan.EventSpace = self
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
             * Prepares spawned event for triggering.
             * @param {evan.Event} event
             * @private
             */
            _prepareEvent: function (event) {
                var nextPayloadItems = evan.nextPayloadStore.getPayload(event.eventName),
                    nextOriginalEvent = evan.originalEventStack.getLastEvent();

                if (nextPayloadItems) {
                    // applying next payload on spawned event
                    event.mergePayload(sntls.Collection.create(nextPayloadItems));
                }

                if (nextOriginalEvent) {
                    // setting next original event on spawned event
                    event.setOriginalEvent(nextOriginalEvent);
                }
            }
        })
        .addMethods(/** @lends evan.EventSpace# */{
            /** @ignore */
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
             * @param {string} eventName
             * @return {evan.Event}
             */
            spawnEvent: function (eventName) {
                var event = evan.Event.create(eventName, this);
                this._prepareEvent(event);
                return event;
            },

            /**
             * Subscribes to event.
             * TODO: Switch eventPath / eventName arguments. Breaking.
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
                    handlers = eventRegistry.getOrSetNode(
                        [eventPathString, eventName].toPath(),
                        this._generateHandlersStub);

                // adding handler to handlers
                handlers.push(handler);

                return this;
            },

            /**
             * Unsubscribes from event. Removes entries associated with subscription
             * from event registry, both from the list of handlers and the list of
             * subscribed paths.
             * TODO: Switch eventPath / eventName arguments. Breaking.
             * TODO: Consider changing unsetKey to unsetPath. Measure performance impact.
             * @param {string} [eventName] Name of event to be triggered.
             * @param {sntls.Path} [eventPath] Path we're listening to
             * @param {function} [handler] Event handler function
             * @return {evan.EventSpace}
             */
            unsubscribeFrom: function (eventName, eventPath, handler) {
                dessert.isFunctionOptional(handler, "Invalid event handler function");

                var eventRegistry = this.eventRegistry,
                    handlers,
                    handlerIndex;

                if (eventPath) {
                    if (eventName) {
                        if (handler) {
                            handlers = eventRegistry.getNode([eventPath, eventName].toPath());
                            if (handlers) {
                                // there are subscriptions on event/path
                                if (handlers.length > 1) {
                                    handlerIndex = handlers.indexOf(handler);
                                    if (handlerIndex > -1) {
                                        // specified handler is subscribed
                                        handlers.splice(handlerIndex, 1);
                                    }
                                } else {
                                    // removing last handler
                                    eventRegistry.unsetKey([eventPath, eventName].toPath());
                                }
                            }
                        } else {
                            // removing all handlers
                            eventRegistry.unsetKey([eventPath, eventName].toPath());
                        }
                    } else {
                        // removing all handlers for specified path
                        eventRegistry.unsetKey([eventPath].toPath());
                    }
                } else {
                    // removing all event bindings
                    this.eventRegistry.clear();
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

                    if (delegatePath.isRootOf(originalPath) ||
                        broadcastPath && delegatePath.isRelativeTo(broadcastPath)
                        ) {
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
             * @return {number|boolean} Number of handlers processed, or false when one handler returned false.
             * @see evan.Event.trigger
             */
            callHandlers: function (event) {
                var handlersPath = [event.currentPath.toString(), event.eventName].toPath(),
                    handlers = this.eventRegistry.getNode(handlersPath),
                    i = 0, handler;

                if (handlers && handlers.length) {
                    for (; i < handlers.length; i++) {
                        handler = handlers[i];
                        // calling handler, passing event and payload
                        if (handler.call(this, event, event.payload) === false) {
                            // stopping iteration when handler returns false
                            return false;
                        }
                    }
                }

                return i;
            },

            /**
             * Retrieves subscribed paths that are relative to the specified path.
             * @param {string} eventName
             * @param {sntls.Path} path
             * @return {evan.PathCollection} Collection of paths relative to (not including) `path`
             * Question is which lib/class should delegate the method.
             */
            getPathsRelativeTo: function (eventName, path) {
                // obtaining all paths associated with event name
                var pathsQuery = ['{|}'.toKVP(), eventName].toQuery(),
                    paths = this.eventRegistry
                        .queryKeysAsHash(pathsQuery)
                        .toOrderedStringList();

                if (paths) {
                    // there are subscriptions matching eventName
                    return /** @type evan.PathCollection */paths
                        // querying collection of strings that are relative to `path`
                        .getRangeByPrefixAsHash(path.toString(), true)
                        .toStringCollection()
                        // converting them to a collection of paths
                        .toPathOrQuery().asType(evan.PathCollection);
                } else {
                    // no subscriptions match eventName
                    // returning empty path collection
                    return evan.PathCollection.create([]);
                }
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
