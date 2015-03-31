/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'EventStack', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * @name evan.EventStack.create
     * @function
     * @returns {evan.EventStack}
     */

    /**
     * Stores events in a stack structure.
     * @class
     * @extends troop.Base
     */
    evan.EventStack = self
        .addMethods(/** @lends evan.EventStack# */{
            /**
             * @ignore
             */
            init: function () {
                this.events = [];
            },

            /**
             * Adds an event to the stack.
             * @param {evan.Event|*} event
             * @returns {evan.EventStack}
             */
            pushEvent: function (event) {
                this.events.unshift(event);
                return this;
            },

            /**
             * Removes the last added event from the stack.
             * @returns {evan.Event|*}
             */
            popEvent: function () {
                return this.events.shift();
            },

            /**
             * Retrieves the first event from the stack.
             * @returns {evan.Event|*}
             */
            getFirstEvent: function () {
                return this.events[0];
            }
        });
});
