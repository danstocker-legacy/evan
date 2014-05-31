/*global sntls, e$, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
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
        equal(typeof event.data, 'undefined', "should clear custom data");
    });

    test("Cloning event", function () {
        var MyEvent = e$.Event.extend(),
            originalEvent = MyEvent.create('testEvent', eventSpace)
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
        var originalEvent = e$.Event.create('originalEvent', eventSpace),
            event = e$.Event.create('testEvent', eventSpace);

        raises(function () {
            event.setOriginalEvent();
        }, "to invalid value should raise exception");

        strictEqual(event.setOriginalEvent(originalEvent), event, "should be chainable");
        strictEqual(event.originalEvent, originalEvent, "should set original event");
    });

    test("Setting default prevention flag", function () {
        var event = e$.Event.create('testEvent', eventSpace);

        strictEqual(event.preventDefault(), event, "should be chainable");
        equal(event.defaultPrevented, true, "should set defaultPrevented to true");
    });

    test("Setting path", function () {
        var event = e$.Event.create('testEvent', eventSpace);
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
        var event = e$.Event.create('testEvent', eventSpace);
        equal(typeof event.data, 'undefined', "No data initially");

        event.setData('foo');

        equal(event.data, 'foo', "Custom data set");
    });

    test("Triggering event", function () {
        expect(10);

        var event = e$.Event.create('testEvent', eventSpace),
            handledFlags = [],
            i = 0;

        e$.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.eventName, 'testEvent', "should call handlers with: event name,");
                equal(event.originalPath.toString(), 'test>path', "original event path,");
                equal(event.currentPath.toString(), ['test>path', 'test'][i++], "current event path,");
                deepEqual(event.data, {foo: 'bar'}, "and custom event data");
                handledFlags.push(event.handled);
            }
        });
        e$.Event.addMocks({
            _reset: function () {
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
        expect(1);

        var event = e$.Event.create('testEvent', eventSpace);

        e$.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>|>path', "Current event path");
            }
        });

        event.triggerSync('test>|>path'.toQuery());

        e$.EventSpace.removeMocks();
    });

    test("Triggering without bubbling at all", function () {
        expect(1);

        var event = e$.Event.create('testEvent', eventSpace)
            .allowBubbling(false);

        e$.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>path', "Current event path");
            }
        });

        event.triggerSync('test>path'.toPath());

        e$.EventSpace.removeMocks();
    });

    test("Broadcast", function () {
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
            "Paths triggered by broadcast"
        );

        e$.Event.removeMocks();
    });
}());
