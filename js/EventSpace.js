/**
 * Event Space
 *
 * Events traverse within a confined event space.
 */
/*global dessert, troop, evan */
troop.promise(evan, 'EventSpace', function () {
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

                if (handlers && handlers.hasOwnProperty(eventName)) {
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

            },

            off: function () {

            },

            one: function () {

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
