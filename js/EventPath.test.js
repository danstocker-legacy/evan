/*global evan, module, test, expect, ok, equal, deepEqual, raises */
(function (EventPath) {
    module("EventPath");

    test("Shrink", function () {
        var path = EventPath.create('test.path.it.is');

        path.shrink();
        equal(path.asString, 'test.path.it', "Path shrunk");
        equal(path.asArray.length, 3, "Path shrunk");

        path.shrink();
        equal(path.asString, 'test.path', "Path shrunk further");
        equal(path.asArray.length, 2, "Path shrunk further");
    });
}(evan.EventPath));
