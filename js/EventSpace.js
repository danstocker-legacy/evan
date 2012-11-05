/**
 * Event Space
 *
 * Events traverse within a confined event space.
 */
/*global troop, evan */
troop.promise('evan.EventSpace', function () {
    var base = troop.Base,
        self;

    self = evan.EventSpace = base.extend()
        .addMethod({
            /**
             * Adds subscription registry.
             * @constructor
             * @param options
             * @param options.bubbling {boolean} Flag controlling bubbling. Default: true.
             */
            init: function (options) {
                options = options || {};

                this
                    .addConstant({
                        /**
                         * Object serving as lookup for subscribed paths.
                         */
                        registry: {},

                        // flags
                        bubbling: typeof options.bubbling === 'boolean' ?
                            options.bubbling :
                            true
                    });
            },

            /**
             * Triggers event.
             * @param path {string[]} Path on which to trigger event.
             * @param eventName {string} Name of event to be triggered.
             * @param [data] {object} Extra data to be passed along with event to handlers.
             */
            trigger: function (path, eventName, data) {
                var registry = this.registry,
                    bubbling = this.bubbling,
                    sPath = path.join('.'),
                    handlers,
                    i, handler, result;

                if (!registry.hasOwnProperty(sPath)) {
                    return this;
                }

                handlers = registry[sPath];
                if (!handlers.hasOwnProperty(eventName)) {
                    return this;
                }

                // obtaining actual list of handlers for path/eventName
                handlers = handlers[eventName];
                if (!(handlers instanceof Array)) {
                    return this;
                }

                // iterating over subscribed functions
                for (i = 0; i < handlers.length; i++) {
                    handler = handlers[i];
                    result = handler.call(this, {
                        target: sPath,
                        name: eventName
                    }, data);

                    if (result === false) {
                        // iteration stops here and prevents further bubbling
                        bubbling = false;
                        break;
                    }
                }

                if (bubbling && path.length) {
                    this.trigger(path.slice(0, -1), eventName);
                }

                return this;
            },

            on: function () {

            },

            off: function () {

            },

            one: function () {

            }
        });

    return self;
});
