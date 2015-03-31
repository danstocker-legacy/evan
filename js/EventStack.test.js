/*global sntls, evan, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("EventStack");

    test("Instantiation", function () {
        var eventStack = evan.EventStack.create();

        deepEqual(eventStack.events, [], "should add events property");
    });

    test("Pushing event", function () {
        var eventStack = evan.EventStack.create(),
            event = {};

        strictEqual(eventStack.pushEvent(event), eventStack, "should be chainable");
        deepEqual(eventStack.events, [event], "should add event to stack");
    });

    test("Popping event", function () {
        var eventStack = evan.EventStack.create(),
            event = {};

        eventStack.pushEvent(event);

        strictEqual(eventStack.popEvent(), event, "should return removed event");
        deepEqual(eventStack.events, [], "should remove event from stack");
    });

    test("First event getter", function () {
        var eventStack = evan.EventStack.create(),
            event = {};

        eventStack
            .pushEvent({})
            .pushEvent(event);

        strictEqual(eventStack.getFirstEvent(), event, "should return first event");
        deepEqual(eventStack.events, [{}, {}], "should not remove event from stack");
    });
}());
