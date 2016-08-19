import Base from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';
const { getOwner } = Ember;

export default Base.extend({
  store: Ember.inject.service(),
  
  init() {
    this._super(...arguments);

    let config = getOwner(this).resolveRegistration('config:environment');

    //let the user override the default adapter
    let pouchAdapterName = config.emberPouch.authAdapter || 'user';

    let pouchAdapter = this.get('store').adapterFor(pouchAdapterName);

    Ember.assert('You must have an ember-pouch adapter setup for authentication', pouchAdapter);

    this.db = pouchAdapter.db;
  },

  restore(data) {
  	let self = this;
  	return this.db.getUser(data.name).then(function() {
  		self.db.emit('loggedin');
  		return data;
  	});
  },

  authenticate(username, password) {
  	let self = this;
    return this.db.login(username, password, {
		ajax: {
			headers: {
			  'X-Hello': 'World'
			}
		}
	}).then(function(data) {
		self.db.emit('loggedin');
		return data;
	});
  },

  invalidate() {
    return this.db.logout();
  }
});
