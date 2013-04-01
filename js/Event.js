/**
 * Event
 *
 * An event is an object that may traverse in an event space.
 * Events carry all information regarding their position & properties.
 */
/*global dessert, troop, evan */
troop.promise(evan, 'Event', function () {
    /**
     * @class evan.Event
     * @extends troop.Base
     */
    evan.Event = troop.Base.extend()
        .addPrivateMethod(/** @lends evan.Event */{
            /**
             * Resets event properties
             * @return {evan.Event}
             * @private
             */
            _reset: function () {
                this.currentPath = null;
                this.originalPath = null;
                this.data = null;

                return this;
            }
        })
        .addMethod(/** @lends evan.Event */{
            /**
             * @param {evan.EventSpace} eventSpace Event space associated with event
             * @param {string} eventName Event name
             */
            init: function (eventSpace, eventName) {
                dessert
                    .isEventSpace(eventSpace)
                    .isString(eventName);

                this
                    .addConstant(/** @lends evan.Event */{
                        /**
                         * @type {string}
                         * @constant
                         */
                        eventName: eventName,

                        /**
                         * @type {evan.EventSpace}
                         * @constant
                         */
                        eventSpace: eventSpace
                    })
                    .addPublic(/** @lends evan.Event */{
                        /**
                         * @type {*}
                         */
                        data: null,

                        /**
                         * @type {evan.EventPath}
                         */
                        currentPath: null,

                        /**
                         * @type {evan.Path}
                         */
                        originalPath: null
                    });
            },

            /**
             * Determines whether event is in bubbling state.
             * @return {boolean}
             */
            isBubbling: function () {
                return !!this.originalPath && !!this.currentPath;
            },

            /**
             * Triggers event.
             * Event handlers are assumed to be synchronous. Event properties change
             * between stages of bubbling, hence holding on to an event instance in an async handler
             * may not reflect the current paths and data carried.
             * @param {evan.EventPath|string|string[]} eventPath Path on which to trigger event.
             * @param {*} [data] Extra data to be passed along with event to handlers.
             * @return {evan.Event}
             */
            triggerSync: function (eventPath, data) {
                if (dessert.validators.isEventPath(eventPath)) {
                    this.originalPath = eventPath;
                } else {
                    this.originalPath = evan.EventPath.create(eventPath);
                }

                this.currentPath = this.originalPath.clone();
                this.data = data;

                while (this.currentPath.asArray.length) {
                    if (this.eventSpace.bubbleSync(this) === false) {
                        // bubbling was deliberately stopped
                        break;
                    } else {
                        this.currentPath.shrink();
                    }
                }

                // resetting path properties
                this._reset();

                return this;
            }
        });
});

dessert.addTypes(/** @lends dessert */{
    isEvent: function (expr) {
        return evan.Event.isPrototypeOf(expr);
    },

    isEventOptional: function (expr) {
        return typeof expr === 'undefined' ||
               evan.Event.isPrototypeOf(expr);
    }
});
