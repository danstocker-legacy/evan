/*global sntls, evan, module, test, expect, ok, equal, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("EventPropertyStack");

    test("Instantiation", function () {
        var eventPropertyStack = evan.EventPropertyStack.create();

        deepEqual(eventPropertyStack.payloadStack, [], "should set payloadStack property");
        deepEqual(eventPropertyStack.originalEventStack, [], "should set originalEventStack property");
    });

    test("Pushing payload", function () {
        var payload = {},
            eventPropertyStack = evan.EventPropertyStack.create()
                .pushPayload(payload);

        deepEqual(eventPropertyStack.payloadStack, [payload], "should add payload to stack");
    });

    test("Popping payload", function () {
        var payload = {},
            eventPropertyStack = evan.EventPropertyStack.create()
                .pushPayload(payload);

        strictEqual(eventPropertyStack.popPayload(), payload, "should return removed payload");
        deepEqual(eventPropertyStack.payloadStack, [], "should remove payload from stack");
    });

    test("Getting next payload", function () {
        var payload = {},
            eventPropertyStack = evan.EventPropertyStack.create()
                .pushPayload(payload);

        strictEqual(eventPropertyStack.getNextPayload(), payload,
            "should return last added payload");
        deepEqual(eventPropertyStack.payloadStack, [payload],
            "should NOT remove payload from stack");
    });

    test("Pushing original event", function () {
        var originalEvent = {},
            eventPropertyStack = evan.EventPropertyStack.create()
                .pushOriginalEvent(originalEvent);

        deepEqual(eventPropertyStack.originalEventStack, [originalEvent], "should add original event to stack");
    });

    test("Popping original event", function () {
        var originalEvent = {},
            eventPropertyStack = evan.EventPropertyStack.create('foo>bar'.toPath())
                .pushOriginalEvent(originalEvent);

        strictEqual(eventPropertyStack.popOriginalEvent(), originalEvent, "should return removed payload");
        deepEqual(eventPropertyStack.originalEventStack, [], "should remove original event from stack");
    });

    test("Getting next original event", function () {
        var originalEvent = {},
            eventPropertyStack = evan.EventPropertyStack.create()
                .pushOriginalEvent(originalEvent);

        strictEqual(eventPropertyStack.getNextOriginalEvent(), originalEvent,
            "should return last added original event");
        deepEqual(eventPropertyStack.originalEventStack, [originalEvent],
            "should NOT remove original event from stack");
    });
}());
