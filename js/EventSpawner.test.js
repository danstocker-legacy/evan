/*global troop, sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("EventSpawner");

    test("Instantiation", function () {
        var eventSpawner = evan.EventSpace.create();

        ok(eventSpawner.hasOwnProperty('nextPayload'), "should add nextPayload property");
        equal(typeof eventSpawner.nextPayload, 'undefined', "should set nextPayload to undefined");
        ok(eventSpawner.hasOwnProperty('nextOriginalEvent'), "should add nextOriginalEvent property");
        equal(typeof eventSpawner.nextOriginalEvent, 'undefined', "should set nextOriginalEvent to undefined");
    });

    test("Next payload setter", function () {
        var payload = {},
            eventSpawner = evan.EventSpace.create()
                .setNextPayload(payload);

        strictEqual(eventSpawner.nextPayload, payload, "should set nextPayload");
    });

    test("Clearing next payload", function () {
        var payload = {},
            eventSpawner = evan.EventSpace.create()
                .setNextPayload(payload)
                .clearNextPayload();

        equal(typeof eventSpawner.nextPayload, 'undefined', "should set nextPayload to undefined");
    });

    test("Next original event setter", function () {
        var originalEvent = {},
            eventSpawner = evan.EventSpace.create()
                .setNextOriginalEvent(originalEvent);

        strictEqual(eventSpawner.nextOriginalEvent, originalEvent, "should set nextOriginalEvent");
    });

    test("Clearing next original event", function () {
        var payload = {},
            eventSpawner = evan.EventSpace.create('foo>bar'.toPath())
                .setNextOriginalEvent(payload)
                .clearNextOriginalEvent();

        equal(typeof eventSpawner.nextOriginalEvent, 'undefined', "should set nextOriginalEvent to undefined");
    });

    test("Spawning event", function () {
        expect(4);

        var params = {
                originalEvent: {},
                payload      : {},
                customPayload: {}
            },
            eventSpawner = evan.EventSpace.create()
                .setNextPayload(params.payload)
                .setNextOriginalEvent(params.originalEvent);

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
