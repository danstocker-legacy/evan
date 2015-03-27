/*global sntls, evan, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("originalEventStack");

    test("Pushing original event", function () {
        var originalEvent = {};

        evan.pushOriginalEvent(originalEvent);

        deepEqual(evan.originalEventStack, [originalEvent], "should add original event to stack");
    });

    test("Popping original event", function () {
        var originalEvent = {},
            stackBefore = sntls.Utils.shallowCopy(evan.originalEventStack);

        evan.pushOriginalEvent(originalEvent);

        strictEqual(evan.popOriginalEvent(), originalEvent, "should return removed payload");
        deepEqual(evan.originalEventStack, stackBefore, "should remove original event from stack");
    });
}());
