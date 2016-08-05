import { Adapter } from 'ember-pouch';
import PouchDB from 'pouchdb';
import Ember from 'ember';
const { getOwner } = Ember;
//import DS from 'ember-data';

const { assert, isEmpty } = Ember;

export default Adapter.extend({
  init() {
    this._super(...arguments);

    let config = getOwner(this).resolveRegistration('config:environment');
    let authHost = config.emberPouch.authHost;
    let userDoc = '_users';
    
    assert('config.emberPouch.authHost must be set in your config/environment.js file', !isEmpty(authHost));
    //let secureRegex = /https/;
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
    return this.get('db').getUser(id).then(function(data) {
    	console.log(...arguments);
		data.id = data._id;
		data.rev = data._rev;
		delete data._id;
		delete data._rev;
		return {user: data};
    });
  },
  createRecord(){},
  updateRecord(store, type, snapshot){
  	let id = snapshot.id.substr("org.couchdb.user:".length);
  	let meta = snapshot.record.toJSON();
  	delete meta.rev;
  	delete meta.name;
  	return this.get('db').putUser(id, {metadata: meta});
  },
  deleteRecord(){},
  findAll(){

  },
  findQuery(){
    throw new Error(
      "findQuery not yet supported by ember-simple-auth-pouch"
    );
  }
});
