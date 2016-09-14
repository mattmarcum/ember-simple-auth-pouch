/*jshint node:true*/
module.exports = {
  description: 'Ember Simple Auth Pouchdb Authenticator',

  // locals: function(options) {
  //   // Return custom template variables here.
  //   return {
  //     foo: options.entity.options.foo
  //   };
  // }

  normalizeEntityName: function() {},

  afterInstall: function(options) {
    return this.addBowerPackagesToProject([
      { name: "pouchdb-authentication", target: "^0.5.3" }
    ]);
  }
};
