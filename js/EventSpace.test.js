/*global sntls, evan, module, test, expect, ok, equal, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("EventSpace");

    test("Instantiation", function () {
        var eventSpace = evan.EventSpace.create();
        ok(eventSpace.eventRegistry.isA(sntls.Tree), "should set event registry as a Tree");
        deepEqual(eventSpace.eventRegistry.items, {}, "should initialize event registry Tree as empty");
    });

    test("Spawning event", function () {
        expect(1);

        var eventSpace = evan.EventSpace.create();

        eventSpace.addMocks({
            _prepareEvent: function (event) {
                strictEqual(event.eventSpace, eventSpace, "should set event space of spawned event");
            }
        });

        eventSpace.spawnEvent('myEvent');
    });

    test("Subscription", function () {
        var eventSpace = evan.EventSpace.create();

        function handler1() {}

        function handler2() {}

        raises(function () {
            eventSpace.subscribeTo('myEvent', 'test>event>path'.toPath(), 123);
        }, "should raise exception on invalid handler");

        eventSpace.subscribeTo('myEvent', 'test>event>path'.toPath(), handler1);

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.handlers,
            {
                'test>event>path': [handler1]
            },
            "should add event handler to handler registry (empty)"
        );

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            ['test>event>path'],
            "should add subscription path to path registry (empty)"
        );

        eventSpace.subscribeTo('myEvent', 'test>event>path', handler2);

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.handlers,
            {
                'test>event>path': [handler1, handler2]
            },
            "should add event handler to handler registry (non-empty)"
        );

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            ['test>event>path', 'test>event>path'],
            "should add subscription path to path registry (non-empty)"
        );
    });

    test("Unsubscription", function () {
        function handler1() {}

        function handler2() {}

        var eventSpace = evan.EventSpace.create()
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler1)
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler2);

        eventSpace.unsubscribeFrom('myEvent', 'test>event>path'.toPath(), handler1);

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.handlers,
            {
                'test>event>path': [handler2]
            },
            "should remove handler from handler registry"
        );
        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            ['test>event>path'],
            "should remove path from path registry"
        );
    });

    test("Unsubscription from previously unsubscribed handler", function () {
        function handler1() {}

        function handler2() {}

        var eventSpace = evan.EventSpace.create()
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler2);

        // attempting to unsubscribe non-existing handler
        eventSpace.unsubscribeFrom('myEvent', 'test>event>path'.toPath(), handler1);

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.handlers,
            {
                'test>event>path': [handler2]
            },
            "should leave handler registry intact"
        );
        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            ['test>event>path'],
            "should leave path registry intact"
        );
    });

    test("Unsubscription from last handler", function () {
        function handler1() {}

        var eventSpace = evan.EventSpace.create()
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler1);

        eventSpace.unsubscribeFrom('myEvent', 'test>event>path'.toPath(), handler1);

        equal(
            typeof eventSpace.eventRegistry.items.myEvent.handlers,
            'undefined',
            "should empty handler registry"
        );
        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            [],
            "should empty path registry"
        );
    });

    test("Unsubscribing from multiple handlers on same event", function () {
        function handler1() {}

        function handler2() {}

        var eventSpace = evan.EventSpace.create()
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler1)
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler2);

        eventSpace.unsubscribeFrom('myEvent', 'test>event>path'.toPath());

        equal(
            typeof eventSpace.eventRegistry.items.myEvent.handlers,
            'undefined',
            "should empty handler registry"
        );
        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            [],
            "should empty path registry"
        );
    });

    test("Unsubscribing from single handler on multiple events", function () {
        function handler1() {}

        function handler2() {}

        var eventSpace = evan.EventSpace.create()
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler1)
            .subscribeTo('otherEvent', 'test>event>path'.toPath(), handler2);

        eventSpace.unsubscribeFrom(null, 'test>event>path'.toPath(), handler1);

        equal(
            typeof eventSpace.eventRegistry.items.myEvent.handlers,
            'undefined',
            "should remove specified handler from registry for all events"
        );
        deepEqual(
            eventSpace.eventRegistry.items.otherEvent.handlers,
            {
                'test>event>path': [handler2]
            },
            "should leave other handler in registry intact"
        );

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            [],
            "should remove path for specified handler from registry for all events"
        );
        deepEqual(
            eventSpace.eventRegistry.items.otherEvent.paths.items,
            ['test>event>path'],
            "should leave paths for other handler intact"
        );
    });

    test("Unsubscribing from single handler on multiple events (2)", function () {
        function handler1() {}

        var eventSpace = evan.EventSpace.create()
            .subscribeTo('myEvent', 'test>event>path'.toPath(), handler1)
            .subscribeTo('otherEvent', 'test>event>path'.toPath(), handler1);

        eventSpace.unsubscribeFrom(null, 'test>event>path'.toPath(), handler1);

        equal(
            typeof eventSpace.eventRegistry.items.myEvent.handlers,
            'undefined',
            "should remove handlers from registry for first event"
        );
        deepEqual(
            typeof eventSpace.eventRegistry.items.otherEvent.handlers,
            'undefined',
            "should remove handlers from registry for second event"
        );

        deepEqual(
            eventSpace.eventRegistry.items.myEvent.paths.items,
            [],
            "should remove path from registry for first event"
        );
        deepEqual(
            eventSpace.eventRegistry.items.otherEvent.paths.items,
            [],
            "should remove path from registry for second event"
        );
    });

    test("One time subscription", function () {
        function handler() {}

        var eventSpace = evan.EventSpace.create(),
            result;

        result = eventSpace.subscribeToUntilTriggered('myEvent', 'test>event>path'.toPath(), handler);

        equal(typeof result, 'function', "should return wrapped handler");
        equal(
            eventSpace.eventRegistry.items.myEvent.handlers['test>event>path'].length,
            1,
            "should add handler to handler registry"
        );

        // unsubscribing event before triggering
        eventSpace.unsubscribeFrom('myEvent', 'test>event>path'.toPath(), result);

        equal(
            eventSpace.eventRegistry.items.myEvent.hasOwnProperty('handlers'),
            false,
            "should be able to unsubscribe from the returned wrapper"
        );

        // re binding and triggering event
        eventSpace.subscribeToUntilTriggered('myEvent', 'test>event>path'.toPath(), handler);
        eventSpace.spawnEvent('myEvent').triggerSync('test>event>path'.toPath());

        equal(
            eventSpace.eventRegistry.items.myEvent.hasOwnProperty('handlers'),
            false,
            "should unsubscribe after being triggered"
        );
    });

    test("Path delegation", function () {
        expect(5);

        var eventSpace = evan.EventSpace.create(),
            result;

        function handler(/** evan.Event */ event) {
            equal(event.currentPath.toString(), 'test>event>path',
                "should call handler with currentPath set on event");
            equal(event.originalPath.toString(), 'test>event>path>foo',
                "should call handler with originalPath set on event");
        }

        raises(function () {
            eventSpace.delegateSubscriptionTo('myEvent', 'test>event'.toPath(), 'unrelated>path'.toPath(), handler);
        }, "should raise exception on delegate path not relative to capture path");

        raises(function () {
            eventSpace.delegateSubscriptionTo('myEvent', 'test>event'.toPath(), 'test>event>path'.toPath(), 'non-function');
        }, "should raise exception on invalid event handler");

        // delegating event to path 'test>event>path'
        result = eventSpace.delegateSubscriptionTo('myEvent', 'test>event'.toPath(), 'test>event>path'.toPath(), handler);
        equal(typeof result, 'function', "should return wrapped handler");
        eventSpace.spawnEvent('myEvent').triggerSync('test>event>path>foo'.toPath());
    });

    test("Query delegation", function () {
        expect(4);

        var eventSpace = evan.EventSpace.create(),
            result;

        function handler(/** evan.Event */ event) {
            equal(event.currentPath.toString(), 'test>event>|>foo',
                "should call handler with currentPath set on event to query");
            equal(event.originalPath.toString(), 'test>event>bar>foo>baz',
                "should call handler with originalPath set on event");
        }

        raises(function () {
            eventSpace.delegateSubscriptionTo('myEvent', 'test>event'.toPath(), 'test>|>path'.toPath(), handler);
        }, "should raise exception on delegate query not relative to capture path");

        // delegating event to query 'test>event>|>path'
        result = eventSpace.delegateSubscriptionTo('myEvent', 'test>event'.toPath(), 'test>event>|>foo'.toQuery(), handler);
        equal(typeof result, 'function', "should return wrapped handler");
        eventSpace.spawnEvent('myEvent').triggerSync('test>event>bar>foo>baz'.toPath());
    });

    test("Unsubscribing from delegated event", function () {
        var eventSpace = evan.EventSpace.create(),
            delegateHandler;

        function handler() {}

        // delegating in a way that handler may be unsubscribed
        delegateHandler = eventSpace.delegateSubscriptionTo('myEvent', 'test>event'.toPath(), 'test>event>path'.toPath(), handler);

        eventSpace.unsubscribeFrom('myEvent', 'test>event'.toPath(), delegateHandler);

        equal(
            eventSpace.eventRegistry.items.myEvent.hasOwnProperty('handlers'),
            false,
            "should remove handler from handler regsitry"
        );
    });

    test("Calling handlers for event", function () {
        expect(3);

        var eventSpace = evan.EventSpace.create()
                .subscribeTo('myEvent', 'test>event', function (event, data) {
                    strictEqual(event, myEvent, "should call handler with spawned event");
                    strictEqual(data, event.payload, "should call handler with payload set on event");
                }),
            myEvent = eventSpace.spawnEvent('myEvent'),
            result;

        myEvent.originalPath = 'test>event'.toPath();
        myEvent.currentPath = myEvent.originalPath.clone();

        result = eventSpace.callHandlers(myEvent);
        strictEqual(result, 1, "should return number of handlers run");
    });

    test("Calling handlers with stop-propagation", function () {
        expect(2);

        var eventSpace = evan.EventSpace.create()
                .subscribeTo('event', 'test>event'.toPath(), function () {
                    ok(true, "should call handler only once");
                    return false;
                }),
            event = eventSpace.spawnEvent('event');

        event.originalPath = 'test>event'.toPath();
        event.currentPath = event.originalPath.clone();

        equal(eventSpace.callHandlers(event), false, "should return false");
    });

    test("Relative path query", function () {
        var eventSpace = evan.EventSpace.create()
                .subscribeTo('myEvent', 'test>event'.toPath(), function () {})
                .subscribeTo('myEvent', 'test>event>foo'.toPath(), function () {})
                .subscribeTo('myEvent', 'test>event>foo>bar'.toPath(), function () {})
                .subscribeTo('myEvent', 'test>event>|>baz'.toQuery(), function () {})
                .subscribeTo('myEvent', 'test>foo>bar'.toPath(), function () {})
                .subscribeTo('myEvent', 'test>event>hello'.toPath(), function () {})
                .subscribeTo('otherEvent', 'test>event'.toPath(), function () {})
                .subscribeTo('otherEvent', 'test>event>foo'.toPath(), function () {}),
            result;

        result = eventSpace.getPathsRelativeTo('myEvent', 'test>event'.toPath());
        ok(result.isA(evan.PathCollection), "should return PathCollection instance");
        deepEqual(
            result.callOnEachItem('toString').items,
            [
                'test>event>foo',
                'test>event>foo>bar',
                'test>event>hello',
                'test>event>|>baz'
            ],
            "should fetch paths and queries for specified event, relative to the specified path (pass 1)"
        );

        result = eventSpace.getPathsRelativeTo('myEvent', 'test>foo'.toPath());
        deepEqual(
            result.callOnEachItem('toString').items,
            ['test>foo>bar'],
            "should fetch paths and queries for specified event, relative to the specified path (pass 2)"
        );

        result = eventSpace.getPathsRelativeTo('otherEvent', 'test>event'.toPath());
        deepEqual(
            result.callOnEachItem('toString').items,
            ['test>event>foo'],
            "should fetch paths and queries for specified event, relative to the specified path (pass 3)"
        );
    });

    test("Relative path query w/ no subscriptions", function () {
        var eventSpace = evan.EventSpace.create();

        deepEqual(
            eventSpace.getPathsRelativeTo('myEvent', 'test>event'.toPath()).items,
            [],
            "should fetch empty path collection"
        );
    });

    // TODO: Why is this here and not in Event?
    test("Broadcasting with delegation", function () {
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

        eventSpace.delegateSubscriptionTo('myEvent', 'a>b'.toPath(), 'a>b>c>d'.toPath(), handler);
        eventSpace.delegateSubscriptionTo('myEvent', 'a>b'.toPath(), 'a>b>c>|>f'.toQuery(), handler);

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
            "should call handler for all paths relative to broadcast path"
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
            "should call handler for paths relative to broadcast path and then bubble"
        );

        triggeredPaths = {};
        event.broadcastSync('a>b>c>d>e'.toPath()); // triggers due to bubbling of main event

        deepEqual(
            triggeredPaths,
            {
                "a>b"    : true,
                "a>b>c>d": true
            },
            "should only bubble when there are no subscriptions / delegates relative to broadcast path"
        );
    });
}());
