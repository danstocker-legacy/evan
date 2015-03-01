/*global troop, sntls, evan */
troop.postpone(evan, 'eventSpaceRegistry', function () {
    "use strict";

    /**
     * Global registry for all event spaces.
     * @type {sntls.Collection}
     */
    evan.eventSpaceRegistry = evan.EventSpaceCollection.create();
});
