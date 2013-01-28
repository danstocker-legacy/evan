/**
 * Top-Level Library Namespace
 */
/*global require */
(function () {
    /** @namespace */
    this.evan = {};
}());

// adding Node.js dependencies
if (typeof require === 'function') {
    require('dessert-0.2.3');
    require('troop-0.2.3');
}
