/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'js/namespace.js',
            'js/PathCollection.js',
            'js/Event.js',
            'js/EventSpawner.js',
            'js/EventSpace.js',
            'js/EventSpaceCollection.js',
            'js/Evented.js',
            'js/globals/eventSpaceRegistry.js',
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
