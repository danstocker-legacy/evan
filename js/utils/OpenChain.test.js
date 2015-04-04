/*global sntls, evan, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("OpenChain");

    test("Instantiation", function () {
        var chain = evan.OpenChain.create();

        ok(chain.firstLink.instanceOf(evan.Link), "should add firstLink property");
        ok(chain.lastLink.instanceOf(evan.Link), "should add lastLink property");
        strictEqual(chain.lastLink.beforeLink, chain.firstLink, "should link first to last link");
        strictEqual(chain.firstLink.afterLink, chain.lastLink, "should link last to first link");
    });

    test("Link push", function () {
        var chain = evan.OpenChain.create(),
            link = evan.MutableLink.create();

        strictEqual(chain.pushLink(link), chain, "should be chainable");
        strictEqual(chain.firstLink.afterLink, link, "should set pushed link in chain");
    });

    test("Link pop", function () {
        var link = evan.MutableLink.create(),
            chain = evan.OpenChain.create()
                .pushLink(link);

        strictEqual(chain.popLink(), link, "should return removed link");
        strictEqual(chain.firstLink.afterLink, chain.lastLink, "should remove link from chain");
    });

    test("Link unshift", function () {
        var chain = evan.OpenChain.create(),
            link = evan.MutableLink.create();

        strictEqual(chain.unshiftLink(link), chain, "should be chainable");
        strictEqual(chain.firstLink.afterLink, link, "should set un-shifted link in chain");
    });

    test("Link shift", function () {
        var link = evan.MutableLink.create(),
            chain = evan.OpenChain.create()
                .unshiftLink(link);

        strictEqual(chain.shiftLink(), link, "should return removed link");
        strictEqual(chain.firstLink.afterLink, chain.lastLink, "should remove link from chain");
    });

    test("Values getter", function () {
        var chain = evan.OpenChain.create()
            .pushLink(evan.MutableLink.create().setValue(3))
            .unshiftLink(evan.MutableLink.create().setValue(2))
            .unshiftLink(evan.MutableLink.create().setValue(1))
            .pushLink(evan.MutableLink.create().setValue(4));

        deepEqual(chain.getValues(), [1, 2, 3, 4], "should return values in order of links");
    });
}());
