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
     * Stores events in a quasi-stack structure.
     *
     * @class
     * @extends troop.Base
     */
    evan.EventStack = self
        .addMethods(/** @lends evan.EventStack# */{
            /**
             * @ignore
             */
            init: function () {
                /** @type {evan.OpenChain} */
                this.events = evan.OpenChain.create();
            },

            /**
             * Adds an event to the stack.
             * @param {evan.Event|*} event
             * @returns {evan.ValueLink}
             */
            pushEvent: function (event) {
                var link = evan.ValueLink.create().setValue(event);
                this.events.pushLink(link);
                return link;
            },

            /**
             * Retrieves the last added event from the stack.
             * @returns {evan.Event|*}
             */
            getLastEvent: function () {
                return this.events.lastLink.previousLink.value;
            }
        });
});
