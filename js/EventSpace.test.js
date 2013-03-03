/*global evan, module, test, expect, ok, equal, deepEqual, raises */
(function (EventSpace) {
    module("EventSpace");

    test("Instantiation", function () {
        var eventSpace = EventSpace.create();
        deepEqual(eventSpace.registry, {}, "Event registry initialized");
    });

    /**
     * @param {boolean} [noBubbling]
     * @param {boolean} [stopsPropagation]
     */
    function testTriggering(noBubbling, stopsPropagation) {
        var eventSpace = EventSpace.create({bubbling: !noBubbling}),
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
}(
    evan.EventSpace
));
