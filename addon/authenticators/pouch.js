import Base from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';
const { getOwner } = Ember;

export default Base.extend({
  store: Ember.inject.service(),
    
  init() {
    this._super(...arguments);

    this.db = this.getDb();
  },
  
  getDb() {
  	let config = getOwner(this).resolveRegistration('config:environment');

    //let the user override the default adapter
    let pouchAdapterName = config.authAdapter || 'application';

    let pouchAdapter = this.get('store').adapterFor(pouchAdapterName);

    Ember.assert('You must have an ember-pouch adapter setup for authentication', pouchAdapter);
    
  	return pouchAdapter.db;
  },

  restore(data) {
  	let self = this;
  	return this.db.getSession().then(function(resp) {
  		let result = null;
  		if (!Ember.isEmpty(data.name) && resp.userCtx.name === data.name) {
  			result = resp.userCtx;
  			self.db.emit('loggedin');
  		}
  		else {
  			result = Ember.RSVP.reject("Not logged in or incorrect user in cookie");
  		}
  		
  		return result;
  	});
  },

  authenticate(username, password) {
  	let self = this;
    return this.db.login(username, password).then(function() {
    	return self.db.getSession().then(function(resp) {
    		self.db.emit('loggedin');
    		return resp.userCtx;
    	});
	});
  },

  invalidate() {
  	this.db.emit('loggedout');
    return this.db.logout();
  }
});
