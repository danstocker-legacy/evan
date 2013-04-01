/**
 * Event Space
 *
 * Events traverse within a confined event space.
 */
/*global dessert, troop, evan */
troop.promise(evan, 'EventSpace', /** @borrows init as evan.EventSpace.create */ function () {
    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class evan.EventSpace
     * @extends troop.Base
     */
    evan.EventSpace = troop.Base.extend()
        .addMethod(/** @lends evan.EventSpace */{
            /**
             * Adds subscription registry.
             */
            init: function () {
                this.addConstant(/** @lends evan.EventSpace */{
                    /**
                     * Object serving as lookup for subscribed paths.
                     */
                    registry: {}
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
             */
            on: function (eventName, eventPath, handler) {
                dessert.isFunction(handler);

                var handlers = evan.Path.create([eventPath.toString()])
                    .resolveOrBuild(this.registry);

                if (hOP.call(handlers, eventName)) {
                    handlers[eventName].push(handler);
                } else {
                    handlers[eventName] = [handler];
                }

                return this;
            },

            /**
             * Unsubscribes from event.
             * @param {string} eventName Name of event to be triggered.
             * @param {string|string[]|evan.EventPath} eventPath Path on which to trigger event.
             * @param {function} [handler] Event handler function
             */
            off: function (eventName, eventPath, handler) {
                dessert.isFunctionOptional(handler);

                var handlers = evan.Path.create([eventPath.toString()])
                    .resolve(this.registry);

                if (handlers && hOP.call(handlers, eventName)) {
                    if (handler) {
                        // unsubscribing single handler from event on path
                        handlers = handlers[eventName];
                        handlers.splice(handlers.indexOf(handler), 1);
                    } else {
                        // unsubscribing all handlers from event on path
                        delete handlers[eventName];
                    }
                }

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
                var handlers = evan.Path.create([event.currentPath.toString(), event.eventName])
                        .resolve(this.registry),
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
