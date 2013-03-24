/*global evan, module, test, expect, ok, equal, deepEqual, raises */
(function (EventPath) {
    module("EventPath");

    test("Shrink", function () {
        var path = EventPath.create('test.path.it.is');

        path.shrink();
        equal(path.asArray.length, 3, "Path shrunk");

        path.shrink();
        equal(path.asArray.length, 2, "Path shrunk further");
    });

    test("Serialization", function () {
        var path = EventPath.create(['test', 'path', 'it', 'is']);
        equal(path.toString(), 'test.path.it.is', "EventPath does not override toString()");
    });
}(evan.EventPath));
