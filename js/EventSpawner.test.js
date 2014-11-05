/*global troop, sntls, e$, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("EventSpawner");

    var eventSpace = e$.EventSpace.create(),
        EventSpawner = troop.Base.extend()
            .addTrait(e$.EventSpawner)
            .addMethods({
                init: function () {
                    e$.EventSpawner.init.call(this);
                },

                spawnPlainEvent: function (eventName) {
                    return e$.Event.create(eventName, eventSpace);
                }
            });

    test("Instantiation", function () {
        var eventSpawner = EventSpawner.create();

        ok(eventSpawner.hasOwnProperty('nextPayload'), "should add nextPayload property");
        equal(typeof eventSpawner.nextPayload, 'undefined', "should set nextPayload to undefined");
        ok(eventSpawner.hasOwnProperty('nextOriginalEvent'), "should add nextOriginalEvent property");
        equal(typeof eventSpawner.nextOriginalEvent, 'undefined', "should set nextOriginalEvent to undefined");
    });

    test("Next payload setter", function () {
        var payload = {},
            eventSpawner = EventSpawner.create()
                .setNextPayload(payload);

        strictEqual(eventSpawner.nextPayload, payload, "should set nextPayload");
    });

    test("Clearing next payload", function () {
        var payload = {},
            eventSpawner = EventSpawner.create()
                .setNextPayload(payload)
                .clearNextPayload();

        equal(typeof eventSpawner.nextPayload, 'undefined', "should set nextPayload to undefined");
    });

    test("Next original event setter", function () {
        var originalEvent = {},
            eventSpawner = EventSpawner.create()
                .setNextOriginalEvent(originalEvent);

        strictEqual(eventSpawner.nextOriginalEvent, originalEvent, "should set nextOriginalEvent");
    });

    test("Clearing next original event", function () {
        var payload = {},
            eventSpawner = EventSpawner.create('foo>bar'.toPath())
                .setNextOriginalEvent(payload)
                .clearNextOriginalEvent();

        equal(typeof eventSpawner.nextOriginalEvent, 'undefined', "should set nextOriginalEvent to undefined");
    });

    test("Spawning event", function () {
        expect(5);

        var params = {
                originalEvent: {},
                payload      : {},
                customPayload: {},
                event        : {}
            },
            eventSpawner = EventSpawner.create()
                .setNextPayload(params.payload)
                .setNextOriginalEvent(params.originalEvent);

        eventSpawner
            .addMocks({
                spawnPlainEvent: function (eventName) {
                    equal(eventName, 'event-name', "should spawn plain event");
                    return params.event;
                },

                _prepareEvent: function (event, payload) {
                    strictEqual(event, params.event, "should prepare spawned event");
                    equal(typeof payload, 'undefined', "should pass undefined as payload to preparation");
                }
            });

        strictEqual(eventSpawner.spawnEvent('event-name'), params.event, "should return spawned event");

        eventSpawner
            .removeMocks()
            .addMocks({
                spawnPlainEvent: function () {
                    return params.event;
                },

                _prepareEvent: function (event, payload) {
                    strictEqual(payload, params.customPayload,
                        "should pass custom payload to preparation when specified");
                }
            });

        eventSpawner.spawnEvent('event-name', params.customPayload);
    });
}());
