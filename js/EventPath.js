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
             * Clones event path instance
             * @return {evan.EventPath}
             */
            clone: function () {
                return this.getBase().create(this.asArray.concat());
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

troop.promise(evan, 'EventPathCollection', function () {
    /**
     * @class evan.EventPathCollection
     * @extends sntls.Collection
     * @extends evan.EventPath
     */
    evan.EventPathCollection = sntls.Collection.of(evan.EventPath);
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
