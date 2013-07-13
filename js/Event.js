/*global dessert, troop, sntls, evan */
troop.postpone(evan, 'Event', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * Instantiates class.
     * @name evan.Event.create
     * @function
     * @param {evan.EventSpace} eventSpace Event space associated with event
     * @param {string} eventName Event name
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
             * @param {*} data Custom event data
             * @param {sntls.Path} targetPath
             * @return {evan.Event}
             * @private
             */
            _spawnMainBroadcastEvent: function (data, targetPath) {
                return self.create(this.eventSpace, this.eventName)
                    .setBroadcastPath(targetPath)
                    .setTargetPath(targetPath)
                    .setData(data);
            },

            /**
             * Creates a new event instance and prepares it to be broadcast.
             * Broadcast events do not bubble.
             * @param {*} data Custom event data - first argument  because its bound
             * version is used in collection mapping.
             * @param {sntls.Path} broadcastPath
             * @param {sntls.Path} targetPath
             * @return {evan.Event}
             * @private
             */
            _spawnBroadcastEvent: function (data, broadcastPath, targetPath) {
                return self.create(this.eventSpace, this.eventName)
                    .allowBubbling(false)
                    .setBroadcastPath(broadcastPath)
                    .setTargetPath(targetPath)
                    .setData(data);
            },

            /**
             * Resets event properties
             * @return {evan.Event}
             * @private
             */
            _reset: function () {
                this.currentPath = undefined;
                this.originalPath = undefined;
                this.broadcastPath = undefined;
                this.data = undefined;

                return this;
            }
        })
        .addMethods(/** @lends evan.Event# */{
            /**
             * @param {evan.EventSpace} eventSpace Event space associated with event
             * @param {string} eventName Event name
             */
            init: function (eventSpace, eventName) {
                dessert
                    .isEventSpace(eventSpace)
                    .isString(eventName);

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
                 * Custom user data to be carried by the event
                 * @type {*}
                 */
                this.data = undefined;

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
             * Clones event and sets its currentPath property to
             * the one specified by the argument.
             * @param {sntls.Path} [currentPath]
             * @return {evan.Event}
             */
            clone: function (currentPath) {
                dessert.isPathOptional(currentPath, "Invalid current event path");

                var /**evan.Event*/ result = self.create(this.eventSpace, this.eventName);

                result.originalPath = this.originalPath;
                result.currentPath = currentPath ?
                    currentPath.clone() :
                    this.currentPath.clone();
                result.broadcastPath = this.broadcastPath;
                result.data = this.data;

                return result;
            },

            /**
             * Sets whether the event can bubble
             * @param {boolean} value Bubbling flag
             * @return {evan.Event}
             */
            allowBubbling: function (value) {
                dessert.isBoolean(value);
                this.canBubble = value;
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
             * Assigns custom data to the event.
             * @param {*} [data] Extra data to be passed along with event to handlers.
             * @return {evan.Event}
             */
            setData: function (data) {
                this.data = data;
                return this;
            },

            /**
             * Triggers event.
             * Event handlers are assumed to be synchronous. Event properties change
             * between stages of bubbling, hence holding on to an event instance in an async handler
             * may not reflect the current paths and data carried.
             * @param {sntls.Path} targetPath Path on which to trigger event.
             * @param {*} [data] Extra data to be passed along with event to handlers.
             * @return {evan.Event}
             */
            triggerSync: function (targetPath, data) {
                // preparing event for trigger
                if (targetPath) {
                    this
                        .setTargetPath(targetPath)
                        .setData(data);
                }

                var currentPath = this.currentPath,
                    eventSpace = this.eventSpace;

                dessert.assert(currentPath, "Event is not ready to be triggered");

                if (!this.canBubble || this.originalPath.isA(sntls.Query)) {
                    // event can't bubble because it's not allowed to
                    // or because path is a query and queries shouldn't bubble
                    // calling subscribed handlers once
                    eventSpace.callHandlers(this);
                } else {
                    // bubbling and calling handlers
                    while (currentPath.asArray.length) {
                        if (eventSpace.callHandlers(this) === false) {
                            // bubbling was deliberately stopped
                            break;
                        } else {
                            currentPath.asArray.pop();
                        }
                    }
                }

                // resetting path properties
                this._reset();

                return this;
            },

            /**
             * Broadcasts the event to all subscribed paths branching from the specified path.
             * Events spawned by a broadcast do not bubble except for the one that is triggered
             * on the specified broadcast path. It is necessary for delegates to react to
             * broadcasts.
             * @param {sntls.Path} broadcastPath Target root for broadcast
             * @param {*} [data] Extra data to be passed along with event to handlers.
             * @return {evan.Event}
             */
            broadcastSync: function (broadcastPath, data) {
                var mainEvent = this._spawnMainBroadcastEvent(data, broadcastPath);

                // triggering all affected events
                this.eventSpace
                    // obtaining subscribed paths relative to broadcast path
                    .getPathsRelativeTo(this.eventName, broadcastPath)
                    // spawning an event for each subscribed path
                    .passEachItemTo(this._spawnBroadcastEvent, this, 2, data, broadcastPath)
                    .asType(evan.EventCollection)
                    // adding main event
                    .setItem('main', mainEvent)
                    // triggering all events
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
     * @name evan.EventCollection#data
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
        isEvent: function (expr) {
            return evan.Event.isBaseOf(expr);
        },

        isEventOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   evan.Event.isBaseOf(expr);
        }
    });
}());
