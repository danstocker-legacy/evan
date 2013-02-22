/*global evan, module, test, expect, ok, equal, deepEqual, raises */
(function (Path) {
    module("Path");

    test("Initialized by string", function () {
        var path = Path.create('test.path.it.is');
        deepEqual(path.asArray, ['test', 'path', 'it', 'is'], "Array representation");
        deepEqual(path.asString, 'test.path.it.is', "String representation");
    });

    test("Initialized by array", function () {
        var path = Path.create(['test', 'path', 'it', 'is']);
        deepEqual(path.asArray, ['test', 'path', 'it', 'is'], "Array representation");
        deepEqual(path.asString, 'test.path.it.is', "String representation");
    });

    test("Match", function () {
        var path = Path.create('test.path.it.is');

        equal(path.match(Path.create('test.path.it.is')), true, "Matching path");
        equal(path.match(Path.create('path.it.is')), false, "Non-matching path");
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
            path.build();
        }, "Path builder requires a context");

        raises(function () {
            path.build('foo');
        }, "Invalid context object");

        path.build(context);

        deepEqual(context, {
            hello: "world",
            foo  : {
                bar: {}
            }
        }, "Path built");

        Path.create('hello.world').build(context);

        deepEqual(context, {
            hello: {
                world: {},
            },
            foo  : {
                bar: {}
            }
        }, "Existing path overwritten");
    });
}(evan.Path));
