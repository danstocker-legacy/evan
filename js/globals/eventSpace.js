/*global troop, evan */
troop.postpone(evan, 'eventSpace', function () {
    "use strict";

    /**
     * Global, shared event space.
     * @type {evan.EventSpace}
     */
    evan.eventSpace = evan.EventSpace.create();
});
