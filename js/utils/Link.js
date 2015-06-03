/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'Link', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * Creates a Link instance.
     * @name evan.Link.create
     * @function
     * @returns {evan.Link}
     */

    /**
     * Basic link, can chain other links to it.
     * @class
     * @extends troop.Base
     */
    evan.Link = self
        .addMethods(/** @lends evan.Link# */{
            /** @ignore */
            init: function () {
                /**
                 * Link that comes before the current link in the chain.
                 * @type {evan.Link}
                 */
                this.previousLink = undefined;

                /**
                 * Link that comes after the current link in the chain.
                 * @type {evan.Link}
                 */
                this.nextLink = undefined;
            },

            /**
             * Adds current link after the specified link.
             * @param {evan.Link} link
             * @returns {evan.Link}
             */
            addAfter: function (link) {
                // setting links on current link
                this.previousLink = link;
                this.nextLink = link.nextLink;

                // setting self as previous link on old next link
                if (link.nextLink) {
                    link.nextLink.previousLink = this;
                }

                // setting self as next link on target link
                link.nextLink = this;

                return this;
            },

            /**
             * Adds current link before the specified link.
             * @param {evan.Link} link
             * @returns {evan.Link}
             */
            addBefore: function (link) {
                // setting links on current link
                this.nextLink = link;
                this.previousLink = link.previousLink;

                // setting self as next link on old previous link
                if (link.previousLink) {
                    link.previousLink.nextLink = this;
                }

                // setting self as previous link on target link
                link.previousLink = this;

                return this;
            },

            /**
             * Removes link from the chain.
             * @returns {evan.Link}
             */
            unLink: function () {
                this.nextLink.previousLink = this.previousLink;
                this.previousLink.nextLink = this.nextLink;

                this.previousLink = undefined;
                this.nextLink = undefined;

                return this;
            }
        });
});
