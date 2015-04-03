/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'Link', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * @name evan.Link.create
     * @function
     * @returns {evan.Link}
     */

    /**
     * Serves as end link in an open chain or master link in a closed chain.
     * Cannot be added to, or removed from other links, but other links can be added to / removed from it.
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
                this.linkBefore = undefined;

                /**
                 * Link that comes after the current link in the chain.
                 * @type {evan.Link}
                 */
                this.linkAfter = undefined;
            },

            /**
             * Adds current link after the specified link.
             * @param {evan.Link} beforeLink
             * @returns {evan.Link}
             */
            addAfter: function (beforeLink) {
                // setting links on current link
                this.beforeLink = beforeLink;
                this.afterLink = beforeLink.afterLink;

                // setting self as before link on old after link
                if (beforeLink.afterLink) {
                    beforeLink.afterLink.beforeLink = this;
                }

                // setting self as after link on old before link
                beforeLink.afterLink = this;

                return this;
            },

            /**
             * Adds current link before the specified link.
             * @param {evan.Link} afterLink
             * @returns {evan.Link}
             */
            addBefore: function (afterLink) {
                // setting links on current link
                this.afterLink = afterLink;
                this.beforeLink = afterLink.beforeLink;

                // setting self as after link on old before link
                if (afterLink.beforeLink) {
                    afterLink.beforeLink.afterLink = this;
                }

                // setting self as before link on old after link
                afterLink.beforeLink = this;

                return this;
            }
        });
});
