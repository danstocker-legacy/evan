/*global sntls, e$, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Event");

    var eventSpace = e$.EventSpace.create();

    test("Instantiation", function () {
        raises(function () {
            e$.Event.create();
        }, "should raise exception on invalid event name argument");

        raises(function () {
            e$.Event.create('foo');
        }, "should raise exception on invalid event space argument");

        var event = e$.Event.create('testEvent', eventSpace);

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
        var MyEvent = e$.Event.extend(),
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
        var originalEvent = e$.Event.create('originalEvent', eventSpace),
            event = e$.Event.create('testEvent', eventSpace);

        strictEqual(event.setOriginalEvent(originalEvent), event, "should be chainable");
        strictEqual(event.originalEvent, originalEvent, "should set original event");
    });

    test("Getting original event by type", function () {
        var event1 = new Event('foo'),
            Event2 = e$.Event.extend(),
            Event3 = e$.Event.extend(),
            event2 = Event2.create('event2', e$.EventSpace.create())
                .setOriginalEvent(event1),
            event3 = Event3.create('event3', e$.EventSpace.create())
                .setOriginalEvent(event2),
            event = e$.Event.create('event', e$.EventSpace.create())
                .setOriginalEvent(event3);

        strictEqual(event.getOriginalEventByType(Event), event1);
        strictEqual(event.getOriginalEventByType(Event2), event2);
        strictEqual(event.getOriginalEventByType(Event3), event3);
        strictEqual(event.getOriginalEventByType(e$.Event), event3);
    });

    test("Setting default prevention flag", function () {
        var event = e$.Event.create('testEvent', eventSpace);

        strictEqual(event.preventDefault(), event, "should be chainable");
        equal(event.defaultPrevented, true, "should set defaultPrevented to true");
    });

    test("Setting target path", function () {
        var event = e$.Event.create('testEvent', eventSpace);

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
        var event = e$.Event.create('testEvent', eventSpace);

        event.setPayload('foo');

        equal(event.payload, 'foo', "should set payload");
    });

    test("Triggering event", function () {
        expect(10);

        var event = e$.Event.create('testEvent', eventSpace),
            handledFlags = [],
            i = 0;

        e$.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.eventName, 'testEvent',
                    "should call handlers with correct event name");
                equal(event.originalPath.toString(), 'test>path',
                    "should call handlers with correct original event path,");
                equal(event.currentPath.toString(), ['test>path', 'test'][i++],
                    "should call handlers with correct current event path");
                deepEqual(event.payload, {foo: 'bar'},
                    "should call handlers with correct payload");

                handledFlags.push(event.handled);
            }
        });
        e$.Event.addMocks({
            reset: function () {
                strictEqual(this, event, "should reset event");
            }
        });

        event.triggerSync('test>path'.toPath(), {foo: 'bar'});

        deepEqual(handledFlags, [false, true], "should set handled flags");

        e$.EventSpace.removeMocks();
        e$.Event.removeMocks();
    });

    test("Triggering with stop-propagation", function () {
        expect(1);

        var event = e$.Event.create('testEvent', eventSpace);

        e$.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>path', "should call handlers on specified path");

                // stops propagation after first bubbling
                return false;
            }
        });

        event.triggerSync('test>path'.toPath());

        e$.EventSpace.removeMocks();
    });

    test("Triggering on queries", function () {
        expect(2);

        var event = e$.Event.create('testEvent', eventSpace);

        e$.EventSpace.addMocks({
            callHandlers: function (event) {
                ok(event.currentPath.isA(sntls.Query), "should call handlers with query");
                equal(event.currentPath.toString(), 'test>|>path', "should set correct query contents");
            }
        });

        event.triggerSync('test>|>path'.toQuery());

        e$.EventSpace.removeMocks();
    });

    test("Triggering without bubbling", function () {
        expect(1);

        var event = e$.Event.create('testEvent', eventSpace)
            .allowBubbling(false);

        e$.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>path', "should call handlers only once");
            }
        });

        event.triggerSync('test>path'.toPath());

        e$.EventSpace.removeMocks();
    });

    // TODO: should test mocking
    test("Broadcasting event", function () {
        var triggeredPaths = [],
            eventSpace = e$.EventSpace.create()
                .subscribeTo('myEvent', 'test.event'.toPath(), function () {})
                .subscribeTo('myEvent', 'test.event.foo'.toPath(), function () {})
                .subscribeTo('myEvent', 'test.event.foo.bar'.toPath(), function () {})
                .subscribeTo('myEvent', 'test.foo.bar'.toPath(), function () {})
                .subscribeTo('myEvent', 'test.event.hello'.toPath(), function () {})
                .subscribeTo('otherEvent', 'test.event'.toPath(), function () {})
                .subscribeTo('otherEvent', 'test.event.foo'.toPath(), function () {}),
            event = eventSpace.spawnEvent('myEvent');

        e$.Event.addMocks({
            triggerSync: function () {
                triggeredPaths.push(this.originalPath.toString());
            }
        });

        event.broadcastSync('test.event'.toPath(), 'foo');

        deepEqual(
            triggeredPaths,
            ['test.event.foo', 'test.event.foo.bar', 'test.event.hello', 'test.event'],
            "should trigger event on all paths below broadcast path"
        );

        e$.Event.removeMocks();
    });
}());
