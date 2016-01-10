/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-simple-auth-pouch',

  included: function included(app) {
    var bowerDir = app.bowerDirectory;

    app.import(bowerDir + '/pouchdb-authentication/dist/pouchdb.authentication.js');
  }
};
