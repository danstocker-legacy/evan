/**
 * Event Path
 *
 * Path that points to an event target.
 */
/*global dessert, troop, evan */
troop.promise(evan, 'EventPath', function () {
    var base = evan.Path,
        self;

    self = evan.EventPath = base.extend()
        .addMethod({
            /**
             * Decreases path length by one.
             */
            shrink: function () {
                this.asArray.pop();
                this.asString = this.asArray.join('.');

                return this;
            }
        });
});

dessert.addTypes({
    isEventPath: function (expr) {
        return evan.EventPath.isBaseOf(expr);
    },

    isEventPathOptional: function (expr) {
        return typeof expr === 'undefined' ||
               evan.EventPath.isBaseOf(expr);
    }
});
