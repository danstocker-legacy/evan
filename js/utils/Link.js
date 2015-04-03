/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'Link', function () {
    "use strict";

    var base = evan.EndLink,
        self = base.extend();

    /**
     * @name evan.Link.create
     * @function
     * @returns {evan.Link}
     */

    /**
     * Link in a OpenChain structure.
     * @class
     * @extends evan.EndLink
     */
    evan.Link = self
        .addMethods(/** @lends evan.Link# */{
            /** @ignore */
            init: function () {
                base.init.call(this);

                /**
                 * Payload associated with link.
                 * @type {*}
                 */
                this.value = undefined;
            },

            /**
             * Sets link value.
             * @param {*} value
             * @returns {evan.Link}
             */
            setValue: function (value) {
                this.value = value;
                return this;
            },

            /**
             * Removes link from the chain.
             * @returns {evan.Link}
             */
            remove: function () {
                this.afterLink.beforeLink = this.beforeLink;
                this.beforeLink.afterLink = this.afterLink;

                this.beforeLink = undefined;
                this.afterLink = undefined;

                return this;
            }
        });
});
