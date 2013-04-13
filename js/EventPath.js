/**
 * Event Path
 *
 * Path that points to an event target.
 */
/*global dessert, troop, sntls, evan */
troop.promise(evan, 'EventPath', function () {
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
             * @param {string|string[]|sntls.Path} [path]
             */
            init: function (path) {
                var asArray = path;

                if (sntls.Path.isBaseOf(path)) {
                    asArray = path.asArray.concat();
                }

                sntls.Path.init.call(this, asArray);
            },

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

dessert.addTypes(/** @lends dessert */{
    isEventPath: function (expr) {
        return evan.EventPath.isBaseOf(expr);
    },

    isEventPathOptional: function (expr) {
        return typeof expr === 'undefined' ||
               evan.EventPath.isBaseOf(expr);
    }
});
