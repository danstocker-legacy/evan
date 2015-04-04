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
        ok(!link.afterLink, "should remove afterLink");
        ok(!link.beforeLink, "should remove beforeLink");
        strictEqual(afterLink.beforeLink, beforeLink, "should set beforeLink on old after link");
        strictEqual(beforeLink.afterLink, afterLink, "should set afterLink on old before link");
    });
}());
