/*global troop, sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("EventSpawner");

    test("Instantiation", function () {
        var eventSpawner = evan.EventSpace.create();

        deepEqual(eventSpawner.payloadStack, [], "should set payloadStack property");
        deepEqual(eventSpawner.originalEventStack, [], "should set originalEventStack property");
    });

    test("Next payload setter", function () {
        var payload = {},
            eventSpawner = evan.EventSpace.create()
                .pushPayload(payload);

        deepEqual(eventSpawner.payloadStack, [payload], "should add payload to stack");
    });

    test("Clearing next payload", function () {
        var payload = {},
            eventSpawner = evan.EventSpace.create()
                .pushPayload(payload);

        strictEqual(eventSpawner.popPayload(), payload, "should return removed payload");
        deepEqual(eventSpawner.payloadStack, [], "should remove payload from stack");
    });

    test("Next original event setter", function () {
        var originalEvent = {},
            eventSpawner = evan.EventSpace.create()
                .pushOriginalEvent(originalEvent);

        deepEqual(eventSpawner.originalEventStack, [originalEvent], "should add original event to stack");
    });

    test("Clearing next original event", function () {
        var originalEvent = {},
            eventSpawner = evan.EventSpace.create('foo>bar'.toPath())
                .pushOriginalEvent(originalEvent);

        strictEqual(eventSpawner.popOriginalEvent(), originalEvent, "should return removed payload");
        deepEqual(eventSpawner.originalEventStack, [], "should remove original event from stack");
    });

    test("Spawning event", function () {
        expect(4);

        var params = {
                originalEvent: {},
                payload      : {},
                customPayload: {}
            },
            eventSpawner = evan.EventSpace.create()
                .pushPayload(params.payload)
                .pushOriginalEvent(params.originalEvent);

        eventSpawner
            .addMocks({
                _prepareEvent: function (event, payload) {
                    params.event = event;
                    ok(event.isA(evan.Event), "should prepare spawned event");
                    equal(typeof payload, 'undefined', "should pass undefined as payload to preparation");
                }
            });

        strictEqual(eventSpawner.spawnEvent('event-name'), params.event, "should return spawned event");

        eventSpawner
            .removeMocks()
            .addMocks({
                _prepareEvent: function (event, payload) {
                    strictEqual(payload, params.customPayload,
                        "should pass custom payload to preparation when specified");
                }
            });

        eventSpawner.spawnEvent('event-name', params.customPayload);
    });
}());
