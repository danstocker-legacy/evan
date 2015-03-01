/*global troop, sntls, evan */
troop.postpone(evan, 'eventPropertyStack', function () {
    "use strict";

    /**
     * Global stack for event properties.
     * @type {evan.EventPropertyStack}
     */
    evan.eventPropertyStack = evan.EventPropertyStack.create();
});
