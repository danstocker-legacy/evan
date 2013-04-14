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
        .addPrivateMethod(/** @lends evan.EventSpace */{
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
             * Handler wrapper for subscribing delegates
             * @param {evan.EventPath} delegatePath The path being listened to
             * @param {function} handler Real event handler function
             * @param {evan.Event} event Event object passed down by the triggering process
             * @param {*} data Custom event data
             * @return {*} Whatever the user-defined handler returns (possibly a `false`)
             * @private
             */
            _delegateHandler: function (delegatePath, handler, event, data) {
                if (event.originalPath.isRelativeTo(delegatePath)) {
                    // triggering handler and passing forged current path set to delegatePath
                    return handler.call(this, event.clone(delegatePath), data);
                }
            }
        })
        .addMethod(/** @lends evan.EventSpace */{
            /**
             * @name evan.EventSpace.create
             * @return {evan.EventSpace}
             */

            /**
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
             * @param {sntls.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {evan.EventSpace}
             */
            on: function (eventName, eventPath, handler) {
                dessert.isFunction(handler, "Invalid event handler function");

                var eventRegistry = this.eventRegistry,
                    eventPathString = eventPath.toString(),
                    handlers = /** @type {Array} */ eventRegistry.getSafeNode(
                        [eventName, 'handlers', eventPathString],
                        this._generateHandlersStub),
                    paths = eventRegistry.getSafeNode(
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
             * @param {sntls.Path} eventPath Path we're listening to
             * @param {function} [handler] Event handler function
             * @return {evan.EventSpace}
             */
            off: function (eventName, eventPath, handler) {
                dessert.isFunctionOptional(handler, "Invalid event handler function");

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
             * Creates a delegate handler to be used in event subscriptions.
             * Use it when a reference to the subscribed
             * @param {evan.EventPath} delegatePath Path we're listening to
             * @param {function} handler Event handler function
             * @return {function}
             */
            delegateHandler: function (delegatePath, handler) {
                return this._delegateHandler.bind(this, delegatePath, handler);
            },

            /**
             * Delegates event capturing to a path closer to the root.
             * Handlers subscribed this way CANNOT be unsubscribed individually.
             * @param {string} eventName
             * @param {sntls.Path} capturePath Path where the event will actually subscribe
             * @param {evan.EventPath} delegatePath Path we're listening to
             * @param {function} handler Event handler function
             * @return {evan.EventSpace}
             */
            delegate: function (eventName, capturePath, delegatePath, handler) {
                dessert
                    .assert(delegatePath.isRelativeTo(capturePath), "Delegate path is not relative to capture path")
                    .isFunction(handler, "Invalid event handler function");

                // subscribing delegate handler to capturing path
                this.on(eventName, capturePath, this._delegateHandler.bind(this, delegatePath, handler));

                return this;
            },

            /**
             * Calls handlers associated with an event name and path.
             * Handlers are assumed to be synchronous.
             * @param {evan.Event} event
             * @return {*}
             * @see evan.Event.trigger
             */
            callHandlers: function (event) {
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
             * Retrieves subscribed paths under the specified path.
             * @param {string} eventName
             * @param {sntls.Path} path
             * @return {evan.PathCollection}
             */
            getPathsUnder: function (eventName, path) {
                var allPaths = /** @type sntls.OrderedStringList */ this.eventRegistry.getNode([eventName, 'paths']),
                    matchingPaths = allPaths.getRangeByPrefix(path.toString());

                return /** @type evan.PathCollection */ evan.StringCollection.create(matchingPaths)
                    .toPath()
                    .asType(evan.PathCollection);
            }
        });
});

troop.promise(evan, 'StringCollection', function () {
    /**
     * @name evan.StringCollection.create
     * @return {evan.StringCollection}
     */

    /**
     * @class evan.StringCollection
     * @extends sntls.Collection
     * @extends String
     */
    evan.StringCollection = sntls.Collection.of(String);
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
