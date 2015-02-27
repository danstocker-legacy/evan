/*global troop, sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Evented");

    var eventSpace = evan.EventSpace.create(),

        EventedStaticClass = troop.Base.extend()
            .addTrait(evan.Evented)
            .setEventSpace(eventSpace)
            .setEventPath('test>path'.toPath())
            .addMethods({
                init: function (path) {
                    evan.Evented.init.call(this);
                    this.setEventPath(path);
                }
            }),

        EventedClass = troop.Base.extend()
            .addTrait(evan.Evented)
            .addMethods({
                init: function (path) {
                    evan.Evented.init.call(this);
                    this
                        .setEventSpace(evan.EventSpace.create())
                        .setEventPath(path);
                }
            });

    test("Event path setter", function () {
        var evented = EventedClass.create('test>path'.toPath()),
            eventPath = 'foo>bar>baz'.toPath();

        evented.setEventPath(eventPath);

        strictEqual(evented.eventPath, eventPath, "should set event path");
    });

    test("Relative event path setter", function () {
        raises(function () {
            EventedStaticClass.create('foo>bar'.toPath());
        }, "should raise exception on path not relative to static path");

        var evented = EventedStaticClass.create('test>path>foo'.toPath());

        equal(evented.eventPath.toString(), 'test>path>foo', "should set relative event path");
    });

    test("Re-subscription by altering event path", function () {
        var handler1 = function () {
            },
            handler2 = function () {
            },
            evented = EventedClass.create('hello>world'.toPath())
                .subscribeTo('foo', handler1)
                .subscribeTo('bar', handler2),
            unsubscribed = [],
            subscribed = [];

        evented.eventSpace.addMocks({
            unsubscribeFrom: function (eventName, path, handler) {
                unsubscribed.push([eventName, path.toString(), handler]);
                return this;
            },

            subscribeTo: function (eventName, path, handler) {
                subscribed.push([eventName, path.toString(), handler]);
                return this;
            }
        });

        evented.setEventPath('hi>all'.toPath());

        evented.eventSpace.removeMocks();

        deepEqual(unsubscribed, [
            ['foo', 'hello>world', handler1],
            ['bar', 'hello>world', handler2]
        ], "should unsubscribe all handlers from old path");

        deepEqual(subscribed, [
            ['foo', 'hi>all', handler1],
            ['bar', 'hi>all', handler2]
        ], "should subscribe all handlers to new path");
    });

    test("Static subscription", function () {
        expect(5);

        function eventHandler() {
        }

        evan.EventSpace.addMocks({
            subscribeTo: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "should call EventSpace subscription with event name");
                equal(eventPath.toString(), 'test>path', "should pass event path to subscription method");
                strictEqual(handler, eventHandler, "should pass event handler function to subscription method");
            }
        });

        EventedStaticClass.subscriptionRegistry.addMocks({
            addItem: function (eventName, handler) {
                equal(eventName, 'myEvent', "should add event to registry");
                strictEqual(handler, eventHandler, "should pass handler to registry addition");
            }
        });

        EventedStaticClass.subscribeTo('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
        EventedStaticClass.subscriptionRegistry.removeMocks();
    });

    test("Instance level subscription", function () {
        expect(5);

        var evented = EventedClass.create('test>path>foo>bar'.toPath());

        function eventHandler() {
        }

        evan.EventSpace.addMocks({
            subscribeTo: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "should call EventSpace subscription with event name");
                ok(eventPath.toString(), 'test>path>foo>bar',
                    "should pass event path to subscription method");
                strictEqual(handler, eventHandler, "should pass event handler function to subscription method");
            }
        });

        evented.subscriptionRegistry.addMocks({
            addItem: function (eventName, handler) {
                equal(eventName, 'myEvent', "should add event to registry");
                strictEqual(handler, eventHandler, "should pass handler to registry addition");
            }
        });

        evented.subscribeTo('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Static unsubscription", function () {
        expect(5);

        function eventHandler() {
        }

        evan.EventSpace.addMocks({
            unsubscribeFrom: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "should call EventSpace unsubscription with event name");
                equal(eventPath.toString(), 'test>path', "should pass event path to unsubscription method");
                strictEqual(handler, eventHandler, "should pass event handler function to unsubscription method");
            }
        });

        EventedStaticClass.subscriptionRegistry.addMocks({
            removeItem: function (eventName, handler) {
                equal(eventName, 'myEvent', "should remove event from registry");
                strictEqual(handler, eventHandler, "should pass handler to registry removal");
            }
        });

        EventedStaticClass.unsubscribeFrom('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
        EventedStaticClass.subscriptionRegistry.removeMocks();
    });

    test("Instance level unsubscription", function () {
        expect(5);

        var evented = EventedClass.create('test>path>foo>bar'.toPath());

        function eventHandler() {
        }

        evan.EventSpace.addMocks({
            unsubscribeFrom: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "should call EventSpace unsubscription with event name");
                equal(eventPath.toString(), 'test>path>foo>bar',
                    "should pass event path to unsubscription method");
                strictEqual(handler, eventHandler, "should pass event handler function to unsubscription method");
            }
        });

        evented.subscriptionRegistry.addMocks({
            removeItem: function (eventName, handler) {
                equal(eventName, 'myEvent', "should remove event from registry");
                strictEqual(handler, eventHandler, "should pass handler to registry removal");
            }
        });

        evented.unsubscribeFrom('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Static one time subscription", function () {
        expect(5);

        function eventHandler() {
        }

        function oneHandler() {
        }

        evan.EventSpace.addMocks({
            subscribeToUntilTriggered: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "should call EventSpace subscription with event name");
                equal(eventPath.toString(), 'test>path',
                    "should pass event path to subscription method");
                strictEqual(handler, eventHandler, "should pass event handler function to subscription method");
                return oneHandler;
            }
        });

        EventedStaticClass.subscriptionRegistry.addMocks({
            addItem: function (eventName, handler) {
                equal(eventName, 'myEvent', "should add event to registry");
                strictEqual(handler, oneHandler, "should pass one time handler to registry addition");
            }
        });

        EventedStaticClass.subscribeToUntilTriggered('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
        EventedStaticClass.subscriptionRegistry.removeMocks();
    });

    test("Instance level one time subscription", function () {
        expect(5);

        var evented = EventedClass.create('test>path>foo>bar'.toPath());

        function eventHandler() {
        }

        function oneHandler() {
        }

        evan.EventSpace.addMocks({
            subscribeToUntilTriggered: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "should call EventSpace subscription with event name");
                equal(eventPath.toString(), 'test>path>foo>bar',
                    "should pass event path to subscription method");
                strictEqual(handler, eventHandler, "should pass event handler function to subscription method");
                return oneHandler;
            }
        });

        evented.subscriptionRegistry.addMocks({
            addItem: function (eventName, handler) {
                equal(eventName, 'myEvent', "should add event to registry");
                strictEqual(handler, oneHandler, "should pass one time handler to registry addition");
            }
        });

        evented.subscribeToUntilTriggered('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Static delegation", function () {
        expect(6);

        function eventHandler() {
        }

        function delegateHandler() {
        }

        evan.EventSpace.addMocks({
            delegateSubscriptionTo: function (eventName, capturePath, delegatePath, handler) {
                equal(eventName, 'myEvent', "should call EventSpace delegation with event name");
                equal(capturePath.toString(), 'test>path',
                    "should pass capture path to delegation method");
                equal(delegatePath.toString(), 'test>path>foo',
                    "should pass delegate path to delegation method");
                strictEqual(handler, eventHandler, "should pass event handler function to subscription method");
                return delegateHandler;
            }
        });

        EventedStaticClass.subscriptionRegistry.addMocks({
            addItem: function (eventName, handler) {
                equal(eventName, 'myEvent', "should add event to registry");
                strictEqual(handler, delegateHandler, "should pass delegate handler to registry addition");
            }
        });

        EventedStaticClass.delegateSubscriptionTo('myEvent', 'test>path>foo'.toPath(), eventHandler);

        evan.EventSpace.removeMocks();
        EventedStaticClass.subscriptionRegistry.removeMocks();
    });

    test("Instance level delegation", function () {
        expect(6);

        var evented = EventedClass.create('test>path>foo>bar'.toPath());

        function eventHandler() {
        }

        function delegateHandler() {
        }

        evan.EventSpace.addMocks({
            delegateSubscriptionTo: function (eventName, capturePath, delegatePath, handler) {
                equal(eventName, 'myEvent', "should call EventSpace delegation with event name");
                equal(capturePath.toString(), 'test>path>foo>bar',
                    "should pass capture path to delegation method");
                equal(delegatePath.toString(), 'test>path>foo>bar>hello>world',
                    "should pass delegate path to delegation method");
                strictEqual(handler, eventHandler, "should pass event handler function to subscription method");
                return delegateHandler;
            }
        });

        evented.subscriptionRegistry.addMocks({
            addItem: function (eventName, handler) {
                equal(eventName, 'myEvent', "should add event to registry");
                strictEqual(handler, delegateHandler, "should pass delegate handler to registry addition");
            }
        });

        evented.delegateSubscriptionTo('myEvent', 'test>path>foo>bar>hello>world'.toPath(), eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Spawning event", function () {
        expect(3);

        var evented = EventedClass.create('test>path>foo>bar'.toPath()),
            custom = {},
            event = {};

        evented.eventSpace.addMocks({
            spawnEvent: function (eventName, payload) {
                equal(eventName, 'event-name', "should have event space spawn an event");
                strictEqual(payload, custom, "should pass payload to spawner");
                return event;
            }
        });

        strictEqual(evented.spawnEvent('event-name', custom), event, "should return spawned event");
    });

    test("Triggering events", function () {
        var triggeredPaths = [],
            evented = EventedStaticClass.create('test>path>foo'.toPath());

        // subscribing handlers
        function eventHandler(event) {
            triggeredPaths.push(event.currentPath.toString());
        }

        EventedStaticClass.subscribeTo('myEvent', eventHandler);
        evented.subscribeTo('myEvent', eventHandler);

        evented.triggerSync('myEvent');

        deepEqual(triggeredPaths, ['test>path>foo', 'test>path'],
            "should hit both instance and static subscriptions");

        EventedStaticClass.unsubscribeFrom('myEvent');
        evented.unsubscribeFrom('myEvent');
    });

    test("Broadcasting", function () {
        var triggeredPaths,
            evented1 = EventedStaticClass.create('test>path>foo'.toPath()),
            evented2 = EventedStaticClass.create('test>path>bar'.toPath());

        // subscribing handlers
        function eventHandler(event) {
            triggeredPaths.push(event.currentPath.toString());
        }

        EventedStaticClass.subscribeTo('myEvent', eventHandler);
        evented1.subscribeTo('myEvent', eventHandler);
        evented2.subscribeTo('myEvent', eventHandler);

        // broadcasting on instance
        triggeredPaths = [];
        evented1.broadcastSync('myEvent');
        deepEqual(
            triggeredPaths.sort(),
            ['test>path', 'test>path>foo'],
            "should hit instance and static subscriptions when broadcasting on class"
        );

        // broadcasting on class
        triggeredPaths = [];
        EventedStaticClass.broadcastSync('myEvent');
        deepEqual(
            triggeredPaths.sort(),
            ['test>path', 'test>path>bar', 'test>path>foo'],
            "should hit all instance subscriptions when broadcasting on instance"
        );

        EventedStaticClass.unsubscribeFrom('myEvent');
        evented1.unsubscribeFrom('myEvent');
        evented2.unsubscribeFrom('myEvent');
    });
}());
