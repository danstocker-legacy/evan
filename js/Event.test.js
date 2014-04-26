/*global sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Event");

    var eventSpace = evan.EventSpace.create();

    test("Creating an event", function () {
        raises(function () {
            evan.Event.create('foo', 'testEvent');
        }, "with invalid event space should raise exception");

        raises(function () {
            evan.Event.create(eventSpace, 123);
        }, "with invalid event name should raise exception");

        var event = evan.Event.create(eventSpace, 'testEvent');

        equal(event.eventName, 'testEvent', "should set event name");
        strictEqual(event.eventSpace, eventSpace, "should set event space");

        equal(event.canBubble, true, "should turn on bubbling");
        equal(typeof event.originalEvent, 'undefined', "should clear original event");
        equal(event.defaultPrevented, false, "should set defaultPrevented to false");
        equal(event.handled, false, "should set handled flag to false");

        equal(typeof event.originalPath, 'undefined', "should clear original path");
        equal(typeof event.currentPath, 'undefined', "should clear current path");
        equal(typeof event.data, 'undefined', "should clear custom data");
    });

    test("Cloning event", function () {
        var MyEvent = evan.Event.extend(),
            originalEvent = MyEvent.create(eventSpace, 'testEvent')
                .setTargetPath('test.path.hello.world'.toPath())
                .setData({foo: 'bar'}),
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

        strictEqual(originalEvent.data, cloneEvent.data, "should transfer data load");

        currentPath = 'test>path'.toPath();
        cloneEvent = originalEvent.clone(currentPath);

        notStrictEqual(cloneEvent.currentPath, currentPath, "Current path is not the same as specified...");
        equal(cloneEvent.currentPath.toString(), 'test>path', "..but they match");
    });

    test("Setting original event", function () {
        var originalEvent = evan.Event.create(eventSpace, 'originalEvent'),
            event = evan.Event.create(eventSpace, 'testEvent');

        raises(function () {
            event.setOriginalEvent();
        }, "to invalid value should raise exception");

        strictEqual(event.setOriginalEvent(originalEvent), event, "should be chainable");
        strictEqual(event.originalEvent, originalEvent, "should set original event");
    });

    test("Setting default prevention flag", function () {
        var event = evan.Event.create(eventSpace, 'testEvent');

        strictEqual(event.preventDefault(), event, "should be chainable");
        equal(event.defaultPrevented, true, "should set defaultPrevented to true");
    });

    test("Setting path", function () {
        var event = evan.Event.create(eventSpace, 'testEvent');
        equal(typeof event.originalPath, 'undefined', "No original path initially");
        equal(typeof event.currentPath, 'undefined', "No current path initially");

        raises(function () {
            event.setTargetPath('test>path');
        }, "Invalid path");

        event.setTargetPath('test>path'.toPath());

        ok(event.originalPath.instanceOf(sntls.Path), "Original path is plain path");
        ok(event.currentPath.instanceOf(sntls.Path), "Current path is plain path");

        notStrictEqual(event.originalPath, event.currentPath, "Original and current path different instances");
        deepEqual(event.originalPath.asArray, ['test', 'path'], "Original path set");
        deepEqual(event.currentPath.asArray, ['test', 'path'], "Current path set");
    });

    test("Setting custom data", function () {
        var event = evan.Event.create(eventSpace, 'testEvent');
        equal(typeof event.data, 'undefined', "No data initially");

        event.setData('foo');

        equal(event.data, 'foo', "Custom data set");
    });

    test("Triggering event", function () {
        expect(10);

        var event = evan.Event.create(eventSpace, 'testEvent'),
            handledFlags = [],
            i = 0;

        evan.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.eventName, 'testEvent', "should call handlers with: event name,");
                equal(event.originalPath.toString(), 'test>path', "original event path,");
                equal(event.currentPath.toString(), ['test>path', 'test'][i++], "current event path,");
                deepEqual(event.data, {foo: 'bar'}, "and custom event data");
                handledFlags.push(event.handled);
            }
        });
        evan.Event.addMocks({
            _reset: function () {
                strictEqual(this, event, "should reset event");
            }
        });

        event.triggerSync('test>path'.toPath(), {foo: 'bar'});

        deepEqual(handledFlags, [false, true], "should set handled flags");

        evan.EventSpace.removeMocks();
        evan.Event.removeMocks();
    });

    test("Triggering with stop-propagation", function () {
        expect(1);

        var event = evan.Event.create(eventSpace, 'testEvent');

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
        expect(1);

        var event = evan.Event.create(eventSpace, 'testEvent');

        evan.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>|>path', "Current event path");
            }
        });

        event.triggerSync('test>|>path'.toQuery());

        evan.EventSpace.removeMocks();
    });

    test("Triggering without bubbling at all", function () {
        expect(1);

        var event = evan.Event.create(eventSpace, 'testEvent')
            .allowBubbling(false);

        evan.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>path', "Current event path");
            }
        });

        event.triggerSync('test>path'.toPath());

        evan.EventSpace.removeMocks();
    });

    test("Broadcast", function () {
        var triggeredPaths = [],
            eventSpace = evan.EventSpace.create()
                .subscribeTo('myEvent', 'test.event'.toPath(), function () {})
                .subscribeTo('myEvent', 'test.event.foo'.toPath(), function () {})
                .subscribeTo('myEvent', 'test.event.foo.bar'.toPath(), function () {})
                .subscribeTo('myEvent', 'test.foo.bar'.toPath(), function () {})
                .subscribeTo('myEvent', 'test.event.hello'.toPath(), function () {})
                .subscribeTo('otherEvent', 'test.event'.toPath(), function () {})
                .subscribeTo('otherEvent', 'test.event.foo'.toPath(), function () {}),
            event = eventSpace.spawnEvent('myEvent');

        evan.Event.addMocks({
            triggerSync: function () {
                triggeredPaths.push(this.originalPath.toString());
            }
        });

        event.broadcastSync('test.event'.toPath(), 'foo');

        deepEqual(
            triggeredPaths,
            ['test.event.foo', 'test.event.foo.bar', 'test.event.hello', 'test.event'],
            "Paths triggered by broadcast"
        );

        evan.Event.removeMocks();
    });
}());
