import React from 'react';
import { Router, Link } from "@reach/router";

import CreateShout from './CreateShout';
import SelectShout from './SelectShout';
import Settings from './Settings';
import ShoutLoader from './ShoutLoader';
import { usePeer } from './peer';
import { useShoutState, ShoutAction } from './data/state';

import * as Manifest from './data/manifest';
import * as Users from './data/users';

function App() {
  const [{ identity, users, manifest }, dispatchLocal] = useShoutState();
  const [peer, dispatchRemote] = usePeer(identity, manifest, users, dispatchLocal);

  function dispatch(action: ShoutAction) {
    dispatchLocal(action);
    dispatchRemote(action);
  }

  const username = users[identity.userId]?.name?.value;

  return <div className='container'>
    <div className='row'>
      <div className='column'>
        <Link to='/' className='button'>Shout</Link>
      </div>
      <div className='column column-50'>
        <div className='float-right'>
          <Link to='/new' className='button'>Create</Link>
          <Link to='/settings' className='button button-outline'>{username}</Link>
        </div>
      </div>
    </div>
    <Router>
      <SelectShout
        path='/'
        localUserId={identity.userId}
        manifest={manifest}
        users={users}
        peer={peer}
      />
      <CreateShout
        path='/new'
        manifest={manifest}
        createShout={(name: string) => {
          dispatch({ type: 'manifest_action', action: Manifest.create(name, identity.userId) });
        }}
      />
      <ShoutLoader
        path='/shout/:id'
        manifest={manifest}
      />
      <Settings
        path='/settings'
        identity={identity}
        users={users}
        peer={peer}
        updateUserMetadata={(name: string) => {
          dispatch({ type: 'user_action', action: Users.setUser(identity.userId, identity.userId, name) });
        }}
      />
    </Router>
  </div>;
}

export default App;
