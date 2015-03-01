/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'EventSpaceCollection', function () {
    "use strict";

    var base = sntls.Collection.of(evan.EventSpace),
        self = base.extend();

    /**
     * @name evan.EventSpaceCollection.create
     * @function
     * @param {object|evan.EventSpace[]} [items]
     * @returns {evan.EventSpaceCollection}
     */

    /**
     * @class
     * @extends troop.Base
     */
    evan.EventSpaceCollection = self
        .addMethods(/** @lends evan.EventSpaceCollection# */{
            /**
             * @param {object|evan.EventSpace[]} [items]
             * @ignore
             */
            init: function (items) {
                base.init.call(this, items);

                /**
                 * Stack of payloads to be assigned to triggered events.
                 * @type {*[]}
                 */
                this.payloadStack = [];

                /**
                 * Stack of original events to be assigned to triggered events.
                 * @type {evan.Event[]|*[]}
                 */
                this.originalEventStack = [];
            },

            /**
             * Adds a payload to the payload stack.
             * @param {*} payload
             * @returns {evan.EventSpaceCollection}
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
             * @returns {evan.EventSpaceCollection}
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
