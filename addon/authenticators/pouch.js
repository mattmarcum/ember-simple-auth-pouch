import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({
  init() {
    this._super(...arguments);

    let config = this.container.lookupFactory('config:environment');

    //let the user override the default adapter
    let pouchAdapterName = config.emberPouch.authAdapter || 'user';

    let pouchAdapter = this.container.lookup(`adapter:${pouchAdapterName}`);

    Ember.assert('You must have an ember-pouch adapter setup for authentication', pouchAdapter);

    this.db = pouchAdapter.db;
  },

  restore(data) {
debugger;
  },

  authenticate(username, password) {
    return this.db.login(username, password);
  },

  invalidate(data) {
    return this.db.logout();
  }
});
