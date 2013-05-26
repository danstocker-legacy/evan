/**
 * Event Path
 *
 * Path that points to an event target.
 */
/*global dessert, troop, sntls, evan */
troop.promise(evan, 'EventPath', function () {
    "use strict";

    /**
     * @class evan.EventPath
     * @extends sntls.Path
     */
    evan.EventPath = sntls.Path.extend()
        .addMethod(/** @lends evan.EventPath */{
            /**
             * @name evan.EventPath.create
             * @return {evan.EventPath}
             */

            /**
             * @name evan.EventPath.clone
             * @return {evan.EventPath}
             */

            /**
             * Decreases path length by one.
             */
            shrink: function () {
                this.asArray.pop();
                return this;
            }
        });
});

troop.promise(evan, 'PathCollection', function () {
    "use strict";

    /**
     * @name evan.PathCollection.create
     * @return {evan.PathCollection}
     */

    /**
     * @class evan.PathCollection
     * @extends sntls.Collection
     * @extends sntls.Path
     */
    evan.PathCollection = sntls.Collection.of(sntls.Path);
});

(function () {
    "use strict";

    var EventPath = evan.EventPath;

    dessert.addTypes(/** @lends dessert */{
        isEventPath: function (expr) {
            return EventPath.isBaseOf(expr);
        },

        isEventPathOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   EventPath.isBaseOf(expr);
        }
    });

    /**
     * @return {evan.EventPath}
     */
    String.prototype.toEventPath = function () {
        return evan.EventPath.create(this);
    };

    /**
     * @return {evan.EventPath}
     */
    Array.prototype.toEventPath = function () {
        return evan.EventPath.create(this);
    };
}());