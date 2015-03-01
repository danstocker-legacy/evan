/*global sntls, evan, module, test, expect, ok, equal, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("EventSpaceCollection");

    test("Instantiation", function () {
        var eventSpaceCollection = evan.EventSpaceCollection.create();

        deepEqual(eventSpaceCollection.payloadStack, [], "should set payloadStack property");
        deepEqual(eventSpaceCollection.originalEventStack, [], "should set originalEventStack property");
    });

    test("Pushing payload", function () {
        var payload = {},
            eventSpaceCollection = evan.EventSpaceCollection.create()
                .pushPayload(payload);

        deepEqual(eventSpaceCollection.payloadStack, [payload], "should add payload to stack");
    });

    test("Popping payload", function () {
        var payload = {},
            eventSpaceCollection = evan.EventSpaceCollection.create()
                .pushPayload(payload);

        strictEqual(eventSpaceCollection.popPayload(), payload, "should return removed payload");
        deepEqual(eventSpaceCollection.payloadStack, [], "should remove payload from stack");
    });

    test("Getting next payload", function () {
        var payload = {},
            eventSpaceCollection = evan.EventSpaceCollection.create()
                .pushPayload(payload);

        strictEqual(eventSpaceCollection.getNextPayload(), payload,
            "should return last added payload");
        deepEqual(eventSpaceCollection.payloadStack, [payload],
            "should NOT remove payload from stack");
    });

    test("Pushing original event", function () {
        var originalEvent = {},
            eventSpaceCollection = evan.EventSpaceCollection.create()
                .pushOriginalEvent(originalEvent);

        deepEqual(eventSpaceCollection.originalEventStack, [originalEvent], "should add original event to stack");
    });

    test("Popping original event", function () {
        var originalEvent = {},
            eventSpaceCollection = evan.EventSpaceCollection.create('foo>bar'.toPath())
                .pushOriginalEvent(originalEvent);

        strictEqual(eventSpaceCollection.popOriginalEvent(), originalEvent, "should return removed payload");
        deepEqual(eventSpaceCollection.originalEventStack, [], "should remove original event from stack");
    });

    test("Getting next original event", function () {
        var originalEvent = {},
            eventSpaceCollection = evan.EventSpaceCollection.create()
                .pushOriginalEvent(originalEvent);

        strictEqual(eventSpaceCollection.getNextOriginalEvent(), originalEvent,
            "should return last added original event");
        deepEqual(eventSpaceCollection.originalEventStack, [originalEvent],
            "should NOT remove original event from stack");
    });
}());
