import PouchDB from 'pouchdb';
import Ember from 'ember';
import DS from 'ember-data';

const { assert, isEmpty } = Ember;

export default DS.RESTAdapter.extend({
  init() {
    this._super(...arguments);

    let config = this.container.lookupFactory('config:environment');
    let authHost = config.emberPouch.authHost;
    let userDoc = '_users';
    let secureRegex = /https/;

    assert('config.emberPouch.authHost must be set in your config/environment.js file', !isEmpty(authHost));
    //assert('Your remote db should be secure!', secureRegex.test(authHost));

    let authDb = authHost+'/'+userDoc;

    let db = new PouchDB(authDb, {skipSetup: true});
    if(config.emberPouch.syncUsers) {
      let local = new PouchDB(userDoc);
      local.sync(db, {live: true, retry: true})
        .on('error', console.log.bind(console));
    }

    this.set('db', db);
  },

  findRecord(store, type, id){
    this.get('db').getUser
  },
  createRecord(){},
  updateRecord(){},
  deleteRecord(){},
  findAll(){

  },
  findQuery(){
    throw new Error(
      "findQuery not yet supported by ember-cli-simple-auth-pouch"
    );
  }
});
