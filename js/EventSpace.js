/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'EventSpace', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend()
            .addTrait(evan.EventSpawner);

    /**
     * Instantiates class.
     * @name evan.EventSpace.create
     * @function
     * @return {evan.EventSpace}
     */

    /**
     * Events traverse within a confined event space.
     * @class evan.EventSpace
     * @extends troop.Base
     * @extends evan.EventSpawner
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
             * Generates a stub for empty paths buffer.
             * @return {sntls.OrderedStringList}
             * @private
             */
            _generatePathsStub: function () {
                return sntls.OrderedStringList.create();
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
             * Creates an event in the context of the current event space.
             * @param {string} eventName Event name
             * @return {evan.Event} New event instance
             */
            spawnPlainEvent: function (eventName) {
                return evan.Event.create(eventName, this);
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
                    handlers = /** @type {Array} */ eventRegistry.getOrSetNode(
                        [eventName, 'handlers', eventPathString].toPath(),
                        this._generateHandlersStub
                    ),
                    pathList = /** @type {sntls.OrderedStringList} */ eventRegistry.getOrSetNode(
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
             * Unsubscribes from event. Removes entries associated with subscription
             * from event registry, both from the list of handlers and the list of
             * subscribed paths.
             * @param {string} eventName Name of event to be triggered.
             * @param {sntls.Path} eventPath Path we're listening to
             * @param {function} [handler] Event handler function
             * @return {evan.EventSpace}
             */
            unsubscribeFrom: function (eventName, eventPath, handler) {
                dessert.isFunctionOptional(handler, "Invalid event handler function");

                var eventRegistry = this.eventRegistry,
                    eventPathString = eventPath.toString(),
                    handlersQuery = [eventName || '|'.toKVP(), 'handlers', eventPathString, handler ?
                        '|'.toKVP().setValue(handler) :
                        '|'.toKVP()
                    ].toQuery(),
                    handlerPaths = eventRegistry.queryPathsAsHash(handlersQuery)
                        .toCollection(),
                    pathsQuery,
                    eventNames;

                // removing handlers from registry
                handlerPaths
                    .passEachItemTo(eventRegistry.unsetPath, eventRegistry, 0, true);

                // obtaining affected events' names
                eventNames = handlerPaths
                    .toTree()
                    // first item of each path holds event name
                    .queryValuesAsHash('|>asArray>0'.toQuery())
                    // getting unique event names
                    .toStringDictionary()
                    .reverse()
                    .getKeys();

                // removing affected paths from registry (path lookup list)
                pathsQuery = [eventNames, 'paths'].toQuery();
                eventRegistry.queryValuesAsHash(pathsQuery)
                    .toCollection()
                    .forEachItem(function (/**sntls.OrderedStringList*/pathList) {
                        if (handler) {
                            // when handler is specified, remove one copy of event path
                            pathList.removeItem(eventPathString);
                        } else {
                            // when handler is not specified, remove all copies of event path
                            pathList.removeEvery(eventPathString);
                        }
                    });

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
             * @return {*}
             * @see evan.Event.trigger
             */
            callHandlers: function (event) {
                var that = this,
                    handlersQuery = [
                        event.eventName,
                        'handlers',
                        event.currentPath.toString(),
                        '|'.toKVP()
                    ].toQuery(),
                    handlers = this.eventRegistry
                        .queryValuesAsHash(handlersQuery)
                        .toCollection(),
                    result = handlers.getKeyCount();

                handlers.forEachItem(function (handler) {
                    // stopping iteration when handler returns false
                    if (handler.call(that, event, event.payload) === false) {
                        result = false;
                        return false;
                    } else {
                        return true;
                    }
                });

                return result;
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
                // node holds an OrderedStringList
                var paths = this.eventRegistry
                    .getNode([eventName, 'paths'].toPath());

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
