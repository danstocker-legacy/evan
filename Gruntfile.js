/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'js/namespace.js',
            'js/interfaces/EventSpawner.js',
            'js/interfaces/EventSource.js',
            'js/interfaces/EventTarget.js',
            'js/utils/Link.js',
            'js/utils/MutableLink.js',
            'js/utils/OpenChain.js',
            'js/PathCollection.js',
            'js/Event.js',
            'js/EventSpace.js',
            'js/Evented.js',
            'js/EventStack.js',
            'js/PayloadStore.js',
            'js/globals/originalEventStack.js',
            'js/globals/nextPayloadStore.js',
            'js/globals/eventSpace.js',
            'js/exports.js'
        ],

        test: [
            'js/jsTestDriver.conf'
        ],

        globals: {
            dessert: true,
            troop  : true,
            sntls  : true
        }
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};
