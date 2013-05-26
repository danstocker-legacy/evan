/*global sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Query");

    test("URI encode", function () {
        deepEqual(
            evan.Query._encodeURI([['f|o', 'b<r'], {}, 'baz\\']),
            [['f%7Co', 'b%3Cr'], {}, 'baz%5C'],
            "Query structure encoded"
        );
    });

    test("URI decode", function () {
        deepEqual(
            evan.Query._decodeURI([['f%7Co', 'b%3Cr'], {}, 'baz%5C']),
            [['f|o', 'b<r'], {}, 'baz\\'],
            "Query structure decoded"
        );
    });
}());
