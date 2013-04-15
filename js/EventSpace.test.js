/*global sntls, evan, module, test, expect, ok, equal, strictEqual, deepEqual, raises */
(function () {
    module("EventSpace");

    test("Instantiation", function () {
        var eventSpace = evan.EventSpace.create();
        ok(eventSpace.eventRegistry.isA(sntls.Tree), "Event registry is a tree");
        deepEqual(eventSpace.eventRegistry.root, {}, "Event registry initialized");
    });

    test("Event creation", function () {
        expect(2);

        var eventSpace = evan.EventSpace.create();

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
        var eventSpace = evan.EventSpace.create();

        function handler1() {}

        function handler2() {}

        raises(function () {
            eventSpace.on('myEvent', 'test.event.path'.toPath(), 123);
        }, "Invalid event handler");

        eventSpace.on('myEvent', 'test.event.path'.toPath(), handler1);

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

    test("Unsubscription / one by one", function () {
        function handler1() {}

        function handler2() {}

        var eventSpace = evan.EventSpace.create()
            .on('myEvent', 'test.event.path'.toPath(), handler1)
            .on('myEvent', 'test.event.path'.toPath(), handler2);

        eventSpace.off('myEvent', 'test.event.path'.toPath(), handler1);

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

        // attempting to unsubscribe non-existing handler
        eventSpace.off('myEvent', 'test.event.path'.toPath(), handler1);

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.handlers,
            {
                'test.event.path': [handler2]
            },
            "Handlers untouched"
        );

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.paths.items,
            ['test.event.path'],
            "Paths untouched"
        );

        eventSpace.off('myEvent', 'test.event.path'.toPath(), handler2);

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.handlers,
            {},
            "Former handler unsubscribed"
        );

        deepEqual(
            eventSpace.eventRegistry.root.myEvent.paths.items,
            [],
            "Former path unsubscribed"
        );
    });

    test("Unsubscription / all at once", function () {
        function handler1() {}

        function handler2() {}

        var eventSpace = evan.EventSpace.create()
            .on('myEvent', 'test.event.path'.toPath(), handler1)
            .on('myEvent', 'test.event.path'.toPath(), handler2);

        eventSpace.off('myEvent', 'test.event.path'.toPath());

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

    test("Delegation", function () {
        expect(5);

        var eventSpace = evan.EventSpace.create(),
            result;

        function handler(/** evan.Event */ event) {
            equal(event.currentPath.toString(), 'test.event.path', "Event current path reflects delegated path");
            equal(event.originalPath.toString(), 'test.event.path.foo', "Event current path reflects delegated path");
        }

        raises(function () {
            eventSpace.delegate('myEvent', 'test.event'.toPath(), 'unrelated.path'.toEventPath(), handler);
        }, "Unrelated paths");

        raises(function () {
            eventSpace.delegate('myEvent', 'test.event'.toPath(), 'test.event.path'.toEventPath(), 'non-function');
        }, "Invalid event handler");

        // delegating event to path 'test.event.path'
        result = eventSpace.delegate('myEvent', 'test.event'.toPath(), 'test.event.path'.toEventPath(), handler);
        strictEqual(result, eventSpace, "Delegation is chainable");
        eventSpace.createEvent('myEvent').triggerSync('test.event.path.foo'.toPath());
    });

    test("Un-delegation", function () {
        var eventSpace = evan.EventSpace.create(),
            delegateHandler;

        function handler() {}

        // delegating in a way that handler may be unsubscribed
        delegateHandler = eventSpace.delegateHandler('test.event.path'.toEventPath(), handler);
        eventSpace.on('myEvent', 'test.event'.toPath(), delegateHandler);

        equal(
            eventSpace.eventRegistry.root.myEvent.handlers['test.event'].length,
            1,
            "Delegate handler subscribed"
        );

        eventSpace.off('myEvent', 'test.event'.toPath(), delegateHandler);

        equal(
            eventSpace.eventRegistry.root.myEvent.handlers.hasOwnProperty('test.event'),
            false,
            "Delegate handler unsubscribed"
        );
    });

    test("Bubbling", function () {
        expect(3);

        var eventSpace = evan.EventSpace.create()
                .on('myEvent', 'test.event', function (event, data) {
                    strictEqual(event, myEvent, "Event instance passed to handler");
                    strictEqual(data, event.data, "Custom event data passed to handler");
                }),
            myEvent = eventSpace.createEvent('myEvent'),
            result;

        myEvent.originalPath = evan.EventPath.create('test.event');
        myEvent.currentPath = myEvent.originalPath.clone();

        result = eventSpace.callHandlers(myEvent);
        strictEqual(typeof result, 'undefined', "Bubbling returns undefined");
    });

    test("Bubbling with stop-propagation", function () {
        var eventSpace = evan.EventSpace.create()
                .on('event', 'test.event'.toPath(), function () {
                    return false;
                }),
            event = eventSpace.createEvent('event');

        event.originalPath = evan.EventPath.create('test.event');
        event.currentPath = event.originalPath.clone();

        eventSpace.callHandlers(event);

        equal(eventSpace.callHandlers(event), false, "Propagation stopped by handler");
    });

    test("Path query", function () {
        var eventSpace = evan.EventSpace.create()
            .on('myEvent', 'test.event'.toPath(), function () {})
            .on('myEvent', 'test.event.foo'.toPath(), function () {})
            .on('myEvent', 'test.event.foo.bar'.toPath(), function () {})
            .on('myEvent', 'test.foo.bar'.toPath(), function () {})
            .on('myEvent', 'test.event.hello'.toPath(), function () {})
            .on('otherEvent', 'test.event'.toPath(), function () {})
            .on('otherEvent', 'test.event.foo'.toPath(), function () {});

        deepEqual(
            eventSpace.getPathsUnder('myEvent', 'test.event'.toPath()).toString().items,
            {
                0: 'test.event',
                1: 'test.event.foo',
                2: 'test.event.foo.bar',
                3: 'test.event.hello'
            },
            "Paths subscribed to 'myEvent' relative to 'test.event'"
        );

        deepEqual(
            eventSpace.getPathsUnder('myEvent', 'test.foo'.toPath()).toString().items,
            {
                0: 'test.foo.bar'
            },
            "Paths subscribed to 'myEvent' relative to 'test.foo'"
        );

        deepEqual(
            eventSpace.getPathsUnder('otherEvent', 'test.event'.toPath()).toString().items,
            {
                0: 'test.event',
                1: 'test.event.foo'
            },
            "Paths subscribed to 'otherEvent' relative to 'test.event'"
        );
    });
}());
