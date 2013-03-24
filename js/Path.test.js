/*global evan, module, test, expect, ok, equal, deepEqual, raises */
(function (Path) {
    module("Path");

    test("Initialized by string", function () {
        var path = Path.create('test.path.it.is');
        deepEqual(path.asArray, ['test', 'path', 'it', 'is'], "Array representation");
    });

    test("Initialized by array", function () {
        var path = Path.create(['test', 'path', 'it', 'is']);
        deepEqual(path.asArray, ['test', 'path', 'it', 'is'], "Array representation");
    });

    test("Serialization", function () {
        var path = Path.create(['test', 'path', 'it', 'is']);
        equal(path.toString(), 'test.path.it.is', "Serialized path");
    });

    test("Equality", function () {
        /** @type evan.Path */
        var path = Path.create('test.path.it.is');

        equal(path.equal(Path.create('test.path.it.is')), true, "Matching path");
        equal(path.equal(Path.create('path.it.is')), false, "Non-matching path");

        equal(path.equal('test.path.it.is'), true, "Matching string path");
        equal(path.equal('path.it.is'), false, "Non-matching string path");

        equal(path.equal(['test', 'path', 'it', 'is']), true, "Matching array path");
        equal(path.equal(['path', 'it', 'is']), false, "Non-matching array path");
    });

    test("Path resolution", function () {
        var path = Path.create('hello.world');

        raises(function () {
            path.resolve();
        }, "Resolution requires a context");

        raises(function () {
            path.resolve('foo');
        }, "Invalid context object");

        equal(typeof path.resolve({}), 'undefined', "Can't resolve on empty object");

        equal(path.resolve({
            hello: {
                world: '!!'
            }
        }), '!!', "Path resolved");
    });

    test("Building path", function () {
        var path = Path.create('foo.bar'),
            context = {
                hello: "world"
            };

        raises(function () {
            path.resolveOrBuild();
        }, "Path builder requires a context");

        raises(function () {
            path.resolveOrBuild('foo');
        }, "Invalid context object");

        path.resolveOrBuild(context);

        deepEqual(path.asArray, ['foo', 'bar'], "Array representation untouched by build");

        deepEqual(context, {
            hello: "world",
            foo  : {
                bar: {}
            }
        }, "Path built");

        Path.create('hello.world').resolveOrBuild(context);

        deepEqual(context, {
            hello: {
                world: {}
            },
            foo  : {
                bar: {}
            }
        }, "Existing path overwritten");
    });
}(evan.Path));
