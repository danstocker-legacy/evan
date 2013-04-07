/**
 * Event Space
 *
 * Events traverse within a confined event space.
 */
/*global dessert, troop, sntls, evan */
troop.promise(evan, 'EventSpace', /** @borrows init as evan.EventSpace.create */ function () {
    /**
     * @class evan.EventSpace
     * @extends troop.Base
     */
    evan.EventSpace = troop.Base.extend()
        .addPrivateMethod({
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
            },

            /**
             * Creates a new event object based on the model event and
             * initializes it with the specified path.
             * @param {evan.Event} modelEvent
             * @param {evan.EventPath} eventPath
             * @private
             */
            _createPreparedEvent: function (modelEvent, eventPath) {
                return evan.Event.create(this, modelEvent.eventName)
                    .prepareTrigger(eventPath, modelEvent.data);
            }
        })
        .addMethod(/** @lends evan.EventSpace */{
            /**
             * Adds subscription registry.
             */
            init: function () {
                this.addConstant(/** @lends evan.EventSpace */{
                    /**
                     * Lookup for subscribed event handlers.
                     * @type {sntls.Tree}
                     * @example {myEvent: {handlers: {myPath: [func1, func2]}, paths: [myPath]}}
                     */
                    eventRegistry: sntls.Tree.create()
                });
            },

            /**
             * Creates an event in the context of the current event space.
             * @param {string} eventName Event name
             * @return {evan.Event} New event instance
             */
            createEvent: function (eventName) {
                return evan.Event.create(this, eventName);
            },

            /**
             * Subscribes to event.
             * @param {string} eventName Name of event to be triggered.
             * @param {string|string[]|evan.EventPath} eventPath Path on which to trigger event.
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {evan.EventSpace}
             */
            on: function (eventName, eventPath, handler) {
                dessert.isFunction(handler);

                var eventRegistry = this.eventRegistry,
                    eventPathString = eventPath.toString(),
                    handlers = /** @type {Array} */ eventRegistry.getSafeNode(
                        [eventName, 'handlers', eventPathString],
                        this._generateHandlersStub),
                    paths = /** @type {sntls.OrderedStringList} */ eventRegistry.getSafeNode(
                        [eventName, 'paths'],
                        this._generatePathsStub
                    );

                // adding handler to handlers
                handlers.push(handler);

                // adding paths to ordered path list
                paths.addItem(eventPathString);

                return this;
            },

            /**
             * Unsubscribes from event.
             * @param {string} eventName Name of event to be triggered.
             * @param {string|string[]|evan.EventPath} eventPath Path on which to trigger event.
             * @param {function} [handler] Event handler function
             * @return {evan.EventSpace}
             */
            off: function (eventName, eventPath, handler) {
                dessert.isFunctionOptional(handler);

                var eventRegistry = this.eventRegistry,
                    eventPathString = eventPath.toString(),
                    handlersPath = [eventName, 'handlers', eventPathString],
                    handlers = eventRegistry.getNode(handlersPath);

                if (handlers) {
                    if (handler) {
                        // unsubscribing single handler from event on path
                        handlers.splice(handlers.indexOf(handler), 1);
                    }

                    if (!handler || !handlers.length) {
                        // unsubscribing all handlers from event on path
                        eventRegistry.unsetNode(handlersPath);
                    }
                }

                // removing path from ordered path list
                eventRegistry.getNode([eventName, 'paths'])
                    .removeItem(eventPathString);

                return this;
            },

            /**
             * Triggers an event on a specific path in the current event space.
             * Handlers are assumed to be synchronous.
             * @param {evan.Event} event
             * @return {*}
             * @see evan.Event.trigger
             */
            bubbleSync: function (event) {
                var handlers = this.eventRegistry.getNode([event.eventName, 'handlers', event.currentPath.toString()]),
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
             * Retrieves subscribed paths below the specified path.
             * @param {string} eventName
             * @param {evan.EventPath|string|string[]} eventPath
             * @return {evan.EventPathCollection}
             */
            getPathsBelow: function (eventName, eventPath) {
                var paths = /** @type sntls.OrderedStringList */ this.eventRegistry.getNode([eventName, 'paths']);
                return evan.EventPathCollection.create(paths.getRangeByPrefix(eventPath.toString()));
            },

            /**
             * Broadcasts an event at the specified path by triggering events on all
             * subscribed paths below.
             * @param {evan.Event} event Event to be broadcast
             */
            broadcastSync: function (event) {
                var eventPathCollection = this.getPathsBelow(event.eventName, event.originalPath),
                    eventCollection = eventPathCollection.map(
                        this._createPreparedEvent.bind(this, event),
                        evan.EventCollection
                    );

                // triggering all affected events
                eventCollection.triggerSync();

                return this;
            }
        });
});

dessert.addTypes(/** @lends dessert */{
    isEventSpace: function (expr) {
        return evan.EventSpace.isPrototypeOf(expr);
    },

    isEventSpaceOptional: function (expr) {
        return typeof expr === 'undefined' ||
               evan.EventSpace.isPrototypeOf(expr);
    }
});
