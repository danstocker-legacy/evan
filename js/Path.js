/**
 * Event Path
 *
 * Path that points to an event target.
 */
/*global dessert, troop, evan */
troop.promise(evan, 'Path', function () {
    var base = troop.Base,
        self;

    self = evan.Path = base.extend()
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

                if (path instanceof Array) {
                    sPath = path.join('.');
                    aPath = path;
                } else if (typeof path === 'string') {
                    sPath = path;
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
             * Resolves a path relative to the supplied context.
             * @param {object} context
             * @return {*}
             */
            resolve: function (context) {
                dessert.isObject(context);

                var result = context,
                    path = this.asArray.concat();

                while (path.length) {
                    result = result[path.shift()];
                    if (typeof result === 'undefined') {
                        break;
                    }
                }

                return result;
            },

            /**
             * Builds a path relative to the supplied context
             * and returns the object found at the end.
             * @param {object} context
             */
            build: function (context) {
                dessert.isObject(context);

                var result = context,
                    path = this.asArray,
                    key;

                while (path.length) {
                    key = path.shift();
                    if (typeof result[key] !== 'object') {
                        result[key] = {};
                    }
                    result = result[key];
                }

                return result;
            },

            /**
             * Matches path to current path.
             * @param {Path} path
             * @return {boolean}
             */
            match: function (path) {
                dessert.isPath(path);

                return this.asString === path.asString;
            }
        });
});

dessert.addTypes({
    isPath: function (expr) {
        return evan.Path.isBaseOf(expr);
    },

    isPathOptional: function (expr) {
        return typeof expr === 'undefined' ||
               evan.Path.isBaseOf(expr);
    }
});
