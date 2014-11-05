/*global sntls, evan, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Event");

    var eventSpace = evan.EventSpace.create();

    test("Instantiation", function () {
        raises(function () {
            evan.Event.create();
        }, "should raise exception on invalid event name argument");

        raises(function () {
            evan.Event.create('foo');
        }, "should raise exception on invalid event space argument");

        var event = evan.Event.create('testEvent', eventSpace);

        equal(event.eventName, 'testEvent', "should set event name");
        strictEqual(event.eventSpace, eventSpace, "should set event space");

        equal(event.canBubble, true, "should turn on bubbling");
        equal(typeof event.originalEvent, 'undefined', "should clear original event");
        equal(event.defaultPrevented, false, "should set defaultPrevented to false");
        equal(event.handled, false, "should set handled flag to false");

        equal(typeof event.originalPath, 'undefined', "should clear original path");
        equal(typeof event.currentPath, 'undefined', "should clear current path");
        equal(typeof event.payload, 'undefined', "should clear custom data");
    });

    test("Cloning event", function () {
        var MyEvent = evan.Event.extend(),
            originalEvent = MyEvent.create('testEvent', eventSpace)
                .setTargetPath('test.path.hello.world'.toPath())
                .setPayload({foo: 'bar'}),
            cloneEvent,
            currentPath;

        cloneEvent = originalEvent.clone();

        ok(cloneEvent.isA(MyEvent), "should preserve event (sub)class");
        strictEqual(originalEvent.eventSpace, cloneEvent.eventSpace, "should transfer event space");
        equal(originalEvent.eventName, cloneEvent.eventName, "should transfer event name");

        strictEqual(originalEvent.originalEvent, cloneEvent.originalEvent, "should transfer original event");
        equal(originalEvent.defaultPrevented, cloneEvent.defaultPrevented, "should transfer default prevention flag");
        equal(originalEvent.handled, cloneEvent.handled, "should transfer handled flag");

        strictEqual(originalEvent.originalPath, cloneEvent.originalPath, "should transfer original path");
        notStrictEqual(originalEvent.currentPath, cloneEvent.currentPath, "should create a new current path");
        equal(originalEvent.currentPath.toString(), cloneEvent.currentPath.toString(), "should transfer contents of current path");

        strictEqual(originalEvent.payload, cloneEvent.payload, "should transfer data load");

        currentPath = 'test>path'.toPath();
        cloneEvent = originalEvent.clone(currentPath);

        notStrictEqual(cloneEvent.currentPath, currentPath, "Current path is not the same as specified...");
        equal(cloneEvent.currentPath.toString(), 'test>path', "..but they match");
    });

    test("Setting original event", function () {
        var originalEvent = evan.Event.create('originalEvent', eventSpace),
            event = evan.Event.create('testEvent', eventSpace);

        strictEqual(event.setOriginalEvent(originalEvent), event, "should be chainable");
        strictEqual(event.originalEvent, originalEvent, "should set original event");
    });

    test("Getting original event by type", function () {
        var event1 = new Event('foo'),
            Event2 = evan.Event.extend(),
            Event3 = evan.Event.extend(),
            event2 = Event2.create('event2', evan.EventSpace.create())
                .setOriginalEvent(event1),
            event3 = Event3.create('event3', evan.EventSpace.create())
                .setOriginalEvent(event2),
            event = evan.Event.create('event', evan.EventSpace.create())
                .setOriginalEvent(event3);

        strictEqual(event.getOriginalEventByType(Event), event1);
        strictEqual(event.getOriginalEventByType(Event2), event2);
        strictEqual(event.getOriginalEventByType(Event3), event3);
        strictEqual(event.getOriginalEventByType(evan.Event), event3);
    });

    test("Setting default prevention flag", function () {
        var event = evan.Event.create('testEvent', eventSpace);

        strictEqual(event.preventDefault(), event, "should be chainable");
        equal(event.defaultPrevented, true, "should set defaultPrevented to true");
    });

    test("Setting target path", function () {
        var event = evan.Event.create('testEvent', eventSpace);

        raises(function () {
            event.setTargetPath('test>path');
        }, "should raise exception on invalid path");

        event.setTargetPath('test>path'.toPath());

        ok(event.originalPath.instanceOf(sntls.Path), "should set a Path instance as originalPath");
        ok(event.currentPath.instanceOf(sntls.Path), "should set a Path instance as currentPath");

        notStrictEqual(event.originalPath, event.currentPath,
            "should set different Path instances for originalPath and currentPath");
        equal(event.originalPath.toString(), event.currentPath.toString(),
            "should set originalPath and currentPath with identical contents");
    });

    test("Setting payload", function () {
        var event = evan.Event.create('testEvent', eventSpace);

        event.setPayload('foo');

        equal(event.payload, 'foo', "should set payload");
    });

    test("Triggering event", function () {
        expect(13);

        var originalEvent = evan.Event.create('original-event', eventSpace),
            payload = {foo: 'bar'},
            event = evan.Event.create('test-event', eventSpace)
                .setPayload(payload)
                .setOriginalEvent(originalEvent),
            handledFlags = [],
            i = 0;

        evan.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.eventName, 'test-event',
                    "should call handlers with correct event name");
                equal(event.originalPath.toString(), 'test>path',
                    "should call handlers with correct original event path,");
                equal(event.currentPath.toString(), ['test>path', 'test'][i++],
                    "should call handlers with correct current event path");
                strictEqual(event.payload, payload,
                    "should call handlers with correct payload");

                handledFlags.push(event.handled);

                // emulating that one handler was run
                return 1;
            }
        });

        event.triggerSync('test>path'.toPath());

        deepEqual(handledFlags, [false, true], "should set handled flags as event bubbles");

        equal(event.originalPath.toString(), 'test>path', "should leave original path intact");
        deepEqual(event.currentPath.asArray, [], "should leave current path empty (traversed)");
        strictEqual(event.payload, payload, "should leave payload intact");
        strictEqual(event.originalEvent, originalEvent, "should leave original event intact");

        evan.EventSpace.removeMocks();
    });

    test("Triggering with stop-propagation", function () {
        expect(1);

        var event = evan.Event.create('testEvent', eventSpace);

        evan.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>path', "should call handlers on specified path");

                // stops propagation after first bubbling
                return false;
            }
        });

        event.triggerSync('test>path'.toPath());

        evan.EventSpace.removeMocks();
    });

    test("Triggering on queries", function () {
        expect(2);

        var event = evan.Event.create('testEvent', eventSpace);

        evan.EventSpace.addMocks({
            callHandlers: function (event) {
                ok(event.currentPath.isA(sntls.Query), "should call handlers with query");
                equal(event.currentPath.toString(), 'test>|>path', "should set correct query contents");
            }
        });

        event.triggerSync('test>|>path'.toQuery());

        evan.EventSpace.removeMocks();
    });

    test("Triggering without bubbling", function () {
        expect(1);

        var event = evan.Event.create('testEvent', eventSpace)
            .allowBubbling(false);

        evan.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>path', "should call handlers only once");
            }
        });

        event.triggerSync('test>path'.toPath());

        evan.EventSpace.removeMocks();
    });

    test("Broadcasting event", function () {
        expect(9);

        var triggeredPaths = [],
            payload = {foo: "bar"},
            eventSpace = evan.EventSpace.create()
                .subscribeTo('my-event', 'test.event'.toPath(), function () {})
                .subscribeTo('my-event', 'test.event.foo'.toPath(), function () {})
                .subscribeTo('my-event', 'test.event.foo.bar'.toPath(), function () {})
                .subscribeTo('my-event', 'test.foo.bar'.toPath(), function () {})
                .subscribeTo('my-event', 'test.event.hello'.toPath(), function () {})
                .subscribeTo('other-event', 'test.event'.toPath(), function () {})
                .subscribeTo('other-event', 'test.event.foo'.toPath(), function () {}),
            originalEvent = eventSpace.spawnEvent('original-event'),
            event = eventSpace.spawnEvent('my-event')
                .setOriginalEvent(originalEvent)
                .setPayload(payload);

        evan.Event.addMocks({
            triggerSync: function () {
                triggeredPaths.push(this.originalPath.toString());
                strictEqual(this.payload, payload, "should set payload on spawned event");
                strictEqual(this.originalEvent, originalEvent, "should set original event on spawned event");
            }
        });

        event.broadcastSync('test.event'.toPath());

        deepEqual(
            triggeredPaths,
            ['test.event.foo', 'test.event.foo.bar', 'test.event.hello', 'test.event'],
            "should trigger event on all paths below broadcast path"
        );

        evan.Event.removeMocks();
    });
}());
