import Base from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';
const { getOwner } = Ember;

export default Base.extend({
  store: Ember.inject.service(),
  
  loginOpts: {},
  
  init() {
    this._super(...arguments);

    let config = getOwner(this).resolveRegistration('config:environment');

    //let the user override the default adapter
    let pouchAdapterName = config.authAdapter || 'user';
    if (config.pouchDb && config.pouchDb._fixChromeLoginBug) {//not needed for cloudant
    	this.loginOpts = {
			ajax: {
				headers: {
				  'X-Hello': 'World'
				}
			}
		};
    }

    let pouchAdapter = this.get('store').adapterFor(pouchAdapterName);

    Ember.assert('You must have an ember-pouch adapter setup for authentication', pouchAdapter);

    this.db = pouchAdapter.db;
  },

  restore(data) {
  	let self = this;
  	return this.db.getSession().then(function(resp) {
  		let result = null;
  		if (!Ember.isEmpty(data.name) && resp.userCtx.name === data.name) {
  			result = data;
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
    return this.db.login(username, password, this.loginOpts).then(function(data) {
		self.db.emit('loggedin');
		return data;
	});
  },

  invalidate() {
  	this.db.emit('loggedout');
    return this.db.logout();
  }
});
