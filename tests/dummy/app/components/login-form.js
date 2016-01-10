import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Component.extend({
  session: service('session'),

  actions: {
    authenticateWithPouch() {
      let { identification, password } = this.getProperties('identification', 'password');
      this.get('session').authenticate('authenticator:pouch', identification, password).catch((reason) => {
        this.set('errorMessage', reason.error);
      });
    }
  }
});
