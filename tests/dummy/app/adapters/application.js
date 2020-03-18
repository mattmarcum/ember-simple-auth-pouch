import { Adapter } from 'ember-pouch';
import config from 'dummy/config/environment';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import PouchDB from 'pouchdb';
import auth from 'pouchdb-authentication';

PouchDB.plugin(auth);

function createDb() {
  let localDb = config.emberPouch.localDb;

  assert('emberPouch.localDb must be set', !isEmpty(localDb));

  let db = new PouchDB(localDb);

  if (config.emberPouch.remoteDb) {
    let remoteDb = new PouchDB(config.emberPouch.remoteDb);

    db.sync(remoteDb, {
      live: true,
      retry: true
    });
  }

  return db;
}

export default Adapter.extend({
  init() {
    this._super(...arguments);
    this.set('db', createDb());
  }
});
