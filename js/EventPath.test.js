/*global evan, module, test, expect, ok, equal, notStrictEqual, deepEqual, raises */
(function (EventPath) {
    module("EventPath");

    test("Cloning", function () {
        var path = EventPath.create('test.path.it.is'),
            clonePath = path.clone();

        deepEqual(path.asArray, clonePath.asArray, "Path buffers represent the same path");
        notStrictEqual(path, clonePath, "Clone is different from original");
        notStrictEqual(path.asArray, clonePath.asArray, "Clone's buffer is different from original");
    });

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
