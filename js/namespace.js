/**
 * Top-Level Library Namespace
 */
/*global require */
/** @namespace */
var evan = {},
    dessert,
    troop;

// adding Node.js dependencies
if (typeof require === 'function') {
    dessert = dessert || require('dessert').dessert;
    troop = troop || require('troop').troop;
}
