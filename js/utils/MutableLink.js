/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'MutableLink', function () {
    "use strict";

    var base = evan.Link,
        self = base.extend();

    /**
     * @name evan.MutableLink.create
     * @function
     * @returns {evan.MutableLink}
     */

    /**
     * Link in a cain structure.
     * @class
     * @extends evan.Link
     */
    evan.MutableLink = self
        .addMethods(/** @lends evan.MutableLink# */{
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
            remove: function () {
                this.afterLink.beforeLink = this.beforeLink;
                this.beforeLink.afterLink = this.afterLink;

                this.beforeLink = undefined;
                this.afterLink = undefined;

                return this;
            }
        });
});
