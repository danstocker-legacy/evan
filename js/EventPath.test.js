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

    test("Initialized by EventPath", function () {
        var path1 = EventPath.create(['test', 'path', 'it', 'is']),
            path2 = EventPath.create(path1);

        equal(path2, path1, "Returns same instance");
    });

    test("Match", function () {
        var path = EventPath.create('test.path.it.is');

        equal(path.match(EventPath.create('test.path.it.is')), true, "Matching path");
        equal(path.match(EventPath.create('path.it.is')), false, "Non-matching path");
    });
}(
    evan.EventPath
));
