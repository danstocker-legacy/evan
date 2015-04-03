/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'EndLink', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * @name evan.EndLink.create
     * @function
     * @returns {evan.EndLink}
     */

    /**
     * Serves as end link in an open chain or master link in a closed chain.
     * Cannot be added to, or removed from other links, but other links can be added to / removed from it.
     * @class
     * @extends troop.Base
     */
    evan.EndLink = self
        .addMethods(/** @lends evan.EndLink# */{
            /** @ignore */
            init: function () {
                /**
                 * Link that comes before the current link in the chain.
                 * @type {evan.EndLink}
                 */
                this.linkBefore = undefined;

                /**
                 * Link that comes after the current link in the chain.
                 * @type {evan.EndLink}
                 */
                this.linkAfter = undefined;
            },

            /**
             * Adds current link after the specified link.
             * @param {evan.EndLink} beforeLink
             * @returns {evan.EndLink}
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
             * @param {evan.EndLink} afterLink
             * @returns {evan.EndLink}
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
