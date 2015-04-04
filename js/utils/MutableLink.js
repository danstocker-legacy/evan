/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'MutableLink', function () {
    "use strict";

    var base = evan.Link,
        self = base.extend();

    /**
     * Creates a MutableLink instance.
     * @name evan.MutableLink.create
     * @function
     * @returns {evan.MutableLink}
     */

    /**
     * Link that carries a value, and has the option to be unlinked.
     * @class
     * @extends evan.Link
     */
    evan.MutableLink = self
        .addMethods(/** @lends evan.MutableLink# */{
            /** @ignore */
            init: function () {
                base.init.call(this);

                /**
                 * Value associated with link.
                 * @type {*}
                 */
                this.value = undefined;
            },

            /**
             * Sets link value.
             * @param {*} value
             * @returns {evan.MutableLink}
             */
            setValue: function (value) {
                this.value = value;
                return this;
            },

            /**
             * Removes link from the chain.
             * @returns {evan.MutableLink}
             */
            unLink: function () {
                this.afterLink.beforeLink = this.beforeLink;
                this.beforeLink.afterLink = this.afterLink;

                this.beforeLink = undefined;
                this.afterLink = undefined;

                return this;
            }
        });
});
