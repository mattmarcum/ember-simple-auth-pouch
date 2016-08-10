import Base from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';
const { getOwner } = Ember;

export default Base.extend({
  init() {
    this._super(...arguments);

    let config = getOwner(this).resolveRegistration('config:environment');

    //let the user override the default adapter
    let pouchAdapterName = config.emberPouch.authAdapter || 'user';

    let pouchAdapter = getOwner(this).lookup(`adapter:${pouchAdapterName}`);

    Ember.assert('You must have an ember-pouch adapter setup for authentication', pouchAdapter);

    this.db = pouchAdapter.db;
  },

  restore(data) {
  	return this.db.getUser(data.name).then(function() { return data; });
  },

  authenticate(username, password) {
    return this.db.login(username, password, {
		ajax: {
			headers: {
			  'X-Hello': 'World'
			}
		}
	});
  },

  invalidate() {
    return this.db.logout();
  }
});
