/**
 * Event Space
 *
 * Events traverse within a confined event space.
 */
/*global dessert, troop, evan */
troop.promise(evan, 'EventSpace', function () {
    var base = troop.Base,
        self;

    self = evan.EventSpace = base.extend()
        .addMethod({
            /**
             * Adds subscription registry.
             * @constructor
             */
            init: function () {
                this.addConstant({
                    /**
                     * Object serving as lookup for subscribed paths.
                     */
                    registry: {}
                });
            }
        })
        .addPrivateMethod({
            /**
             * Bubbles an event up the path.
             * @param eventName {string}
             * @param eventPath {EventPath}
             * @param [data] {*}
             * @private
             */
            _bubble: function (eventName, eventPath, data) {
                var handlers = this.registry[eventPath.asString], // all handlers associated with path
                    i, handler, result;

                if (handlers && handlers.hasOwnProperty(eventName)) {
                    // obtaining actual list of handlers for path/eventName
                    handlers = handlers[eventName];

                    // iterating over subscribed functions
                    for (i = 0; i < handlers.length; i++) {
                        handler = handlers[i];
                        result = handler.call(this, {
                            target: eventPath.asString,
                            name  : eventName
                        }, data);

                        if (result === false) {
                            // iteration stops here and prevents further bubbling
                            return;
                        }
                    }
                }

                if (eventPath.asArray.length) {
                    this._bubble(eventName, eventPath.shrink(), data);
                }
            }
        })
        .addMethod({
            /**
             * Triggers event.
             * @param eventName {string} Name of event to be triggered.
             * @param eventPath {string|string[]|EventPath} Path on which to trigger event.
             * @param [data] {object} Extra data to be passed along with event to handlers.
             */
            trigger: function (eventName, eventPath, data) {
                if (!dessert.validators.isEventPath(eventPath)) {
                    eventPath = evan.EventPath.create(eventPath);
                }

                this._bubble(eventName, eventPath, data);

                return this;
            },

            /**
             * Subscribes to event.
             * @param eventName {string} Name of event to be triggered.
             * @param eventPath {string|string[]|EventPath} Path on which to trigger event.
             * @param handler {function} Event handler function that is called when the event
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

dessert.addTypes({
    isEventSpace: function (expr) {
        return evan.EventSpace.isPrototypeOf(expr);
    },

    isEventSpaceOptional: function (expr) {
        return typeof expr === 'undefined' ||
               evan.EventSpace.isPrototypeOf(expr);
    }
});
