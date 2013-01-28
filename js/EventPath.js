/**
 * Event Path
 *
 * Path that points to an event target.
 */
/*global dessert, troop, evan */
troop.promise('evan.EventPath', function () {
    var base = troop.Base,
        self;

    dessert.addTypes({
        isEventPath: function (expr) {
            return self.isPrototypeOf(expr);
        },

        isEventPathOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   self.isPrototypeOf(expr);
        }
    });

    self = evan.EventPath = base.extend()
        .addConstant({
            RE_PATH_SEPARATOR: /\./
        })
        .addMethod({
            /**
             * @constructor
             * @path {string|string[]}
             */
            init: function (path) {
                var sPath, aPath;

                if (dessert.isArray(path, true)) {
                    sPath = path.join('.');
                    aPath = path;
                } else if (dessert.isString(path, true)) {
                    sPath = path,
                    aPath = path.split(self.RE_PATH_SEPARATOR);
                } else {
                    dessert.assert(false, "Invalid path");
                }

                this.addPublic({
                    asArray : aPath,
                    asString: sPath
                });
            },

            /**
             * Matches path to current path.
             * @param path {EventPath}
             * @return {boolean}
             */
            match: function (path) {
                dessert.isEventPath(path);

                return this.asString === path.asString;
            },

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
