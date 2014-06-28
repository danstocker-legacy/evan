/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'Evented', function () {
    "use strict";

    /**
     * Trait.
     * Classes with this trait may trigger and capture
     * events on a specified event space directly.
     * @class evan.Evented
     * @extends troop.Base
     */
    evan.Evented = troop.Base.extend()
        .addMethods(/** @lends evan.Evented# */{
            /**
             * Call from init of host class.
             */
            init: function () {
                /**
                 * Payload to be set on next trigger(s).
                 * @type {*}
                 */
                this.nextPayload = undefined;

                /**
                 * Original event to be set on next trigger(s).
                 * @type {evan.Event|*}
                 */
                this.nextOriginalEvent = undefined;
            },

            /**
             * Sets payload for next event triggered.
             * @param {*} nextPayload
             * @returns {evan.Evented}
             */
            setNextPayload: function (nextPayload) {
                this.nextPayload = nextPayload;
                return this;
            },

            /**
             * Clears payload for next event triggered.
             * @returns {evan.Evented}
             */
            clearNextPayload: function () {
                this.nextPayload = undefined;
                return this;
            },

            /**
             * Sets original event for next event triggered.
             * @param {evan.Event|*} nextOriginalEvent
             * @returns {evan.Evented}
             */
            setNextOriginalEvent: function (nextOriginalEvent) {
                this.nextOriginalEvent = nextOriginalEvent;
                return this;
            },

            /**
             * Clears original event for next event triggered.
             * @returns {evan.Evented}
             */
            clearNextOriginalEvent: function () {
                this.nextOriginalEvent = undefined;
                return this;
            },

            /**
             * Sets event space on current class or instance.
             * @param {evan.EventSpace} eventSpace
             * @returns {evan.Evented}
             * @memberOf {evan.Evented}
             */
            setEventSpace: function (eventSpace) {
                dessert.isEventSpace(eventSpace, "Invalid event space");
                this.eventSpace = eventSpace;
                return this;
            },

            /**
             * Sets event path for the current class or instance.
             * @param {sntls.Path} eventPath
             * @returns {evan.Evented}
             * @memberOf {evan.Evented}
             */
            setEventPath: function (eventPath) {
                dessert
                    .isPath(eventPath, "Invalid event path")
                    .assert(
                        !this.eventPath || eventPath.isRelativeTo(this.eventPath),
                        "Specified event path is not relative to static event path");

                this.eventPath = eventPath;

                return this;
            },

            /**
             * Subscribes to event.
             * @param {string} eventName Name of event to be triggered.
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {evan.Evented}
             */
            subscribeTo: function (eventName, handler) {
                this.eventSpace.subscribeTo(eventName, this.eventPath, handler);
                return this;
            },

            /**
             * Unsubscribes from event.
             * @param {string} eventName Name of event to be triggered.
             * @param {function} [handler] Event handler function
             * @return {evan.Evented}
             */
            unsubscribeFrom: function (eventName, handler) {
                this.eventSpace.unsubscribeFrom(eventName, this.eventPath, handler);
                return this;
            },

            /**
             * Subscribes to event and unsubscribes after first trigger.
             * @param {string} eventName Name of event to be triggered.
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {evan.Evented}
             */
            subscribeToUntilTriggered: function (eventName, handler) {
                this.eventSpace.subscribeToUntilTriggered(eventName, this.eventPath, handler);
                return this;
            },

            /**
             * Delegates event capturing to a path closer to the root.
             * Handlers subscribed this way CANNOT be unsubscribed individually.
             * @param {string} eventName
             * @param {sntls.Path} delegatePath Path we're listening to. (Could be derived, eg. Query)
             * @param {function} handler Event handler function
             * @return {evan.Evented}
             */
            delegateSubscriptionTo: function (eventName, delegatePath, handler) {
                this.eventSpace.delegateSubscriptionTo(eventName, this.eventPath, delegatePath, handler);
                return this;
            },

            /**
             * Shorthand for **triggering** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @param {*} [payload]
             * @return {evan.Evented}
             */
            triggerSync: function (eventName, payload) {
                var event = this.eventSpace.spawnEvent(eventName);

                if (this.nextPayload) {
                    event.setPayload(this.nextPayload);
                }

                if (this.nextOriginalEvent) {
                    event.setOriginalEvent(this.nextOriginalEvent);
                }

                event.triggerSync(this.eventPath, payload);
                return this;
            },

            /**
             * Shorthand for **broadcasting** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @param {*} [payload]
             * @return {evan.Evented}
             */
            broadcastSync: function (eventName, payload) {
                var event = this.eventSpace.spawnEvent(eventName);

                if (this.nextPayload) {
                    event.setPayload(this.nextPayload);
                }

                if (this.nextOriginalEvent) {
                    event.setPayload(this.nextOriginalEvent);
                }

                event.broadcastSync(this.eventPath, payload);
                return this;
            }
        });
});
