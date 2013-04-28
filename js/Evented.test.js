/*global troop, sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Evented");

    var EventedClass = troop.Base.extend()
        .addTrait(evan.Evented)
        .addConstant({
            eventSpace: evan.EventSpace.create()
        })
        .addMethod({
            init: function () {}
        });

    test("Subscription", function () {
        expect(3);

        var evented = EventedClass.create();

        function eventHandler () {}

        evan.EventSpace.addMock({
            on: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(eventPath.equals('this.is.a.path'.toPath()), "Event path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        evented.on('myEvent', 'this.is.a.path'.toPath(), eventHandler);

        evan.Event.removeMocks();
    });

    test("Unsubscription", function () {
        expect(3);

        var evented = EventedClass.create();

        function eventHandler () {}

        evan.EventSpace.addMock({
            off: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(eventPath.equals('this.is.a.path'.toPath()), "Event path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        evented.off('myEvent', 'this.is.a.path'.toPath(), eventHandler);

        evan.Event.removeMocks();
    });

    test("One time subscription", function () {
        expect(3);

        var evented = EventedClass.create();

        function eventHandler () {}

        evan.EventSpace.addMock({
            one: function (eventName, eventPath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(eventPath.equals('this.is.a.path'.toPath()), "Event path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        evented.one('myEvent', 'this.is.a.path'.toPath(), eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Delegation", function () {
        expect(4);

        var evented = EventedClass.create();

        function eventHandler () {}

        evan.EventSpace.addMock({
            delegate: function (eventName, capturePath, delegatePath, handler) {
                equal(eventName, 'myEvent', "Event name");
                ok(capturePath.equals('this'.toPath()), "Capture path");
                ok(delegatePath.equals('this.is.a.path'.toPath()), "Delegate path");
                strictEqual(handler, eventHandler, "Event handler");
            }
        });

        evented.delegate('myEvent', 'this'.toPath(), 'this.is.a.path'.toPath(), eventHandler);

        evan.EventSpace.removeMocks();
    });

    test("Triggering", function () {
        expect(4);

        var evented = EventedClass.create();

        evan.Event.addMock({
            triggerSync: function (path) {
                equal(this.eventName, 'myEvent', "Event name");
                strictEqual(this.eventSpace, EventedClass.eventSpace, "Event operates on class' event space");
                ok(path.equals('this.is.a.path'.toPath()), "Target path");
                ok(true, "Event triggered");
            }
        });

        evented.triggerSync('myEvent', 'this.is.a.path'.toPath());

        evan.Event.removeMocks();
    });

    test("Broadcasting", function () {
        expect(4);

        var evented = EventedClass.create();

        evan.Event.addMock({
            broadcastSync: function (path) {
                equal(this.eventName, 'myEvent', "Event name");
                strictEqual(this.eventSpace, EventedClass.eventSpace, "Event operates on class' event space");
                ok(path.equals('this.is.a.path'.toPath()), "Target path");
                ok(true, "Event triggered");
            }
        });

        evented.broadcastSync('myEvent', 'this.is.a.path'.toPath());

        evan.Event.removeMocks();
    });
}());
