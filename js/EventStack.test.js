/*global sntls, evan, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("EventStack");

    test("Instantiation", function () {
        var eventStack = evan.EventStack.create();

        ok(eventStack.events.isA(evan.OpenChain), "should add events property");
    });

    test("Pushing event", function () {
        expect(3);

        var eventStack = evan.EventStack.create(),
            event = {},
            link;

        eventStack.events.addMocks({
            pushLink: function (link) {
                strictEqual(link.value, event, "should push link to chain");
            }
        });

        link = eventStack.pushEvent(event);

        ok(link.isA(evan.ValueLink), "should return ValueLink instance");
        strictEqual(link.value, event, "should set event as link value");
    });

    test("First event getter", function () {
        var eventStack = evan.EventStack.create(),
            event = {};

        eventStack.pushEvent({});
        eventStack.pushEvent(event);

        strictEqual(eventStack.getLastEvent(), event, "should return first event");
    });

    test("Unordered pop", function () {
        var eventStack = evan.EventStack.create(),
            link1 = eventStack.pushEvent(1), // will be sync
            link2 = eventStack.pushEvent(2), // will be async
            link3 = eventStack.pushEvent(3); // will be sync

        deepEqual(eventStack.events.getValues(), [1, 2, 3],
            "should start with all events in the stack");

        link1.unLink();

        deepEqual(eventStack.events.getValues(), [2, 3],
            "should then remove first sync link from stack");

        link3.unLink();

        deepEqual(eventStack.events.getValues(), [2],
            "should then remove second sync link from stack");

        link2.unLink();

        deepEqual(eventStack.events.getValues(), [],
            "should then remove async link from stack");
    });
}());
