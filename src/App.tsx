import React, { useState } from 'react';
import { Router, Link } from "@reach/router";

import CreateShout from './CreateShout';
import SelectShout from './SelectShout';
import Settings from './Settings';
import { ShoutUser, saveLocalUser, fetchShoutSummaries, saveShoutSummaries, Shout, saveShout, deleteShout, fetchStartupData } from './db';
import ShoutLoader from './ShoutLoader';
import Join from './Join';
import { usePeer } from './peer';

const startupData = fetchStartupData();

function App() {
  const [localUser, setLocalUser] = useState(startupData.localUser);
  const [shoutSummaries, setShoutSummaries] = useState(fetchShoutSummaries());

  const peerState = usePeer(startupData);

  return <div className='container'>
    <div className='row'>
      <div className='column'>
        <Link to='/' className='button'>Shout</Link>
      </div>
      <div className='column column-50'>
        <div className='float-right'>
          <Link to='/new' className='button'>Create</Link>
          <Link to='/settings' className='button button-outline'>{localUser.name}</Link>
        </div>
      </div>
    </div>
    <Router>
      <SelectShout
        path='/'
        localUser={localUser}
        shouts={shoutSummaries}
        connected={peerState.connectedToBackend}
        sessionId={startupData.sessionId}
        deleteShout={(id: string) => {
          const updated = shoutSummaries.filter(shout => shout.id !== id);
          
          deleteShout(id);
          saveShoutSummaries(updated);

          setShoutSummaries(updated);
        }}
      />
      <CreateShout
        path='/new'
        localUser={localUser}
        existingShouts={shoutSummaries}
        saveShout={(shout: Shout) => {
          const updated = [...shoutSummaries, shout];
          
          saveShout(shout);
          saveShoutSummaries(updated);

          setShoutSummaries(updated);
        }}
      />
      <ShoutLoader
        path='/shout/:id'
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
        setLocalUser={(user: ShoutUser) => {
          saveLocalUser(user);
          setLocalUser(user);
        }}
      />
    </Router>
  </div>;
}

export default App;
