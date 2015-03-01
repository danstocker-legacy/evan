/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'Evented', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * Trait.
     * Classes with this trait may trigger and capture
     * events on a specified event space directly.
     * @class evan.Evented
     * @extends troop.Base
     * @extends evan.EventSpawner
     */
    evan.Evented = self
        .addPrivateMethods(/** @lends evan.Evented# */{
            /**
             * @param {sntls.Dictionary} dictionary
             * @returns {Array}
             * @private
             */
            _flattenDictionary: function (dictionary) {
                var result = [],
                    items = dictionary.items,
                    keys = Object.keys(items),
                    i, key, values, handler,
                    j;

                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    values = items[key];

                    if (values instanceof Array) {
                        for (j = 0; j < values.length; j++) {
                            result.push([key, values[j]]);
                        }
                    } else {
                        result.push([key, values]);
                    }
                }

                return result;
            },

            /**
             * @param {sntls.Path} oldEventPath
             * @param {sntls.Path} newEventPath
             * @private
             */
            _reSubscribe: function (oldEventPath, newEventPath) {
                var that = this;
                this._flattenDictionary(this.subscriptionRegistry)
                    .toCollection()
                    .forEachItem(function (keyValuePair) {
                        var eventName = keyValuePair[0],
                            handler = keyValuePair[1];
                        that.eventSpace
                            .unsubscribeFrom(eventName, oldEventPath, handler)
                            .subscribeTo(eventName, newEventPath, handler);
                    });
            }
        })
        .addMethods(/** @lends evan.Evented# */{
            /** @ignore */
            init: function () {
                /**
                 * Stores event name - handler associations for the current evented instance.
                 * @type {sntls.Dictionary}
                 */
                this.subscriptionRegistry = undefined;
            },

            /**
             * @param {string} eventName
             * @param {*} [payload]
             * @return {evan.Event}
             * @deprecated
             */
            spawnEvent: function (eventName, payload) {
                return this.eventSpace.spawnEvent(eventName, payload);
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
                var baseEventPath = this.getBase().eventPath,
                    subscriptionRegistry = this.subscriptionRegistry;

                dessert
                    .isPath(eventPath, "Invalid event path")
                    .assert(
                        !baseEventPath || eventPath.isRelativeTo(baseEventPath),
                        "Specified event path is not relative to static event path");

                if (!subscriptionRegistry) {
                    // initializing subscription registry
                    this.subscriptionRegistry = sntls.Dictionary.create();
                } else if (subscriptionRegistry.getKeyCount()) {
                    // re-subscribing events
                    this._reSubscribe(this.eventPath, eventPath);
                }

                // storing new event path
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
                this.subscriptionRegistry.addItem(eventName, handler);
                return this;
            },

            /**
             * Unsubscribes from event.
             * @param {string} [eventName] Name of event to be triggered.
             * @param {function} [handler] Event handler function
             * @return {evan.Evented}
             */
            unsubscribeFrom: function (eventName, handler) {
                this.eventSpace.unsubscribeFrom(eventName, this.eventPath, handler);

                if (eventName) {
                    this.subscriptionRegistry.removeItem(eventName, handler);
                } else {
                    this.subscriptionRegistry.clear();
                }

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
                var oneHandler = this.eventSpace.subscribeToUntilTriggered(eventName, this.eventPath, handler);
                this.subscriptionRegistry.addItem(eventName, oneHandler);
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
                var delegateHandler = this.eventSpace.delegateSubscriptionTo(eventName, this.eventPath, delegatePath, handler);
                this.subscriptionRegistry.addItem(eventName, delegateHandler);
                return this;
            },

            /**
             * @param {string} eventName
             * @returns {evan.Event}
             */
            spawnPlainEvent: function (eventName) {
                return evan.Event.create(eventName, this.eventSpace);
            },

            /**
             * Shorthand for **triggering** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @param {*} [payload] Payload to be set on triggered event. Overrides payloadStack property.
             * @return {evan.Evented}
             */
            triggerSync: function (eventName, payload) {
                this.spawnEvent(eventName, payload)
                    .triggerSync(this.eventPath);
                return this;
            },

            /**
             * Shorthand for **broadcasting** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @param {*} [payload] Payload to be set on triggered event. Overrides payloadStack property.
             * @return {evan.Evented}
             */
            broadcastSync: function (eventName, payload) {
                this.spawnEvent(eventName, payload)
                    .broadcastSync(this.eventPath);
                return this;
            }
        });
});
