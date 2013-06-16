/*global sntls, evan, module, test, expect, ok, equal, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("EventSpace");

    test("Instantiation", function () {
        var eventSpace = evan.EventSpace.create();
        ok(eventSpace.eventRegistry.isA(sntls.Tree), "Event registry is a tree");
        deepEqual(eventSpace.eventRegistry.items, {}, "Event registry initialized");
    });

    test("Event creation", function () {
        expect(2);

        var eventSpace = evan.EventSpace.create();

        evan.Event.addMocks({
            create: function (es, eventName) {
                strictEqual(es, eventSpace, "Event space");
                equal(eventName, 'myEvent', "Event name");
            }
        });

        eventSpace.spawnEvent('myEvent');

        evan.Event.removeMocks();
    });

    test("Subscription", function () {
        var eventSpace = evan.EventSpace.create();

        function handler1() {}

        function handler2() {}

        raises(function () {
            eventSpace.subscribeTo('myEvent', 'test>event>path'.toPath(), 123);
        }, "Invalid event handler");

        eventSpace.subscribeTo('myEvent', 'test>event>path'.toPath(), handler1);

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.handlers,
            {
                'test>event>path': [handler1]
            },
            "Event handler added to registry"
        );

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            ['test>event>path'],
            "Event path added to registry"
        );

        eventSpace.subscribeTo('myEvent', 'test>event>path', handler2);

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.handlers,
            {
                'test>event>path': [handler1, handler2]
            },
            "Event handler added to registry"
        );

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            ['test>event>path', 'test>event>path'],
            "Event path added to registry"
        );
    });

    test("Unsubscription / one by one", function () {
        function handler1() {}

        function handler2() {}

        var eventSpace = evan.EventSpace.create()
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler1)
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler2);

        eventSpace.off('myEvent', 'test>event>path'.toPath(), handler1);

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.handlers,
            {
                'test>event>path': [handler2]
            },
            "Former handler unsubscribed"
        );

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            ['test>event>path'],
            "Former path unsubscribed"
        );

        // attempting to unsubscribe non-existing handler
        eventSpace.off('myEvent', 'test>event>path'.toPath(), handler1);

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.handlers,
            {
                'test>event>path': [handler2]
            },
            "Handlers untouched"
        );

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            ['test>event>path'],
            "Paths untouched"
        );

        eventSpace.off('myEvent', 'test>event>path'.toPath(), handler2);

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.handlers,
            {},
            "Former handler unsubscribed"
        );

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            [],
            "Former path unsubscribed"
        );
    });

    test("Unsubscription / all at once", function () {
        function handler1() {}

        function handler2() {}

        var eventSpace = evan.EventSpace.create()
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler1)
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler2);

        eventSpace.off('myEvent', 'test>event>path'.toPath());

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.handlers,
            {},
            "All handlers unsubscribed"
        );

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            [],
            "All paths unsubscribed"
        );
    });

    test("One time subscription", function () {
        function handler() {}

        var eventSpace = evan.EventSpace.create(),
            result;

        result = eventSpace.one('myEvent', 'test>event>path'.toPath(), handler);

        equal(typeof result, 'function', "Returns wrapped handler");
        equal(
            eventSpace.eventRegistry.items.myEvent.handlers['test>event>path'].length,
            1,
            "One time handler subscribed"
        );

        // unsubscribing event before triggering
        eventSpace.off('myEvent', 'test>event>path'.toPath(), result);

        equal(
            eventSpace.eventRegistry.items.myEvent.handlers.hasOwnProperty('test>event>path'),
            false,
            "One time handler subscribed"
        );

        // re binding and triggering event
        eventSpace.one('myEvent', 'test>event>path'.toPath(), handler);
        eventSpace.spawnEvent('myEvent').triggerSync('test>event>path'.toPath());

        equal(
            eventSpace.eventRegistry.items.myEvent.handlers.hasOwnProperty('test>event>path'),
            false,
            "One time handler subscribed"
        );
    });

    test("Delegation", function () {
        expect(5);

        var eventSpace = evan.EventSpace.create(),
            result;

        function handler(/** evan.Event */ event) {
            equal(event.currentPath.toString(), 'test>event>path', "Event current path reflects delegated path");
            equal(event.originalPath.toString(), 'test>event>path>foo', "Event current path reflects delegated path");
        }

        raises(function () {
            eventSpace.delegate('myEvent', 'test>event'.toPath(), 'unrelated.path'.toPath(), handler);
        }, "Unrelated paths");

        raises(function () {
            eventSpace.delegate('myEvent', 'test>event'.toPath(), 'test>event>path'.toPath(), 'non-function');
        }, "Invalid event handler");

        // delegating event to path 'test>event>path'
        result = eventSpace.delegate('myEvent', 'test>event'.toPath(), 'test>event>path'.toPath(), handler);
        equal(typeof result, 'function', "Delegation returns wrapped handler");
        eventSpace.spawnEvent('myEvent').triggerSync('test>event>path>foo'.toPath());
    });

    test("Un-delegation", function () {
        var eventSpace = evan.EventSpace.create(),
            delegateHandler;

        function handler() {}

        // delegating in a way that handler may be unsubscribed
        delegateHandler = eventSpace.delegate('myEvent', 'test>event'.toPath(), 'test>event>path'.toPath(), handler);

        equal(
            eventSpace.eventRegistry.items.myEvent.handlers['test>event'].length,
            1,
            "Delegate handler subscribed"
        );

        eventSpace.off('myEvent', 'test>event'.toPath(), delegateHandler);

        equal(
            eventSpace.eventRegistry.items.myEvent.handlers.hasOwnProperty('test>event'),
            false,
            "Delegate handler unsubscribed"
        );
    });

    test("Bubbling", function () {
        expect(3);

        var eventSpace = evan.EventSpace.create()
                .subscribeTo('myEvent', 'test>event', function (event, data) {
                    strictEqual(event, myEvent, "Event instance passed to handler");
                    strictEqual(data, event.data, "Custom event data passed to handler");
                }),
            myEvent = eventSpace.spawnEvent('myEvent'),
            result;

        myEvent.originalPath = 'test>event'.toPath();
        myEvent.currentPath = myEvent.originalPath.clone();

        result = eventSpace.callHandlers(myEvent);
        strictEqual(typeof result, 'undefined', "Bubbling returns undefined");
    });

    test("Bubbling with stop-propagation", function () {
        var eventSpace = evan.EventSpace.create()
                .subscribeTo('event', 'test>event'.toPath(), function () {
                    return false;
                }),
            event = eventSpace.spawnEvent('event');

        event.originalPath = 'test>event'.toPath();
        event.currentPath = event.originalPath.clone();

        eventSpace.callHandlers(event);

        equal(eventSpace.callHandlers(event), false, "Propagation stopped by handler");
    });

    test("Path query", function () {
        var eventSpace = evan.EventSpace.create()
            .subscribeTo('myEvent', 'test>event'.toPath(), function () {})
            .subscribeTo('myEvent', 'test>event>foo'.toPath(), function () {})
            .subscribeTo('myEvent', 'test>event>foo>bar'.toPath(), function () {})
            .subscribeTo('myEvent', 'test>event>|>baz'.toQuery(), function () {})
            .subscribeTo('myEvent', 'test>foo>bar'.toPath(), function () {})
            .subscribeTo('myEvent', 'test>event>hello'.toPath(), function () {})
            .subscribeTo('otherEvent', 'test>event'.toPath(), function () {})
            .subscribeTo('otherEvent', 'test>event>foo'.toPath(), function () {});

        deepEqual(
            eventSpace.getPathsRelativeTo('myEvent', 'test>event'.toPath()).callOnEachItem('toString').items,
            [
                'test>event>foo',
                'test>event>foo>bar',
                'test>event>hello',
                'test>event>|>baz'
            ],
            "Paths subscribed to 'myEvent' relative to 'test>event'"
        );

        deepEqual(
            eventSpace.getPathsRelativeTo('myEvent', 'test>foo'.toPath()).callOnEachItem('toString').items,
            ['test>foo>bar'],
            "Paths subscribed to 'myEvent' relative to 'test>foo'"
        );

        deepEqual(
            eventSpace.getPathsRelativeTo('otherEvent', 'test>event'.toPath()).callOnEachItem('toString').items,
            ['test>event>foo'],
            "Paths subscribed to 'otherEvent' relative to 'test>event'"
        );
    });

    test("Broadcast w/ delegation", function () {
        var eventSpace = evan.EventSpace.create(),
            event = eventSpace.spawnEvent('myEvent'),
            triggeredPaths;

        function handler(event) {
            triggeredPaths[event.currentPath.toString()] = true;
        }

        eventSpace
            .subscribeTo('myEvent', 'a>b>|>e'.toQuery(), handler)
            .subscribeTo('myEvent', 'a>b'.toPath(), handler)
            .subscribeTo('myEvent', 'a>b>other path'.toPath(), handler);

        eventSpace.delegate('myEvent', 'a>b'.toPath(), 'a>b>c>d'.toPath(), handler);
        eventSpace.delegate('myEvent', 'a>b'.toPath(), 'a>b>c>|>f'.toQuery(), handler);

        triggeredPaths = {};
        event.broadcastSync('a'.toPath()); // triggers due to broadcast path < capture path

        deepEqual(
            triggeredPaths,
            {
                "a>b"             : true,
                "a>b>other%20path": true,
                "a>b>c>d"         : true,
                "a>b>c>|>f"       : true,
                "a>b>|>e"         : true
            },
            "Broadcast below fork (trunk)"
        );

        triggeredPaths = {};
        event.broadcastSync('a>b>c'.toPath()); // triggers due to broadcast path < delegate path

        deepEqual(
            triggeredPaths,
            {
                "a>b"      : true, // hit b/c BC bubbles
                "a>b>c>d"  : true, // hit b/c BC bubbles & triggers delegates
                "a>b>c>|>f": true // hit b/c BC bubbles & triggers delegates
            },
            "Broadcast above fork"
        );

        triggeredPaths = {};
        event.broadcastSync('a>b>c>d>e'.toPath()); // triggers due to bubbling of main event

        deepEqual(
            triggeredPaths,
            {
                "a>b"    : true,
                "a>b>c>d": true
            },
            "Broadcast above leaf"
        );
    });
}());
