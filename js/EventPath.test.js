/*global sntls, evan, module, test, expect, ok, equal, notStrictEqual, deepEqual, raises */
(function () {
    module("EventPath");

    test("Shrink", function () {
        var path = evan.EventPath.create('test.path.it.is');

        path.shrink();
        equal(path.asArray.length, 3, "Path shrunk");

        path.shrink();
        equal(path.asArray.length, 2, "Path shrunk further");
    });

    test("Serialization", function () {
        var path = evan.EventPath.create(['test', 'path', 'it', 'is']);
        equal(path.toString(), 'test.path.it.is', "evan.EventPath does not override toString()");
    });
}());
