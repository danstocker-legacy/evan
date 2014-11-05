/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'EventSpawner', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * @class
     * @extends troop.Base
     */
    evan.EventSpawner = self
        .addPrivateMethods(/** @lends evan.EventSpawner# */{
            /**
             * Prepares spawned event for triggering.
             * @param {evan.Event} event
             * @param {*} [payload]
             * @private
             */
            _prepareEvent: function (event, payload) {
                payload = payload || this.nextPayload;

                if (payload) {
                    event.setPayload(payload);
                }

                var nextOriginalEvent = this.nextOriginalEvent;

                if (nextOriginalEvent) {
                    event.setOriginalEvent(nextOriginalEvent);
                }
            }
        })
        .addMethods(/** @lends evan.EventSpawner# */{
            /**
             * @ignore
             */
            init: function () {
                /**
                 * Payload to be set on next trigger(s).
                 * @type {*}
                 */
                this.nextPayload = undefined;

                /**
                 * Original event to be set on next trigger(s).
                 * @type {evan.Event|*}
                 */
                this.nextOriginalEvent = undefined;
            },

            /**
             * Sets payload for next event triggered.
             * @param {*} nextPayload
             * @returns {evan.EventSpawner}
             */
            setNextPayload: function (nextPayload) {
                this.nextPayload = nextPayload;
                return this;
            },

            /**
             * Clears payload for next event triggered.
             * @returns {evan.EventSpawner}
             */
            clearNextPayload: function () {
                this.nextPayload = undefined;
                return this;
            },

            /**
             * Sets original event for next event triggered.
             * @param {evan.Event|*} nextOriginalEvent
             * @returns {evan.EventSpawner}
             */
            setNextOriginalEvent: function (nextOriginalEvent) {
                this.nextOriginalEvent = nextOriginalEvent;
                return this;
            },

            /**
             * Clears original event for next event triggered.
             * @returns {evan.EventSpawner}
             */
            clearNextOriginalEvent: function () {
                this.nextOriginalEvent = undefined;
                return this;
            },

            /**
             * @param {string} eventName
             * @param {*} [payload]
             * @return {evan.Event}
             */
            spawnEvent: function (eventName, payload) {
                var event = this.spawnPlainEvent(eventName);
                this._prepareEvent(event, payload);
                return event;
            }
        });

    /**
     * @name evan.EventSpawner#spawnPlainEvent
     * @function
     * @param {string} eventName
     * @returns {evan.Event}
     */
});
