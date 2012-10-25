/*global evan, module, test, expect, ok, equal, deepEqual, raises */
(function (Event) {
    module("Event");

    test("Instantiation", function () {
        var event;

        event = Event.create();
        deepEqual(event.registry, {}, "Event registry initialized");
        equal(event.bubbling, true, "Bubbling is on by default");

        event = Event.create({bubbling: false});
        equal(event.bubbling, false, "Bubbling turned off");
    });

    /**
     * @param [noBubbling] {boolean}
     * @param [stopsPropagation] {boolean}
     */
    function testTriggering(noBubbling, stopsPropagation) {
        var event = Event.create({bubbling: !noBubbling}),
            i = 0;

        // mock subscriptions
        event.registry.test = {};
        event.registry.test.fooEvent = [
            function () {
                equal(i, 2, "Event bubbled");
            }];
        event.registry['test.path'] = {};
        event.registry['test.path'].fooEvent = [
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

        event.trigger(['test', 'path'], 'fooEvent', 'foo');
    }

    test("Triggering w/ bubbling", function () {
        expect(6);
        testTriggering();
    });

    test("Triggering w/o bubbling", function () {
        expect(5);
        testTriggering(true);
    });

    test("Triggering w/ stop-propagation", function () {
        expect(4);
        testTriggering(false, true);
    });
}(
    evan.Event
));
