/*global sntls, evan, module, test, expect, ok, equal, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("PayloadStore");

    test("Instantiation", function () {
        var payloadStore = evan.PayloadStore.create(this);

        ok(payloadStore.payloads.isA(sntls.Tree), "should add payloads property");
    });

    test("Setting single payload item", function () {
        var payloadStore = evan.PayloadStore.create(this);

        strictEqual(payloadStore.setPayloadItem('foo', 'bar', 'baz'), payloadStore,
            "should be chainable");

        deepEqual(payloadStore.payloads.items, {
            foo: {
                bar: 'baz'
            }
        }, "should set payload information in buffer");
    });

    test("Setting multiple payload items", function () {
        var payloadStore = evan.PayloadStore.create(this);

        strictEqual(payloadStore.setPayloadItems('foo', {
            'bar'  : 'baz',
            'hello': 'world'
        }), payloadStore, "should be chainable");

        deepEqual(payloadStore.payloads.items, {
            foo: {
                'bar'  : 'baz',
                'hello': 'world'
            }
        }, "should set payload information in buffer");
    });

    test("Deleting single payload item", function () {
        var payloadStore = evan.PayloadStore.create(this)
            .setPayloadItems('foo', {
                'bar'  : 'baz',
                'hello': 'world'
            });

        strictEqual(payloadStore.deletePayloadItem('foo', 'bar'), payloadStore,
            "should be chainable");

        deepEqual(payloadStore.payloads.items, {
            foo: {
                'hello': 'world'
            }
        }, "should remove specified payload item from buffer");
    });

    test("Deleting multiple payload items", function () {
        var payloadStore = evan.PayloadStore.create(this)
            .setPayloadItems('foo', {
                'bar'  : 'baz',
                'hello': 'world'
            });

        strictEqual(payloadStore.deletePayloadItems('foo', 'bar', 'hello'),
            payloadStore, "should be chainable");

        deepEqual(payloadStore.payloads.items, {
            foo: {
            }
        }, "should remove specified payload items from buffer");
    });

    test("Payload getter", function () {
        var payloadStore = evan.PayloadStore.create(this)
            .setPayloadItems('foo', {
                'bar'  : 'baz',
                'hello': 'world'
            }),
            payload;

        payload = payloadStore.getPayload('foo');

        deepEqual(payload, {
            'bar'  : 'baz',
            'hello': 'world'
        }, "should return payload contents");
    });
}());
