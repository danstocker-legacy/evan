/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'Evented', function () {
    "use strict";

    /**
     * Trait.
     * Classes with this trait are may trigger and capture
     * events on a specified event space directly.
     * @class evan.Evented
     * @extends troop.Base
     */
    evan.Evented = troop.Base.extend()
        .addMethods(/** @lends evan.Evented# */{
            /**
             * Initializes evented instance by assigning an event space in which to operate.
             * When trait is applied statically, ie. all instances share the same event space,
             * it's not necessary to initialize the trait, it's enough to set the event path for
             * each instance.
             * @param {evan.EventSpace} eventSpace Event space the listener is working with.
             * @param {sntls.Path} [eventPath] Path representing this instance in the event space.
             * @returns {evan.Evented}
             */
            init: function (eventSpace, eventPath) {
                /**
                 * Event space associated with instance or class.
                 * @type {evan.EventSpace}
                 */
                this.eventSpace = undefined;

                /**
                 * Event path assigned to the current instance or class
                 * in the context of the current event space.
                 * @type {sntls.Path}
                 */
                this.eventPath = undefined;

                this
                    .setEventSpace(eventSpace)
                    .setEventPath(eventPath);

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
             * @param {*} [data]
             * @return {evan.Evented}
             */
            triggerSync: function (eventName, data) {
                this.eventSpace.spawnEvent(eventName)
                    .triggerSync(this.eventPath, data);
                return this;
            },

            /**
             * Shorthand for **broadcasting** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @param {*} [data]
             * @return {evan.Evented}
             */
            broadcastSync: function (eventName, data) {
                this.eventSpace.spawnEvent(eventName)
                    .broadcastSync(this.eventPath, data);
                return this;
            }
        });
});
