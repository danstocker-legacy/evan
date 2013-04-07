/*global sntls, evan, module, test, expect, ok, equal, strictEqual, deepEqual, raises */
(function (EventSpace) {
    module("EventSpace");

    test("Instantiation", function () {
        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create();
        ok(eventSpace.eventRegistry.isA(sntls.Tree), "Event registry is a tree");
        deepEqual(eventSpace.eventRegistry.root, {}, "Event registry initialized");
    });

    test("Event creation", function () {
        expect(2);

        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create();

        evan.Event.addMock({
            create: function (es, eventName) {
                strictEqual(es, eventSpace, "Event space");
                equal(eventName, 'myEvent', "Event name");
            }
        });

        eventSpace.createEvent('myEvent');

        evan.Event.removeMocks();
    });

    test("Subscription", function () {
        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create();

        function handler1() {}

        function handler2() {}

        raises(function () {
            eventSpace.on('myEvent', 'test.event.path', 123);
        }, "Invalid event handler");

        eventSpace.on('myEvent', 'test.event.path', handler1);

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.handlers,
            {
                'test.event.path': [handler1]
            },
            "Event handler added to registry"
        );

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.paths.items,
            ['test.event.path'],
            "Event path added to registry"
        );

        eventSpace.on('myEvent', 'test.event.path', handler2);

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.handlers,
            {
                'test.event.path': [handler1, handler2]
            },
            "Event handler added to registry"
        );

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.paths.items,
            ['test.event.path', 'test.event.path'],
            "Event path added to registry"
        );
    });

    test("Unsubscription", function () {
        function handler1() {}

        function handler2() {}

        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create()
            .on('myEvent', 'test.event.path', handler1)
            .on('myEvent', 'test.event.path', handler2);

        eventSpace.off('myEvent', 'test.event.path', handler1);

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.handlers,
            {
                'test.event.path': [handler2]
            },
            "Former handler unsubscribed"
        );

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.paths.items,
            ['test.event.path'],
            "Former path unsubscribed"
        );

        eventSpace.off('myEvent', 'test.event.path');

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.handlers,
            {},
            "All handlers unsubscribed"
        );

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.paths.items,
            [],
            "All paths unsubscribed"
        );
    });

    test("Bubbling", function () {
        expect(3);

        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create()
                .on('myEvent', 'test.event', function (event, data) {
                    strictEqual(event, myEvent, "Event instance passed to handler");
                    strictEqual(data, event.data, "Custom event data passed to handler");
                }),
            myEvent = eventSpace.createEvent('myEvent'),
            result;

        myEvent.originalPath = evan.EventPath.create('test.event');
        myEvent.currentPath = myEvent.originalPath.clone();

        result = eventSpace.bubbleSync(myEvent);
        strictEqual(typeof result, 'undefined', "Bubbling returns undefined");
    });

    test("Bubbling with stop-propagation", function () {
        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create()
                .on('event', 'test.event', function () {
                    return false;
                }),
            event = eventSpace.createEvent('event');

        event.originalPath = evan.EventPath.create('test.event');
        event.currentPath = event.originalPath.clone();

        eventSpace.bubbleSync(event);

        equal(eventSpace.bubbleSync(event), false, "Propagation stopped by handler");
    });
}(evan.EventSpace));
