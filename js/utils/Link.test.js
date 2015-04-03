/*global sntls, evan, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Link");

    test("Instantiation", function () {
        var link = evan.Link.create();

        ok(link.hasOwnProperty('linkBefore'), "should add linkBefore property");
        ok(link.hasOwnProperty('linkAfter'), "should add linkAfter property");
    });

    test("Adding link after disconnected link", function () {
        var link = evan.Link.create(),
            beforeLink = evan.Link.create();

        strictEqual(link.addAfter(beforeLink), link, "should be chainable");
        strictEqual(link.beforeLink, beforeLink, "should set beforeLink on link");
        strictEqual(beforeLink.afterLink, link, "should set afterLink on before link");
    });

    test("Adding link after connected link", function () {
        var link = evan.Link.create(),
            beforeLink = evan.Link.create(),
            afterLink = evan.Link.create()
                .addAfter(beforeLink);

        link.addAfter(beforeLink);

        strictEqual(link.beforeLink, beforeLink, "should set beforeLink on link");
        strictEqual(link.afterLink, afterLink, "should set afterLink on link");
        strictEqual(beforeLink.afterLink, link, "should set afterLink on before link");
        strictEqual(afterLink.beforeLink, link, "should set beforeLink on after link");
    });

    test("Adding link before disconnected link", function () {
        var link = evan.Link.create(),
            afterLink = evan.Link.create();

        strictEqual(link.addBefore(afterLink), link, "should be chainable");
        strictEqual(link.afterLink, afterLink, "should set afterLink on link");
        strictEqual(afterLink.beforeLink, link, "should set beforeLink on after link");
    });

    test("Adding link before connected link", function () {
        var link = evan.Link.create(),
            afterLink = evan.Link.create(),
            beforeLink = evan.Link.create()
                .addBefore(afterLink);

        link.addBefore(afterLink);

        strictEqual(link.afterLink, afterLink, "should set afterLink on link");
        strictEqual(link.beforeLink, beforeLink, "should set beforeLink on link");
        strictEqual(afterLink.beforeLink, link, "should set beforeLink on after link");
        strictEqual(beforeLink.afterLink, link, "should set afterLink on before link");
    });    
}());
