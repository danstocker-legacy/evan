/*global evan, module, test, expect, ok, equal, deepEqual, raises */
(function (EventSpace) {
    module("EventSpace");

    test("Instantiation", function () {
        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create();
        deepEqual(eventSpace.registry, {}, "Event registry initialized");
    });

    /**
     * @param {boolean} [noBubbling]
     * @param {boolean} [stopsPropagation]
     */
    function testTriggering(noBubbling, stopsPropagation) {
        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create({bubbling: !noBubbling}),
            i = 0;

        // mock subscriptions
        eventSpace.registry.test = {};
        eventSpace.registry.test.fooEvent = [
            function () {
                equal(i, 2, "Event bubbled");
            }];
        eventSpace.registry['test.path'] = {};
        eventSpace.registry['test.path'].fooEvent = [
            function (event, data) {
                equal(event.target, 'test.path', "Target OK");
                equal(event.name, 'fooEvent', "Event name OK");
                equal(data, 'foo', "Data OK");
                equal(i++, 0, "First");
                if (stopsPropagation) {
                    return false;
                }
            },
            function () {
                equal(i++, 1, "First");
            }];

        eventSpace.trigger('fooEvent', ['test', 'path'], 'foo');
    }

    test("Triggering w/ bubbling", function () {
        expect(6);
        testTriggering();
    });

    test("Triggering w/ stop-propagation", function () {
        expect(4);
        testTriggering(false, true);
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
            eventSpace.registry,
            {
                'test.event.path': {
                    myEvent: [handler1]
                }
            },
            "Event handler added to registry"
        );

        eventSpace.on('myEvent', 'test.event.path', handler2);

        deepEqual(
            eventSpace.registry,
            {
                'test.event.path': {
                    myEvent: [handler1, handler2]
                }
            },
            "Event handler added to registry"
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
            eventSpace.registry,
            {
                'test.event.path': {
                    myEvent: [handler2]
                }
            },
            "Former handler unsubscribed"
        );

        eventSpace.off('myEvent', 'test.event.path');

        deepEqual(
            eventSpace.registry,
            {
                'test.event.path': {}
            },
            "All handlers unsubscribed"
        );
    });
}(evan.EventSpace));
