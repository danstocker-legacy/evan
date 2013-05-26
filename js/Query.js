/*global dessert, troop, sntls, evan */
troop.promise(evan, 'Query', function () {
    "use strict";

    var base = sntls.Path;

    /**
     * @class evan.Query
     * @extends sntls.Path
     */
    evan.Query = base.extend()
        .addConstant(/** @lends evan.Query */{
            /**
             * Query validator regexp
             * @type {RegExp}
             */
            RE_QUERY_VALIDATOR: /^[^><]+(<[^><]+)*(>[^><]+(<[^><]+)*)*$/,

            ASTERISK: {symbol: '|'},

            CONTINUATION: {symbol: '\\'}
        })
        .addPrivateMethod(/** @lends evan.Query */{
            /**
             * URI decodes all items of an array.
             * @param {Array} asArray Array of URI-encoded strings, sub-arrays, or objects
             * @return {Array} Array w/ all strings within URI-encoded
             * @private
             */
            _encodeURI: function (asArray) {
                var result = [],
                    i, key;
                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (key instanceof Array) {
                        result.push(this._encodeURI(key));
                    } else if (typeof key === 'string') {
                        result.push(encodeURI(key));
                    } else {
                        result.push(key);
                    }
                }
                return result;
            },

            /**
             * URI decodes all items of an array.
             * @param {Array} asArray Array of URI-encoded strings, sub-arrays, or objects
             * @return {Array} Array w/ all strings within URI-decoded
             * @private
             */
            _decodeURI: function (asArray) {
                var result = [],
                    i, key;
                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (key instanceof Array) {
                        result.push(this._decodeURI(key));
                    } else if (typeof key === 'string') {
                        result.push(decodeURI(key));
                    } else {
                        result.push(key);
                    }
                }
                return result;
            }
        })
        .addMethod(/** @lends evan.Query */{
            /**
             * Extracts the longest fixed stem path from the query.
             * The stem may not contain any wildcards, or other
             * query expressions, only specific keys.
             * @return {sntls.Path}
             */
            getStemPath: function () {
                var asArray = this.asArray,
                    result = [],
                    i, key;
                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (typeof key === 'string') {
                        result.push(key);
                    } else {
                        break;
                    }
                }
                return Path.create(result);
            }
        });
});

(function () {
    "use strict";

    var Query = evan.Query;

    dessert.addTypes(/** @lends dessert */{
        isQueryString: function (expr) {
            return this.isString(expr) &&
                   Query.RE_QUERY_VALIDATOR.test(expr);
        },

        isQuery: function (expr) {
            return Query.isBaseOf(expr);
        },

        isQueryOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   Query.isBaseOf(expr);
        }
    });
}());
