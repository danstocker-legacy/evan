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
             */
            initEvented: function (eventSpace) {
                dessert.isEventSpace(eventSpace);

                this.eventSpace = eventSpace;
            },

            /**
             * Subscribes to event.
             * @param {string} eventName Name of event to be triggered.
             * @param {sntls.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {evan.Evented}
             */
            on: function (eventName, eventPath, handler) {
                this.eventSpace.on.apply(this.eventSpace, arguments);
                return this;
            },

            /**
             * Unsubscribes from event.
             * @param {string} eventName Name of event to be triggered.
             * @param {sntls.Path} eventPath Path we're listening to
             * @param {function} [handler] Event handler function
             * @return {evan.Evented}
             */
            off: function (eventName, eventPath, handler) {
                this.eventSpace.off.apply(this.eventSpace, arguments);
                return this;
            },

            /**
             * Subscribes to event and unsubscribes after first trigger.
             * @param {string} eventName Name of event to be triggered.
             * @param {sntls.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {evan.Evented}
             */
            one: function (eventName, eventPath, handler) {
                this.eventSpace.one.apply(this.eventSpace, arguments);
                return this;
            },

            /**
             * Delegates event capturing to a path closer to the root.
             * Handlers subscribed this way CANNOT be unsubscribed individually.
             * @param {string} eventName
             * @param {sntls.Path} capturePath Path where the event will actually subscribe
             * @param {sntls.Path} delegatePath Path we're listening to. (Could be derived, eg. Query)
             * @param {function} handler Event handler function
             * @return {evan.Evented}
             */
            delegate: function (eventName, capturePath, delegatePath, handler) {
                this.eventSpace.delegate.apply(this.eventSpace, arguments);
                return this;
            },

            /**
             * Shorthand for **triggering** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @param {sntls.Path} path
             * @param {*} data
             * @return {evan.Evented}
             */
            triggerSync: function (eventName, path, data) {
                this.eventSpace.spawnEvent(eventName)
                    .triggerSync(path, data);
                return this;
            },

            /**
             * Shorthand for **broadcasting** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @param {sntls.Path} path
             * @param {*} data
             * @return {evan.Evented}
             */
            broadcastSync: function (eventName, path, data) {
                this.eventSpace.spawnEvent(eventName)
                    .broadcastSync(path, data);
                return this;
            }
        });
});
