'use strict';

module.exports = function() {

    exports.actions = require('./actions/blog')();
    exports.schemata = require('./schemata/blog')();

    return exports;
  }();
