import { Adapter } from 'ember-pouch';
import config from 'dummy/config/environment';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import PouchDB from 'ember-pouch/pouchdb';
import auth from 'pouchdb-authentication';
import { inject as service } from '@ember/service';

PouchDB.plugin(auth);

function createDb() {
  let localDb = config.emberPouch.localDb;

  assert('emberPouch.localDb must be set', !isEmpty(localDb));

  let db = new PouchDB(localDb);

  if (config.emberPouch.remoteDb) {
    let remoteDb = new PouchDB(config.emberPouch.remoteDb);

    db.sync(remoteDb, {
      live: true,
      retry: true,
    });
  }

  return db;
}

export default class ApplicationAdapter extends Adapter {
  @service store;

  constructor() {
    super(...arguments);
    this.db = createDb();
  }
}
