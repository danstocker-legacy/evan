/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'EventPropertyStack', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * Creates an EventPropertyStack instance.
     * Creating your own EventPropertyStack instance is rarely needed.
     * Use evan.eventPropertyStack instead.
     * @name evan.EventPropertyStack.create
     * @function
     * @returns {evan.EventPropertyStack}
     * @see evan.eventPropertyStack
     */

    /**
     * Maintains a stack of payloads and original events.
     * @class
     * @extends troop.Base
     */
    evan.EventPropertyStack = self
        .addMethods(/** @lends evan.EventPropertyStack# */{
            /**
             * @ignore
             */
            init: function () {
                /**
                 * Stack of payloads to be assigned to triggered events.
                 * @type {Array}
                 */
                this.payloadStack = [];

                /**
                 * Stack of original events to be assigned to triggered events.
                 * @type {evan.Event[]|Array}
                 */
                this.originalEventStack = [];
            },

            /**
             * Adds a payload to the payload stack.
             * @param {*} payload
             * @returns {evan.EventPropertyStack}
             */
            pushPayload: function (payload) {
                this.payloadStack.unshift(payload);
                return this;
            },

            /**
             * Removes and returns the last added payload from the payload stack.
             * @returns {evan.Event|*}
             */
            popPayload: function () {
                return this.payloadStack.shift();
            },

            /**
             * Retrieves last added item from the payload stack.
             * @returns {*}
             */
            getNextPayload: function () {
                return this.payloadStack[0];
            },

            /**
             * Adds an original event to the original event stack.
             * @param {evan.Event|*} originalEvent
             * @returns {evan.EventPropertyStack}
             */
            pushOriginalEvent: function (originalEvent) {
                this.originalEventStack.unshift(originalEvent);
                return this;
            },

            /**
             * Removes and returns the last added original event from the original event stack.
             * @returns {evan.Event|*}
             */
            popOriginalEvent: function () {
                return this.originalEventStack.shift();
            },

            /**
             * Retrieves last added item from the original event stack.
             * @returns {evan.Event|*}
             */
            getNextOriginalEvent: function () {
                return this.originalEventStack[0];
            }
        });
});
