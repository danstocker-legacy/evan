/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'nextPayloadStore', function () {
    "use strict";

    /**
     * Temporary storage for event payload.
     * @type {evan.PayloadStore}
     */
    evan.nextPayloadStore = evan.PayloadStore.create();
});

troop.postpone(evan, 'setNextPayloadItem', function () {
    "use strict";

    /**
     * Associates a payload item with an event name.
     * Subsequent events by the specified name will carry the specified payload item.
     * @param {string} eventName
     * @param {string} payloadItemName
     * @param {*} payloadItemValue
     */
    evan.setNextPayloadItem = function (eventName, payloadItemName, payloadItemValue) {
        evan.nextPayloadStore.setPayloadItem(eventName, payloadItemName, payloadItemValue);
    };
});

troop.postpone(evan, 'setNextPayloadItems', function () {
    "use strict";

    /**
     * Associates multiple payload items with an event name.
     * @param {string} eventName
     * @param {object} payload
     */
    evan.setNextPayloadItems = function (eventName, payload) {
        evan.nextPayloadStore.setPayloadItems(eventName, payload);
    };
});

troop.postpone(evan, 'deleteNextPayloadItem', function () {
    "use strict";

    /**
     * Dissociates a payload item from an event name.
     * @param {string} eventName
     * @param {string} payloadItemName
     */
    evan.deleteNextPayloadItem = function (eventName, payloadItemName) {
        evan.nextPayloadStore.deletePayloadItem(eventName, payloadItemName);
    };
});

troop.postpone(evan, 'deleteNextPayloadItems', function () {
    "use strict";

    /**
     * Dissociates multiple payload items from an event name.
     * Pass item names following the first argument.
     * @param {string} eventName
     */
    evan.deleteNextPayloadItems = function (eventName) {
        evan.nextPayloadStore.deletePayloadItems.apply(this, arguments);
    };
});
