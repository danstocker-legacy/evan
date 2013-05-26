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

            /**
             * Wildcard matching any key on a single level.
             * @type {object}
             */
            WILDCARD_ASTERISK: {symbol: '|'},

            /**
             * Wildcard for matching any key on this level
             * and any following levels until the next key is matched.
             * @type {object}
             */
            WILDCARD_CONTINUATION: {symbol: '\\'}
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
            },

            /**
             * Parses string representation of query and returns an array.
             * @param {string} query
             * @return {Array}
             * @private
             */
            _parseString: function (query) {
                var result = query.split('>'),
                    i, key;

                for (i = 0; i < result.length; i++) {
                    key = result[i];
                    switch (key) {
                    case '|':
                        result[i] = this.WILDCARD_ASTERISK;
                        break;
                    case '\\':
                        result[i] = this.WILDCARD_CONTINUATION;
                        break;
                    default:
                        if (key.indexOf('<') > -1) {
                            result[i] = key.split('<');
                        }
                        break;
                    }
                }

                return result;
            }
        })
        .addMethod(/** @lends evan.Query */{
            /**
             * @name evan.Query.create
             * @return {evan.Query}
             */

            /**
             * @param {Array|string} query
             */
            init: function (query) {
                var asArray = dessert.validators.isString(query) ?
                    this._parseString(query) :
                    query;

                // calling base w/ array only
                // base class handles assertions
                base.init.call(this, asArray);
            },

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

                // stopping at first non-string key
                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (typeof key === 'string') {
                        result.push(key);
                    } else {
                        break;
                    }
                }

                return base.create(result);
            },

            toString: function () {
                var asArray = this._encodeURI(this.asArray),
                    result = [],
                    i, key;

                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (key instanceof Array) {
                        // optional keys
                        result.push(key.join('<'));
                    } else if (key instanceof Object) {
                        // wildcard key
                        result.push(key.symbol);
                    } else {
                        result.push(key);
                    }
                }

                return result.join('>');
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

    /**
     * @return {evan.Query}
     */
    String.prototype.toQuery = function () {
        return Query.create(this);
    };

    /**
     * @return {evan.Query}
     */
    Array.prototype.toQuery = function () {
        return Query.create(this);
    };
}());
