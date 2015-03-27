/*global troop, sntls, evan */
troop.postpone(evan, 'originalEventStack', function () {
    "use strict";

    /**
     * Global stack for original events.
     * @type {Array}
     */
    evan.originalEventStack = [];
});

troop.postpone(evan, 'pushOriginalEvent', function () {
    "use strict";

    /**
     * Adds an original event to the stack.
     * @param {evan.Event|*} originalEvent
     */
    evan.pushOriginalEvent = function (originalEvent) {
        evan.originalEventStack.unshift(originalEvent);
    };
});

troop.postpone(evan, 'popOriginalEvent', function () {
    "use strict";

    /**
     * Removes the last added original event from the stack.
     * @returns {evan.Event|*}
     */
    evan.popOriginalEvent = function () {
        return evan.originalEventStack.shift();
    };
});
