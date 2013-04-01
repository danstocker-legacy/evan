/*global evan, module, test, expect, ok, equal, strictEqual, deepEqual, raises */
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
        strictEqual(event.originalPath, null, "Original path");
        strictEqual(event.currentPath, null, "Current path");
        strictEqual(event.data, null, "Data load");
    });

    test("Bubbling state", function () {
        var event = /** @type evan.Event */ Event.create(eventSpace, 'testEvent');

        equal(event.isBubbling(), false, "New event is not bubbling");

        event.originalPath = evan.EventPath.create('test.path');
        event.currentPath = event.originalPath.clone();

        equal(event.isBubbling(), true, "New event is not bubbling");
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

        strictEqual(event.originalPath, null, "Original path reset");
        strictEqual(event.currentPath, null, "Current path reset");
        strictEqual(event.data, null, "Data load reset");

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
}(evan.Event));
