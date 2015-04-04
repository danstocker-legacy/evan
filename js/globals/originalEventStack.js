/*global troop, sntls, evan */
troop.postpone(evan, 'originalEventStack', function () {
    "use strict";

    /**
     * Global stack for original events.
     * @type {Array}
     */
    evan.originalEventStack = evan.EventStack.create();
});

troop.postpone(evan, 'pushOriginalEvent', function () {
    "use strict";

    /**
     * Adds an original event to the stack.
     * @param {evan.Event|*} originalEvent
     * @returns {evan.MutableLink}
     */
    evan.pushOriginalEvent = function (originalEvent) {
        return evan.originalEventStack.pushEvent(originalEvent);
    };
});
