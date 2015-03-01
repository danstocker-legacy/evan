/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'Event', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * Instantiates class.
     * @name evan.Event.create
     * @function
     * @param {string} eventName Event name
     * @param {evan.EventSpace} eventSpace Event space associated with event
     * @return {evan.Event}
     */

    /**
     * An event is an object that may traverse in an event space.
     * Events carry all information regarding their position & properties.
     * @class evan.Event
     * @extends troop.Base
     */
    evan.Event = self
        .addPrivateMethods(/** @lends evan.Event# */{
            /**
             * Creates a new event instance and prepares it to be triggered.
             * @param {sntls.Path} targetPath
             * @return {evan.Event}
             * @private
             */
            _spawnMainBroadcastEvent: function (targetPath) {
                return self.create(this.eventName, this.eventSpace)
                    .setBroadcastPath(targetPath)
                    .setTargetPath(targetPath);
            },

            /**
             * Creates a new event instance and prepares it to be broadcast.
             * Broadcast events do not bubble.
             * @param {sntls.Path} broadcastPath
             * @param {sntls.Path} targetPath
             * @return {evan.Event}
             * @private
             */
            _spawnBroadcastEvent: function (broadcastPath, targetPath) {
                return self.create(this.eventName, this.eventSpace)
                    .allowBubbling(false)
                    .setBroadcastPath(broadcastPath)
                    .setTargetPath(targetPath);
            }
        })
        .addMethods(/** @lends evan.Event# */{
            /**
             * @param {string} eventName Event name
             * @param {evan.EventSpace} eventSpace Event space associated with event
             * @ignore
             */
            init: function (eventName, eventSpace) {
                dessert
                    .isString(eventName, "Invalid event name")
                    .isEventSpace(eventSpace, "Invalid event space");

                /**
                 * @type {string}
                 * @constant
                 */
                this.eventName = eventName;

                /**
                 * @type {evan.EventSpace}
                 * @constant
                 */
                this.eventSpace = eventSpace;

                /**
                 * Whether the current event can bubble
                 * @type {boolean}
                 */
                this.canBubble = true;

                /**
                 * Evan event or DOM event that led to triggering the current event.
                 * In most cases, this property is not set directly, but through
                 * evan.eventPropertyStack.pushOriginalEvent()
                 * @type {evan.Event|*}
                 * @see evan.eventPropertyStack.pushOriginalEvent
                 */
                this.originalEvent = undefined;

                /**
                 * Whether the event's default behavior was prevented.
                 * @type {boolean}
                 */
                this.defaultPrevented = false;

                /**
                 * Whether event was handled. (A subscribed handler ran.)
                 * @type {boolean}
                 */
                this.handled = false;

                /**
                 * Custom payload to be carried by the event
                 * In most cases, this property is not set directly, but through
                 * evan.eventPropertyStack.pushPayload()
                 * @type {*}
                 * @see evan.eventPropertyStack.pushPayload
                 */
                this.payload = undefined;

                /**
                 * Path reflecting current state of bubbling
                 * @type {evan.Path}
                 */
                this.currentPath = undefined;

                /**
                 * Path on which the event was originally triggered
                 * @type {sntls.Path}
                 */
                this.originalPath = undefined;

                /**
                 * Reference to the original target path if
                 * the event was triggered as part of a broadcast.
                 * @type {sntls.Path}
                 */
                this.broadcastPath = undefined;
            },

            /**
             * Clones event and optionally sets its currentPath property to
             * the one specified by the argument.
             * Override in subclasses to clone additional properties.
             * @param {sntls.Path} [currentPath]
             * @return {evan.Event}
             */
            clone: function (currentPath) {
                dessert.isPathOptional(currentPath, "Invalid current event path");

                var result = this.getBase().create(this.eventName, this.eventSpace);

                // transferring paths
                result.originalPath = this.originalPath;
                result.currentPath = currentPath ?
                    currentPath.clone() :
                    this.currentPath.clone();
                result.broadcastPath = this.broadcastPath;

                // transferring event state
                result.originalEvent = this.originalEvent;
                result.defaultPrevented = this.defaultPrevented;
                result.handled = this.handled;

                // transferring load
                result.payload = this.payload;

                return result;
            },

            /**
             * Sets whether the event can bubble
             * @param {boolean} value Bubbling flag
             * @return {evan.Event}
             */
            allowBubbling: function (value) {
                dessert.isBoolean(value, "Invalid bubbling flag");
                this.canBubble = value;
                return this;
            },

            /**
             * Sets original event that led to triggering the current event.
             * @param {even.Event|*} originalEvent
             * @returns {evan.Event}
             */
            setOriginalEvent: function (originalEvent) {
                this.originalEvent = originalEvent;
                return this;
            },

            /**
             * Retrieves event from chain of original events by type.
             * @returns {evan.Event|*} Original event matching the specified type.
             */
            getOriginalEventByType: function (eventType) {
                var that = this.originalEvent,
                    result;

                if (typeof eventType === 'function') {
                    while (that) {
                        if (that instanceof eventType) {
                            result = that;
                            break;
                        } else {
                            that = that.originalEvent;
                        }
                    }
                } else if (troop.Base.isBaseOf(eventType)) {
                    while (that) {
                        if (eventType.isBaseOf(that)) {
                            result = that;
                            break;
                        } else {
                            that = that.originalEvent;
                        }
                    }
                }

                return result;
            },

            /**
             * Sets flag for default behavior prevention to true.
             * @returns {evan.Event}
             */
            preventDefault: function () {
                this.defaultPrevented = true;
                return this;
            },

            /**
             * Assigns paths to the event.
             * @param {sntls.Path} targetPath Path on which to trigger event.
             * @return {evan.Event}
             */
            setTargetPath: function (targetPath) {
                dessert.isPath(targetPath, "Invalid target path");
                this.originalPath = targetPath;
                this.currentPath = targetPath.clone();
                return this;
            },

            /**
             * Assigns a broadcast path to the event.
             * @param {sntls.Path} broadcastPath Path associated with broadcasting.
             * @return {evan.Event}
             */
            setBroadcastPath: function (broadcastPath) {
                dessert.isPath(broadcastPath, "Invalid broadcast path");
                this.broadcastPath = broadcastPath;
                return this;
            },

            /**
             * Sets event payload. Payload is a reference carried by the event as it bubbles.
             * @param {*} [payload]
             * @return {evan.Event}
             */
            setPayload: function (payload) {
                this.payload = payload;
                return this;
            },

            /**
             * Triggers event.
             * Event handlers are assumed to be synchronous. Event properties change
             * between stages of bubbling, hence holding on to an event instance in an async handler
             * may not reflect the current paths and payload carried.
             * @param {sntls.Path} [targetPath] Path on which to trigger event.
             * @param {*} [payload] Extra payload to be passed along with event to handlers.
             * @return {evan.Event}
             */
            triggerSync: function (targetPath, payload) {
                // preparing event for trigger
                if (targetPath) {
                    this.setTargetPath(targetPath);
                }

                if (payload) {
                    this.setPayload(payload);
                }

                var currentPath = this.currentPath,
                    eventSpace = this.eventSpace,
                    handlerCount;

                dessert.assert(currentPath, "Event is not ready to be triggered");

                if (!this.canBubble || this.originalPath.isA(sntls.Query)) {
                    // event can't bubble because it's not allowed to
                    // or because path is a query and queries shouldn't bubble
                    // calling subscribed handlers once
                    eventSpace.callHandlers(this);
                } else {
                    // bubbling and calling handlers
                    while (currentPath.asArray.length) {
                        handlerCount = eventSpace.callHandlers(this);
                        if (handlerCount === false) {
                            // bubbling was deliberately stopped
                            // getting out of the bubbling loop
                            break;
                        } else {
                            if (handlerCount > 0) {
                                // setting handled flag
                                this.handled = true;
                            }
                            currentPath.asArray.pop();
                        }
                    }
                }

                return this;
            },

            /**
             * Broadcasts the event to all subscribed paths branching from the specified path.
             * Events spawned by a broadcast do not bubble except for the one that is triggered
             * on the specified broadcast path. It is necessary for delegates to react to
             * broadcasts.
             * @param {sntls.Path} broadcastPath Target root for broadcast
             * @param {*} [payload] Extra payload to be passed along with event to handlers.
             * @return {evan.Event}
             */
            broadcastSync: function (broadcastPath, payload) {
                var mainEvent = this._spawnMainBroadcastEvent(broadcastPath),
                    broadcastEvents = this.eventSpace
                        // obtaining subscribed paths relative to broadcast path
                        .getPathsRelativeTo(this.eventName, broadcastPath)
                        // spawning an event for each subscribed path
                        .passEachItemTo(this._spawnBroadcastEvent, this, 1, broadcastPath)
                        .asType(evan.EventCollection)
                        // adding main event
                        .setItem('main', mainEvent);

                // triggering all affected events
                broadcastEvents
                    .setPayload(payload || this.payload)
                    .setOriginalEvent(this.originalEvent)
                    .triggerSync();

                return this;
            }
        });
});

troop.postpone(evan, 'EventCollection', function () {
    "use strict";

    /**
     * @name evan.EventCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @return {evan.EventCollection}
     */

    /**
     * @name evan.EventCollection#eventName
     * @ignore
     */

    /**
     * @name evan.EventCollection#eventSpace
     * @ignore
     */

    /**
     * @name evan.EventCollection#canBubble
     * @ignore
     */

    /**
     * @name evan.EventCollection#payload
     * @ignore
     */

    /**
     * @name evan.EventCollection#currentPath
     * @ignore
     */

    /**
     * @name evan.EventCollection#originalPath
     * @ignore
     */

    /**
     * @name evan.EventCollection#broadcastPath
     * @ignore
     */

    /**
     * @class evan.EventCollection
     * @extends sntls.Collection
     * @extends evan.Event
     */
    evan.EventCollection = sntls.Collection.of(evan.Event);
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        /** @param {evan.Event} expr */
        isEvent: function (expr) {
            return evan.Event.isBaseOf(expr);
        },

        /** @param {evan.Event} expr */
        isEventOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   evan.Event.isBaseOf(expr);
        }
    });
}());
