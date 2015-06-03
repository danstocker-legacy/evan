/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'OpenChain', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * Creates an OpenChain instance.
     * @name evan.OpenChain.create
     * @function
     * @returns {evan.OpenChain}
     */

    /**
     * Chain data structure with two fixed ends and value carrying links in between.
     * OpenChain behaves like a stack in that you may append and prepend the chain
     * using a stack-like API. (push, pop, etc.)
     * @class
     * @extends troop.Base
     */
    evan.OpenChain = self
        .addMethods(/** @lends evan.OpenChain# */{
            /** @ignore */
            init: function () {
                /**
                 * First (fixed) link in the chain.
                 * @type {evan.ValueLink}
                 */
                this.firstLink = evan.Link.create();

                /**
                 * Last (fixed) link in the chain.
                 * @type {evan.ValueLink}
                 */
                this.lastLink = evan.Link.create()
                    .addAfter(this.firstLink);
            },

            /**
             * Adds link at the end of the chain.
             * @param {evan.Link} link
             */
            pushLink: function (link) {
                link.addBefore(this.lastLink);
                return this;
            },

            /**
             * Removes link from the end of the chain and returns removed link.
             * @returns {evan.Link}
             */
            popLink: function () {
                return this.lastLink.previousLink
                    .unLink();
            },

            /**
             * Adds link at the start of the chain.
             * @param {evan.Link} link
             */
            unshiftLink: function (link) {
                link.addAfter(this.firstLink);
                return this;
            },

            /**
             * Removes link from the start of the chain and returns removed link.
             * @returns {evan.Link}
             */
            shiftLink: function () {
                return this.firstLink.nextLink
                    .unLink();
            },

            /**
             * Retrieves the values stored in the chain's links as an array.
             * O(n) complexity.
             * @returns {Array}
             */
            getValues: function () {
                var link = this.firstLink.nextLink,
                    result = [];

                while (link !== this.lastLink) {
                    result.push(link.value);
                    link = link.nextLink;
                }

                return result;
            }
        });
});
