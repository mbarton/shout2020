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

function App() {
  const [{ identity, users, manifest }, dispatch] = useShoutState();

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
        connectedToBackend={peerState.connectedToBackend}
        peerIds={startupData.seeds}
        connectedPeerIds={peerState.connectedPeers.map(({ id }) => id)}
      />
      <Settings
        path='/settings'
        localUser={localUser}
        connectedPeers={peerState.connectedPeers}
        updateUserMetadata={(name: string) => {
          saveLocalUser({ ...localUser, name });
          setLocalUser({ ...localUser, name });
        }}
      />
    </Router>
  </div>;
}

export default App;
