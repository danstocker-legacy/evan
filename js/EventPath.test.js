/*global evan, module, test, expect, ok, equal, deepEqual, raises */
(function (EventPath) {
    module("EventPath");

    test("Initialized by string", function () {
        var path = EventPath.create('test.path.it.is');
        deepEqual(path.asArray, ['test', 'path', 'it', 'is'], "Array representation");
        deepEqual(path.asString, 'test.path.it.is', "String representation");
    });

    test("Initialized by array", function () {
        var path = EventPath.create(['test', 'path', 'it', 'is']);
        deepEqual(path.asArray, ['test', 'path', 'it', 'is'], "Array representation");
        deepEqual(path.asString, 'test.path.it.is', "String representation");
    });

    test("Match", function () {
        var path = EventPath.create('test.path.it.is');

        equal(path.match(EventPath.create('test.path.it.is')), true, "Matching path");
        equal(path.match(EventPath.create('path.it.is')), false, "Non-matching path");
    });

    test("Shrink", function () {
        var path = EventPath.create('test.path.it.is');

        path.shrink();
        equal(path.asString, 'test.path.it', "Path shrunk");
        equal(path.asArray.length, 3, "Path shrunk");

        path.shrink();
        equal(path.asString, 'test.path', "Path shrunk further");
        equal(path.asArray.length, 2, "Path shrunk further");
    });
}(
    evan.EventPath
));
