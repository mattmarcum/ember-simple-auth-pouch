/* jshint node: true, -W030 */
'use strict';

var path = require('path');
var stew = require('broccoli-stew');

module.exports = {
  name: 'ember-simple-auth-pouch',

  testPeerDependency(module) {
    try {
      //TODO: test version
      let testReq = require(module);
    } catch(e) {
      throw new Error("'" + module + "' is not found, but required as a peerDependency. Please install it with `npm install --save-dev " + module + "`");
    }
  },
  
  init: function() {
  	this._super.init && this._super.init.apply(this, arguments);

    var bowerDeps = this.project.bowerDependencies();

    if (bowerDeps['pouchdb-authentication']) {this.ui.writeWarnLine('Please remove `pouchdb-authentication` from `bower.json`. For ember-simple-auth-pouch only the NPM package is needed.');}
    
    this.testPeerDependency('ember-pouch');
    this.testPeerDependency('ember-simple-auth');
  },

  treeForVendor: function() {
    return stew.find(path.join(path.dirname(require.resolve('pouchdb-authentication')), '..', 'dist'), {
      destDir: 'pouchdb',
      files: ['pouchdb.authentication.js']
    });
  },

  included(app) {
    app.import('vendor/pouchdb/pouchdb.authentication.js');
  },
  
  isDevelopingAddon() {
    return true;
  },
};
