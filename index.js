'use strict';

module.exports = {
  name: require('./package').name,

  testPeerDependency(module) {
    try {
      //TODO: test version
      require(module);
    } catch (e) {
      throw new Error(
        "'" +
          module +
          "' is not found, but required as a peerDependency. Please install it with `npm install --save-dev " +
          module +
          '`'
      );
    }
  },

  init: function () {
    this._super.init && this._super.init.apply(this, arguments);

    // var bowerDeps = this.project.bowerDependencies();

    //if (bowerDeps['pouchdb-authentication']) {this.ui.writeWarnLine('Please remove `pouchdb-authentication` from `bower.json`. For ember-simple-auth-pouch only the NPM package is needed.');}

    this.testPeerDependency('ember-pouch');
    this.testPeerDependency('ember-simple-auth');
    this.testPeerDependency('pouchdb-authentication');
  },

  isDevelopingAddon() {
    return true;
  },
};
