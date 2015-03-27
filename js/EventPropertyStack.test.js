/*global sntls, evan, module, test, expect, ok, equal, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("EventPropertyStack");

    test("Instantiation", function () {
        var eventPropertyStack = evan.EventPropertyStack.create();

        deepEqual(eventPropertyStack.originalEvents, [], "should set originalEvents property");
    });

    test("Pushing original event", function () {
        var originalEvent = {},
            eventPropertyStack = evan.EventPropertyStack.create()
                .pushOriginalEvent(originalEvent);

        deepEqual(eventPropertyStack.originalEvents, [originalEvent], "should add original event to stack");
    });

    test("Popping original event", function () {
        var originalEvent = {},
            eventPropertyStack = evan.EventPropertyStack.create('foo>bar'.toPath())
                .pushOriginalEvent(originalEvent);

        strictEqual(eventPropertyStack.popOriginalEvent(), originalEvent, "should return removed payload");
        deepEqual(eventPropertyStack.originalEvents, [], "should remove original event from stack");
    });

    test("Getting next original event", function () {
        var originalEvent = {},
            eventPropertyStack = evan.EventPropertyStack.create()
                .pushOriginalEvent(originalEvent);

        strictEqual(eventPropertyStack.getNextOriginalEvent(), originalEvent,
            "should return last added original event");
        deepEqual(eventPropertyStack.originalEvents, [originalEvent],
            "should NOT remove original event from stack");
    });
}());
