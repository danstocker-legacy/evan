/**
 * General Path
 *
 * Represents a composite linear key, essentially
 * an array, or a dot-separated string.
 */
/*global dessert, troop, evan */
troop.promise(evan, 'Path', function () {
    /**
     * @class evan.Path
     * @extends troop.Base
     */
    evan.Path = troop.Base.extend()
        .addConstant(/** @lends evan.Path */{
            RE_PATH_SEPARATOR: /\./
        })
        .addMethod(/** @lends evan.Path */{
            /**
             * @path {string|string[]}
             */
            init: function (path) {
                var sPath, aPath;

                // array representation is expected to be used more often
                if (path instanceof Array) {
                    sPath = path.join('.');
                    aPath = path;
                } else if (typeof path === 'string') {
                    sPath = path;
                    aPath = path.split(this.RE_PATH_SEPARATOR);
                } else {
                    dessert.assert(false, "Invalid path");
                }

                this.addPublic(/** @lends evan.Path */{
                    /**
                     * @type {Array}
                     */
                    asArray : aPath,

                    /**
                     * @type {string}
                     */
                    asString: sPath
                });
            },

            /**
             * Resolves a path relative to the supplied context.
             * @param {object} context
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
             * Same as .resolve(), but builds the path if it does not exist
             * and returns the object found at the end.
             * @see {evan.Path.resolve}
             * @param {object} context
             */
            resolveOrBuild: function (context) {
                dessert.isObject(context);

                var result = context,
                    path = this.asArray.concat(),
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
             * Matches remote path to current path.
             * @param {evan.Path} remotePath Remote path
             * @return {boolean}
             */
            equal: function (remotePath) {
                return this.getBase().isBaseOf(remotePath) &&
                       this.asString === remotePath.asString;
            }
        });
});

dessert.addTypes(/** @lends dessert */{
    isPath: function (expr) {
        return evan.Path.isBaseOf(expr);
    },

    isPathOptional: function (expr) {
        return typeof expr === 'undefined' ||
               evan.Path.isBaseOf(expr);
    }
});
