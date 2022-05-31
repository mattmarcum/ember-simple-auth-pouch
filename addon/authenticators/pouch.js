import Base from 'ember-simple-auth/authenticators/base';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import { reject } from 'rsvp';

export default class PouchAuthenticator extends Base {
  @service store;

  getDb() {
    if (this.db) return this.db;

    let config = getOwner(this).resolveRegistration('config:environment');

    //let the user override the default adapter
    let pouchAdapterName = config.authAdapter || 'application';

    let pouchAdapter = this.store.adapterFor(pouchAdapterName);

    assert(
      'You must have an ember-pouch adapter setup for authentication',
      pouchAdapter
    );

    this.db = pouchAdapter.db;

    return this.db;
  }

  restore(data) {
    return this.getDb()
      .getSession()
      .then((resp) => {
        let result = null;
        if (!isEmpty(data.name) && resp.userCtx.name === data.name) {
          result = resp.userCtx;
          this.getDb().emit('loggedin');
        } else {
          result = reject('Not logged in or incorrect user in cookie');
        }

        return result;
      });
  }

  authenticate(username, password) {
    return this.getDb()
      .login(username, password)
      .then(() => this.getDb().getSession())
      .then((resp) => {
        this.getDb().emit('loggedin');
        return resp.userCtx;
      });
  }

  invalidate() {
    let result = this.getDb().logout();
    this.getDb().emit('loggedout');
    return result;
  }
}
