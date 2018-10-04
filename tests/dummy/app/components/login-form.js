import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  session: service(),

  actions: {
    authenticateWithPouch() {
      let { identification, password } = this.getProperties('identification', 'password');
      this.get('session').authenticate('authenticator:pouch', identification, password).catch((reason) => {
        this.set('errorMessage', reason.error);
      });
    }
  }
});
