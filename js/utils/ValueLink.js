/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'ValueLink', function () {
    "use strict";

    var base = evan.Link,
        self = base.extend();

    /**
     * Creates a ValueLink instance.
     * @name evan.ValueLink.create
     * @function
     * @returns {evan.ValueLink}
     */

    /**
     * Link that carries a value, and has the option to be unlinked.
     * @class
     * @extends evan.Link
     */
    evan.ValueLink = self
        .addMethods(/** @lends evan.ValueLink# */{
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
             * @returns {evan.ValueLink}
             */
            setValue: function (value) {
                this.value = value;
                return this;
            },

            /**
             * Removes link from the chain.
             * @returns {evan.ValueLink}
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
