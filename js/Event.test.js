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

        equal(typeof event.originalPath, 'undefined', "should clear original path");
        equal(typeof event.currentPath, 'undefined', "should clear current path");
        equal(typeof event.data, 'undefined', "should clear custom data");
    });

    test("Cloning", function () {
        var MyEvent = evan.Event.extend(),
            originalEvent = MyEvent.create(eventSpace, 'testEvent')
                .setTargetPath('test.path.hello.world'.toPath())
                .setData({foo: 'bar'}),
            cloneEvent,
            currentPath;

        cloneEvent = originalEvent.clone();

        ok(cloneEvent.isA(MyEvent), "Event is instance of subclass");
        strictEqual(originalEvent.eventSpace, cloneEvent.eventSpace, "Event spaces are the same");
        equal(originalEvent.eventName, cloneEvent.eventName, "Event names are the same");
        strictEqual(originalEvent.originalPath, cloneEvent.originalPath, "Original paths are the same");
        notStrictEqual(originalEvent.currentPath, cloneEvent.currentPath, "Current paths are not the same...");
        equal(originalEvent.currentPath.toString(), cloneEvent.currentPath.toString(), "...but they match");
        strictEqual(originalEvent.data, cloneEvent.data, "Custom data is the same");

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

    test("Triggering", function () {
        expect(11);

        var event = evan.Event.create(eventSpace, 'testEvent'),
            i = 0;

        evan.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.eventName, 'testEvent', "Event name");
                equal(event.originalPath.toString(), 'test>path', "Original event path");
                equal(event.currentPath.toString(), ['test>path', 'test'][i++], "Current event path");
                deepEqual(event.data, {foo: 'bar'}, "Custom event data");
            }
        });

        event.triggerSync('test>path'.toPath(), {foo: 'bar'});

        equal(typeof event.originalPath, 'undefined', "Original path reset");
        equal(typeof event.currentPath, 'undefined', "Current path reset");
        equal(typeof event.data, 'undefined', "Data load reset");

        evan.EventSpace.removeMocks();
    });

    test("Triggering with stop-propagation", function () {
        expect(1);

        var event = evan.Event.create(eventSpace, 'testEvent');

        evan.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>path', "Current event path");

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
