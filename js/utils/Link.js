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

                /**
                 * Chain instance the link is associated with.
                 * @type {evan.OpenChain}
                 */
                this.parentChain = undefined;
            },

            /**
             * Adds current unconnected link after the specified link.
             * @param {evan.Link} link
             * @returns {evan.Link}
             */
            addAfter: function (link) {
                dessert.assert(!this.previousLink && !this.nextLink,
                    "Attempted to connect already connected link");

                // setting links on current link
                this.previousLink = link;
                this.nextLink = link.nextLink;
                this.parentChain = link.parentChain;

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
                dessert.assert(!this.previousLink && !this.nextLink,
                    "Attempted to connect already connected link");

                // setting links on current link
                this.nextLink = link;
                this.previousLink = link.previousLink;
                this.parentChain = link.parentChain;

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
                var nextLink = this.nextLink,
                    previousLink = this.previousLink;

                if (nextLink) {
                    nextLink.previousLink = previousLink;
                }
                if (previousLink) {
                    previousLink.nextLink = nextLink;
                }

                this.previousLink = undefined;
                this.nextLink = undefined;
                this.parentChain = undefined;

                return this;
            },

            /**
             * Sets the parent chain on unconnected links.
             * Fails when called on connected links.
             * @param {evan.OpenChain} parentChain
             * @returns {evan.Link}
             */
            setParentChain: function (parentChain) {
                dessert.assert(!this.previousLink && !this.nextLink,
                    "Attempted to set parent chain on connected link");
                this.parentChain = parentChain;
                return this;
            }
        });
});
