# Ember Simple Auth Pouch

This is Ember addon is an extension to the Ember Simple Auth library that provides a way to authenticate to a CouchDB server using pouchdb-authentication.

**Because user's credentials and tokens are exchanged between the
Ember.js app and the server, you must use HTTPS for this connection!**

## Installation

Ember Simple Auth Token can be installed with [Ember CLI](https://ember-cli.com/) by running:

```
ember install ember-simple-auth-pouch
```

## Setup

### Authenticator

In order to use the pouch authenticator, the application should have a route for login. In most cases, the login route will display a form with a `username` and `password` field. On form submit, the `authenticate` action will be called on the `session`:

```js
// app/router.js
Router.map(function() {
  this.route('login');
});
```

```html
{{! app/templates/login.hbs }}
<form {{action 'authenticate' on='submit'}}>
  <label for="username">Login</label>
  {{input id='username' placeholder='Enter Login' value=username}}
  <label for="password">Password</label>
  {{input id='password' placeholder='Enter Password' type='password' value=password}}
  <button type="submit">Login</button>
  {{#if errorMessage}}
    <p>{{errorMessage}}</p>
  {{/if}}
</form>
```

```js
// app/controllers/login.js
import Controller from '@ember/controller';
import { action } from "@ember/object";
import { inject as service } from '@ember/service';

export default class LoginController extends Controller {
  @service session;

  @action authenticate(event) {
    const { target } = event;
    let identification = target.querySelector('#identification').value;
    let password = target.querySelector('#password').value;
    event.preventDefault();
    this.session.authenticate('authenticator:pouch', identification, password).then(() => {
      this.setProperties({identification: '', password: ''});
    }).catch((reason) => {
      this.errorMessage = reason.message || reason;
    });
  }
}
```

#### Pouch Authenticator

Include

```js
// config/environment.js
ENV.authAdapter = 'application';
```

Setup the pouch authenticator

```js
// app/authenticators/pouchjs
import Pouch from 'ember-simple-auth-pouch/authenticators/pouch';

export default class PouchAuthenticator extends Pouch {
  getDb() {
    let pouchAdapter = this.store.adapterFor('application');//getOwner(this).lookup(`adapter:${pouchAdapterName}`);
    return pouchAdapter.remoteDb;
  }
}
```

Authenticated routes

```js
// app/routes/secret.js
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class SecretRoute extends Route.extend(AuthenticatedRouteMixin) {
  // do your secret model setup here
}
```

### Using Session service

Invalidate session when logged out remote:

```js
// app/adapters/application.js
import config from '../config/environment';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { Adapter } from 'ember-pouch';
import PouchDB from 'ember-pouch/pouchdb';
import auth from 'pouchdb-authentication';

PouchDB.plugin(auth);

export default class ApplicationAdapter extends Adapter {
  @service session;
  @service cloudState;
  @service refreshIndicator;

  constructor() {
    super(...arguments);

    const localDb = config.local_couch || 'blogger';

    assert('local_couch must be set', !isEmpty(localDb));

    const db = new PouchDB(localDb);
    this.db = db;

    // If we have specified a remote CouchDB instance, then replicate our local database to it
    if ( config.remote_couch ) {
      const remoteDb = new PouchDB(config.remote_couch, {
        fetch: function (url, opts) {
          opts.credentials = 'include';
          return PouchDB.fetch(url, opts);
        }
      });

      const replicationOptions = {
        live: true,
        retry: true
      };

      db.replicate.from(remoteDb, replicationOptions).on('paused', (err) => {
        this.cloudState.setPull(!err);
      });

      db.replicate.to(remoteDb, replicationOptions).on('denied', (err) => {
        if (!err.id.startsWith('_design/')) {
          //there was an error pushing, probably logged out outside of this app (couch/cloudant dashboard)
          this.session.invalidate();//this cancels the replication

          throw({message: "Replication failed. Check login?"});//prevent doc from being marked replicated
        }
      }).on('paused',(err) => {
        this.cloudState.setPush(!err);
      }).on('error',() => {
        this.session.invalidate();//mark error by loggin out
      });

      this.remoteDb = remoteDb;
    }

    return this;
  },

  unloadedDocumentChanged: function(obj) {
    this.refreshIndicator.kickSpin();

    let store = this.store;
    let recordTypeName = this.getRecordTypeName(store.modelFor(obj.type));
    this.db.rel.find(recordTypeName, obj.id).then(function(doc) {
      store.pushPayload(recordTypeName, doc);
    });
  }
});
```

## Sample app

Tom Dale's blog example using Ember CLI and ember-simple-auth-pouch: [broerse/ember-cli-blog](https://github.com/broerse/ember-cli-blog)

## Credits

And of course thanks to all our wonderful contributors, [here](https://github.com/martinic/ember-simple-auth-pouch/graphs/contributors)! and especially [@mattmarcum](https://github.com/mattmarcum) for creating this addon.

## Changelog
* **0.2.0** - Switch to import 'pouchdb-authentication' in App
* **0.1.0** - Release v0.1.0
* **0.1.0-beta.7** - no .db, but use getDb() everywhere
* **0.1.0-beta.6** - use getDb()
* **0.1.0-beta.5** - use ember-pouch 5.0.0-beta.2
* **0.1.0-beta.4** - use response when restoring session
* **0.1.0-beta.3** - Add peerDependencies
* **0.1.0-beta.2** - Switch to ember-cli 2.7.0
* **0.1.0-beta.1** - First Beta release
