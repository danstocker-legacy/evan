/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'OpenChain', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * @name evan.OpenChain.create
     * @function
     * @returns {evan.OpenChain}
     */

    /**
     * OpenChain data structure.
     * @class
     * @extends troop.Base
     */
    evan.OpenChain = self
        .addMethods(/** @lends evan.OpenChain# */{
            /** @ignore */
            init: function () {
                /**
                 * First link in the chain.
                 * @type {evan.MutableLink}
                 */
                this.firstLink = evan.Link.create();

                /**
                 * Last link in the chain.
                 * @type {evan.MutableLink}
                 */
                this.lastLink = evan.Link.create()
                    .addAfter(this.firstLink);
            },

            /**
             * Adds link at the end of the chain.
             * @param {evan.MutableLink} link
             */
            pushLink: function (link) {
                link.addBefore(this.lastLink);
                return this;
            },

            /**
             * Removes link from the end of the chain and returns removed link.
             * @returns {evan.MutableLink}
             */
            popLink: function () {
                return this.lastLink.beforeLink
                    .remove();
            },

            /**
             * Adds link at the start of the chain.
             * @param {evan.MutableLink} link
             */
            unshiftLink: function (link) {
                link.addAfter(this.firstLink);
                return this;
            },

            /**
             * Removes link from the start of the chain and returns removed link.
             * @returns {evan.MutableLink}
             */
            shiftLink: function () {
                return this.firstLink.afterLink
                    .remove();
            }
        });
});
