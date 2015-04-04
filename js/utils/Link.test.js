/*global sntls, evan, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Link");

    test("Instantiation", function () {
        var link = evan.Link.create();

        ok(link.hasOwnProperty('previousLink'), "should add previousLink property");
        ok(link.hasOwnProperty('nextLink'), "should add nextLink property");
    });

    test("Adding link after disconnected link", function () {
        var link = evan.Link.create(),
            previousLink = evan.Link.create();

        strictEqual(link.addAfter(previousLink), link, "should be chainable");
        strictEqual(link.previousLink, previousLink, "should set previousLink on link");
        strictEqual(previousLink.nextLink, link, "should set nextLink on previous link");
    });

    test("Adding link after connected link", function () {
        var link = evan.Link.create(),
            previousLink = evan.Link.create(),
            nextLink = evan.Link.create()
                .addAfter(previousLink);

        link.addAfter(previousLink);

        strictEqual(link.previousLink, previousLink, "should set previousLink on link");
        strictEqual(link.nextLink, nextLink, "should set nextLink on link");
        strictEqual(previousLink.nextLink, link, "should set nextLink on previous link");
        strictEqual(nextLink.previousLink, link, "should set previousLink on next link");
    });

    test("Adding link before disconnected link", function () {
        var link = evan.Link.create(),
            nextLink = evan.Link.create();

        strictEqual(link.addBefore(nextLink), link, "should be chainable");
        strictEqual(link.nextLink, nextLink, "should set nextLink on link");
        strictEqual(nextLink.previousLink, link, "should set previousLink on after link");
    });

    test("Adding link before connected link", function () {
        var link = evan.Link.create(),
            nextLink = evan.Link.create(),
            previousLink = evan.Link.create()
                .addBefore(nextLink);

        link.addBefore(nextLink);

        strictEqual(link.nextLink, nextLink, "should set nextLink on link");
        strictEqual(link.previousLink, previousLink, "should set previousLink on link");
        strictEqual(nextLink.previousLink, link, "should set previousLink on next link");
        strictEqual(previousLink.nextLink, link, "should set nextLink on previous link");
    });    
}());
