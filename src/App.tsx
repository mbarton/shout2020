import React, { useState } from 'react';
import { Router, Link } from "@reach/router";

import CreateShout from './CreateShout';
import SelectShout from './SelectShout';
import Settings from './Settings';
import ShoutLoader from './ShoutLoader';
import Join from './Join';
import { usePeer } from './peer';
import { useShoutState } from './data/state';

import * as Manifest from './data/manifest';
import * as Users from './data/users';

function App() {
  const [{ identity, users, manifest }, dispatch] = useShoutState();
  const peer = usePeer(identity, users);

  return <div className='container'>
    <div className='row'>
      <div className='column'>
        <Link to='/' className='button'>Shout</Link>
      </div>
      <div className='column column-50'>
        <div className='float-right'>
          <Link to='/new' className='button'>Create</Link>
          <Link to='/settings' className='button button-outline'>{users[identity.id].name?.value}</Link>
        </div>
      </div>
    </div>
    <Router>
      <SelectShout
        path='/'
        manifest={manifest}
        users={users}
        localUserId={identity.id}
      />
      <CreateShout
        path='/new'
        manifest={manifest}
        createShout={(name: string) => {
          dispatch({ type: 'manifest_action', action: Manifest.create(name, identity.id) });
        }}
      />
      <ShoutLoader
        path='/shout/:id'
        manifest={manifest}
      />
      <Join
        path='/join'
        connectedToBackend={peer.connectedToBackend}
        peerIds={Object.keys(users)}
        // TODO MRB: need to split this on _ to get the actual IDs?
        connectedPeerIds={Object.keys(peer.connections)}
      />
      <Settings
        path='/settings'
        identity={identity}
        users={users}
        connectedPeers={peer.connections}
        updateUserMetadata={(name: string) => {
          dispatch({ type: 'user_action', action: Users.setUser(identity.id, identity.id, name) });
        }}
      />
    </Router>
  </div>;
}

export default App;
