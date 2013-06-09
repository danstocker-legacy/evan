/**
 * Evented Trait
 *
 * Classes with this trait are may trigger and capture
 * events on a specified event space directly.
 */
/*global dessert, troop, sntls, evan */
troop.promise(evan, 'Evented', function () {
    "use strict";

    /**
     * @class evan.Evented
     * @extends troop.Base
     */
    evan.Evented = troop.Base.extend()
        .addMethod(/** @lends evan.Evented */{
            /**
             * Initializes evented instance by assigning an event space
             * in which to operate.
             * Event space may be both class level or instance level,
             * hence the instance level assignment.
             * @param {evan.EventSpace} eventSpace Event space the listener is working with.
             * @param {sntls.Path} eventPath Path representing this instance in the event space.
             */
            initEvented: function (eventSpace, eventPath) {
                dessert
                    .isEventSpace(eventSpace, "Invalid event space")
                    .isPathOptional(eventPath, "invalid event path");

                /**
                 * Event space associated with instance or class.
                 * @type {evan.EventSpace}
                 */
                this.eventSpace = eventSpace;

                /**
                 * Event path assigned to the current instance or class
                 * in the context of the current event space.
                 * @type {sntls.Path}
                 */
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
            on: function (eventName, handler) {
                this.eventSpace.on(eventName, this.eventPath, handler);
                return this;
            },

            /**
             * Unsubscribes from event.
             * @param {string} eventName Name of event to be triggered.
             * @param {function} [handler] Event handler function
             * @return {evan.Evented}
             */
            off: function (eventName, handler) {
                this.eventSpace.off(eventName, this.eventPath, handler);
                return this;
            },

            /**
             * Subscribes to event and unsubscribes after first trigger.
             * @param {string} eventName Name of event to be triggered.
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {evan.Evented}
             */
            one: function (eventName, handler) {
                this.eventSpace.one(eventName, this.eventPath, handler);
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
            delegate: function (eventName, delegatePath, handler) {
                this.eventSpace.delegate(eventName, this.eventPath, delegatePath, handler);
                return this;
            },

            /**
             * Shorthand for **triggering** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @param {*} data
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
             * @param {*} data
             * @return {evan.Evented}
             */
            broadcastSync: function (eventName, data) {
                this.eventSpace.spawnEvent(eventName)
                    .broadcastSync(this.eventPath, data);
                return this;
            }
        });
});
