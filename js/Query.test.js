/*global sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Query");

    test("URI encode", function () {
        deepEqual(
            evan.Query._encodeURI([
                ['f|o', 'b<r'],
                {},
                'baz\\'
            ]),
            [
                ['f%7Co', 'b%3Cr'],
                {},
                'baz%5C'
            ],
            "Query structure encoded"
        );
    });

    test("URI decode", function () {
        deepEqual(
            evan.Query._decodeURI([
                ['f%7Co', 'b%3Cr'],
                {},
                'baz%5C'
            ]),
            [
                ['f|o', 'b<r'],
                {},
                'baz\\'
            ],
            "Query structure decoded"
        );
    });

    test("Parsing", function () {
        var Query = evan.Query,
            query = 'foo>\\>bar>hello<world>|';

        deepEqual(
            evan.Query._parseString(query),
            ['foo', Query.WILDCARD_CONTINUATION, 'bar', ['hello', 'world'], Query.WILDCARD_ASTERISK],
            "Query parsed"
        );
    });

    test("Instantiation", function () {
        var query;

        raises(function () {
            evan.Query.create(5);
        }, "Invalid query");

        query = evan.Query.create(['hello', evan.Query.WILDCARD_ASTERISK, ['you', 'all']]);
        deepEqual(
            query.asArray,
            ['hello', evan.Query.WILDCARD_ASTERISK, ['you', 'all']],
            "Query initialized w/ array"
        );

        query = evan.Query.create('hello>|>you<all');
        deepEqual(
            query.asArray,
            ['hello', evan.Query.WILDCARD_ASTERISK, ['you', 'all']],
            "Query initialized w/ string"
        );
    });

    test("Type conversion", function () {
        var query;

        query = ['hello', evan.Query.WILDCARD_ASTERISK, ['you', 'all']].toQuery();
        deepEqual(
            query.asArray,
            ['hello', evan.Query.WILDCARD_ASTERISK, ['you', 'all']],
            "Query initialized from array"
        );

        query = 'hello>|>you<all'.toQuery();
        deepEqual(
            query.asArray,
            ['hello', evan.Query.WILDCARD_ASTERISK, ['you', 'all']],
            "Query initialized from string"
        );
    });

    test("Stem extraction", function () {
        var Query = evan.Query,
            query = Query.create(['foo', 'bar', ['hello', 'world'], Query.WILDCARD_ASTERISK]),
            result;

        result = query.getStemPath();

        ok(result.instanceOf(sntls.Path), "Stem path is class Path");
        deepEqual(result.asArray, ['foo', 'bar'], "Stem path buffer");
    });

    test("Serialization", function () {
        var Query = evan.Query,
            query = Query.create([
                'foo', Query.WILDCARD_CONTINUATION, 'bar', ['hello', 'world'], Query.WILDCARD_ASTERISK
            ]);

        equal(query.toString(), 'foo>\\>bar>hello<world>|', "Query in string form");
    });
}());
