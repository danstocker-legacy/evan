/**
 * Interface that marks a class as target for events. Event targets may subscribe to events.
 * @name evan.EventTarget
 * @class
 * @extends troop.Base
 */

/**
 * Subscribes a handler to the specified event, in a specific event space.
 * @name evan.EventTarget#subscribeTo
 * @function
 * @param {string} eventName
 * @returns {evan.EventTarget}
 */

/**
 * Unsubscribes a handler from the specified event, in a specific event space.
 * @name evan.EventTarget#unsubscribeFrom
 * @function
 * @param {string} eventName
 * @returns {evan.EventTarget}
 */

/**
 * Subscribes a handler to the specified event, in a specific event space, and unsubscribes after the first time it was triggered.
 * @name evan.EventTarget#subscribeToUntilTriggered
 * @function
 * @param {string} eventName
 * @returns {evan.EventTarget}
 */

/**
 * Subscribes a handler to the specified event, in a specific event space, but only if the event's original path matches a specified Query.
 * @name evan.EventTarget#delegateSubscriptionTo
 * @function
 * @param {string} eventName
 * @returns {evan.EventTarget}
 */
