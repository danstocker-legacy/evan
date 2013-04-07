/*global sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function (Event) {
    module("Event");

    var eventSpace = /** @type evan.EventSpace */ evan.EventSpace.create();

    test("Instantiation", function () {
        raises(function () {
            Event.create('foo', 'testEvent');
        }, "Invalid event space");

        raises(function () {
            Event.create(eventSpace, 123);
        }, "Invalid event name");

        var event = /** @type evan.Event */ Event.create(eventSpace, 'testEvent');

        equal(event.eventName, 'testEvent', "Event name");
        strictEqual(event.eventSpace, eventSpace, "Event space");
        equal(typeof event.originalPath, 'undefined', "Original path");
        equal(typeof event.currentPath, 'undefined', "Current path");
        equal(typeof event.data, 'undefined', "Data load");
    });

    test("Trigger preparation", function () {
        var event = /** @type evan.Event */ Event.create(eventSpace, 'testEvent');
        equal(typeof event.originalPath, 'undefined', "No original path initially");
        equal(typeof event.currentPath, 'undefined', "No current path initially");
        equal(typeof event.data, 'undefined', "No data initially");

        event.prepareTrigger('test.path', 'foo');

        ok(event.originalPath.instanceOf(sntls.Path), "Original path is plain path");
        ok(event.currentPath.instanceOf(evan.EventPath), "Current path is event specific path");

        notStrictEqual(event.originalPath, event.currentPath, "Original and current path different instances");
        deepEqual(event.originalPath.asArray, ['test', 'path'], "Original path set");
        deepEqual(event.currentPath.asArray, ['test', 'path'], "Current path set");
        equal(event.data, 'foo', "Custom data set");
    });

    test("Triggering", function () {
        expect(11);

        var event = /** @type evan.Event */ Event.create(eventSpace, 'testEvent'),
            i = 0;

        evan.EventSpace.addMock({
            bubbleSync: function (event) {
                equal(event.eventName, 'testEvent', "Event name");
                equal(event.originalPath.toString(), 'test.path', "Original event path");
                equal(event.currentPath.toString(), ['test.path', 'test'][i++], "Current event path");
                deepEqual(event.data, {foo: 'bar'}, "Custom event data");
            }
        });

        event.triggerSync('test.path', {foo: 'bar'});

        equal(typeof event.originalPath, 'undefined', "Original path reset");
        equal(typeof event.currentPath, 'undefined', "Current path reset");
        equal(typeof event.data, 'undefined', "Data load reset");

        evan.EventSpace.removeMocks();
    });

    test("Triggering with stop-propagation", function () {
        expect(1);

        var event = /** @type evan.Event */ Event.create(eventSpace, 'testEvent');

        evan.EventSpace.addMock({
            bubbleSync: function (event) {
                equal(event.currentPath.toString(), 'test.path', "Current event path");

                // stops propagation after first bubbling
                return false;
            }
        });

        event.triggerSync('test.path', {foo: 'bar'});

        evan.EventSpace.removeMocks();
    });

    test("Broadcast", function () {
        var event = /** @type evan.Event */ Event.create(eventSpace, 'testEvent');

        evan.EventSpace.addMock({
            broadcastSync: function (event) {
                deepEqual(event.originalPath.toString(), 'test.path', "Event path");
                equal(event.data, 'foo', "Custom event data");
            }
        });

        event.broadcastSync('test.path', 'foo');

        evan.EventSpace.removeMocks();

        equal(typeof event.originalPath, 'undefined', "Original path reset");
        equal(typeof event.currentPath, 'undefined', "Current path reset");
        equal(typeof event.data, 'undefined', "Data load reset");
    });
}(evan.Event));
