/*global troop, sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Evented");

    var eventSpace = evan.EventSpace.create(),

        EventedStaticClass = troop.Base.extend()
            .addTrait(evan.Evented)
            .initEvented(eventSpace, 'test>path'.toPath())
            .addMethods({
                init: function (path) {
                    this.initEvented(eventSpace, path);
                }
            }),

        EventedClass = troop.Base.extend()
            .addTrait(evan.Evented)
            .addMethods({
                init: function (path) {
                    this.initEvented(evan.EventSpace.create(), path);
                }
            });

    test("Static subscription", function () {
        expect(3);

        function eventHandler() {}

        evan.EventSpace.addMocks({
            subscribeTo: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(eventPath.equals('test>path'.toPath()), "Event path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        EventedStaticClass.subscribeTo('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Instance level subscription", function () {
        expect(3);

        var evented = EventedClass.create('test>path>foo>bar'.toPath());

        function eventHandler() {}

        evan.EventSpace.addMocks({
            subscribeTo: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(eventPath.equals('test>path>foo>bar'.toPath()), "Event path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        evented.subscribeTo('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Unsubscription", function () {
        expect(3);

        function eventHandler() {}

        evan.EventSpace.addMocks({
            unsubscribeFrom: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(eventPath.equals('test>path'.toPath()), "Event path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        EventedStaticClass.unsubscribeFrom('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Instance level unsubscription", function () {
        expect(3);

        var evented = EventedClass.create('test>path>foo>bar'.toPath());

        function eventHandler() {}

        evan.EventSpace.addMocks({
            unsubscribeFrom: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(eventPath.equals('test>path>foo>bar'.toPath()), "Event path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        evented.unsubscribeFrom('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Static one time subscription", function () {
        expect(3);

        function eventHandler() {}

        evan.EventSpace.addMocks({
            one: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(eventPath.equals('test>path'.toPath()), "Event path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        EventedStaticClass.one('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Instance level one time subscription", function () {
        expect(3);

        var evented = EventedClass.create('test>path>foo>bar'.toPath());

        function eventHandler() {}

        evan.EventSpace.addMocks({
            one: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(eventPath.equals('test>path>foo>bar'.toPath()), "Event path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        evented.one('myEvent', eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Static delegation", function () {
        expect(4);

        function eventHandler() {}

        evan.EventSpace.addMocks({
            delegate: function (eventName, capturePath, delegatePath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(capturePath.equals('test>path'.toPath()), "Capture path");
                ok(delegatePath.equals('test>path>foo'.toPath()), "Delegate path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        EventedStaticClass.delegate('myEvent', 'test>path>foo'.toPath(), eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Instance level delegation", function () {
        expect(4);

        var evented = EventedClass.create('test>path>foo>bar'.toPath());

        function eventHandler() {}

        evan.EventSpace.addMocks({
            delegate: function (eventName, capturePath, delegatePath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(capturePath.equals('test>path>foo>bar'.toPath()), "Capture path");
                ok(delegatePath.equals('test>path>foo>bar>hello>world'.toPath()), "Delegate path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        evented.delegate('myEvent', 'test>path>foo>bar>hello>world'.toPath(), eventHandler);

        evan.EventSpace.removeMocks();
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

        deepEqual(triggeredPaths, ['test>path>foo', 'test>path'], "Event hits both static and instance subscriptions");

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
            "Broadcasting on instance hits instance and class"
        );

        // broadcasting on class
        triggeredPaths = [];
        EventedStaticClass.broadcastSync('myEvent');
        deepEqual(
            triggeredPaths.sort(),
            ['test>path', 'test>path>bar', 'test>path>foo'],
            "Broadcasting on class hits all instances too"
        );

        EventedStaticClass.unsubscribeFrom('myEvent');
        evented1.unsubscribeFrom('myEvent');
        evented2.unsubscribeFrom('myEvent');
    });
}());
