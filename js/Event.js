/**
 * Event
 *
 * An event is an object that may traverse in an event space.
 * Events carry all information regarding their position & properties.
 */
/*global dessert, troop, sntls, evan */
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
                this.currentPath = undefined;
                this.originalPath = undefined;
                this.data = undefined;

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
                        data: undefined,

                        /**
                         * @type {evan.EventPath}
                         */
                        currentPath: undefined,

                        /**
                         * @type {evan.EventPath}
                         */
                        originalPath: undefined
                    });
            },

            /**
             * Prepares event for triggering.
             * @param {evan.EventPath|string|string[]} eventPath Path on which to trigger event.
             * @param {*} [data] Extra data to be passed along with event to handlers.
             * @return {evan.Event}
             */
            prepareTrigger: function (eventPath, data) {
                if (evan.EventPath.isBaseOf(eventPath)) {
                    this.originalPath = eventPath;
                } else {
                    this.originalPath = evan.EventPath.create(eventPath);
                }

                this.currentPath = this.originalPath.clone();
                this.data = data;

                return this;
            },

            /**
             * Triggers event.
             * Event handlers are assumed to be synchronous. Event properties change
             * between stages of bubbling, hence holding on to an event instance in an async handler
             * may not reflect the current paths and data carried.
             * @return {evan.Event}
             * @see evan.Event.prepareTrigger
             */
            triggerSync: function () {
                if (arguments.length) {
                    this.prepareTrigger.apply(this, arguments);
                }

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
            },

            /**
             * Broadcasts the event to all subscribed paths *below* the specified path.
             * @param {evan.EventPath|string|string[]} eventPath Target root for broadcast
             * @param {*} [data] Extra data to be passed along with event to handlers.
             */
            broadcastSync: function (eventPath, data) {
                this.prepareTrigger(eventPath, data);
                this.eventSpace.broadcastSync(this);
                this._reset();

                return this;
            }
        });
});

troop.promise(evan, 'EventCollection', function () {
    /**
     * @class evan.EventCollection
     * @extends sntls.Collection
     * @extends evan.Event
     */
    evan.EventCollection = sntls.Collection.of(evan.Event);
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
