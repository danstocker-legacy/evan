/*global sntls, evan, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("ValueLink");

    test("Instantiation", function () {
        var link = evan.ValueLink.create();

        ok(link.hasOwnProperty('value'), "should add value property");
    });

    test("Value setter", function () {
        var link = evan.ValueLink.create(),
            value = {};

        strictEqual(link.setValue(value), link, "should be chainable");
        strictEqual(link.value, value, "should set value property");
    });

    test("Link removal", function () {
        var link = evan.ValueLink.create(),
            afterLink = evan.ValueLink.create()
                .addAfter(link),
            beforeLink = evan.ValueLink.create()
                .addBefore(link);

        strictEqual(link.unLink(), link, "should be chainable");
        ok(!link.nextLink, "should remove nextLink");
        ok(!link.previousLink, "should remove previousLink");
        strictEqual(afterLink.previousLink, beforeLink, "should set previousLink on old next link");
        strictEqual(beforeLink.nextLink, afterLink, "should set nextLink on old previous link");
    });
}());
