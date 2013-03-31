/**
 * Event Space
 *
 * Events traverse within a confined event space.
 */
/*global dessert, troop, evan */
troop.promise(evan, 'EventSpace', function () {
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
            }
        })
        .addPrivateMethod(/** @lends evan.EventSpace */{
            /**
             * Bubbles an event up the path.
             * @param {string} eventName
             * @param {evan.EventPath} eventPath
             * @param [data] {*}
             * @return {boolean}
             * @private
             */
            _bubble: function (eventName, eventPath, data) {
                var handlers = this.registry[eventPath.toString()], // all handlers associated with path
                    i, handler, result;

                if (handlers && hOP.call(handlers, eventName)) {
                    // obtaining actual list of handlers for path/eventName
                    handlers = handlers[eventName];

                    // iterating over subscribed functions
                    for (i = 0; i < handlers.length; i++) {
                        handler = handlers[i];
                        result = handler.call(this, {
                            target: eventPath.toString(),
                            name  : eventName
                        }, data);

                        if (result === false) {
                            // iteration stops here and prevents further bubbling
                            return false;
                        }
                    }
                }

                return true;
            }
        })
        .addMethod(/** @lends evan.EventSpace */{
            /**
             * Triggers event.
             * @this {evan.EventSpace}
             * @param {string} eventName Name of event to be triggered.
             * @param {evan.EventPath|string|string[]} eventPath Path on which to trigger event.
             * @param {*} [data] Extra data to be passed along with event to handlers.
             */
            trigger: function (eventName, eventPath, data) {
                if (!dessert.validators.isEventPath(eventPath)) {
                    eventPath = evan.EventPath.create(eventPath);
                } else {
                    // path must be cloned because it will be modified
                    eventPath = eventPath.clone();
                }

                // path will be chipped away from in each iteration
                while (eventPath.asArray.length) {
                    if (this._bubble(eventName, eventPath, data) === false) {
                        // bubbling was deliberately stopped
                        break;
                    } else {
                        // going on to next key in path
                        eventPath.shrink();
                    }
                }

                return this;
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
