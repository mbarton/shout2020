import React, { useState } from 'react';
import { Router, Link } from "@reach/router";

import CreateShout from './CreateShout';
import SelectShout from './SelectShout';
import Settings from './Settings';
import { fetchLocalUser, ShoutUser, saveLocalUser, fetchShoutSummaries, saveShoutSummaries, Shout, saveShout, deleteShout } from './db';
import ShoutLoader from './ShoutLoader';
import Join from './Join';
import { usePeer } from './peer';

function getSeeds(location: Location): string[] {
  const search = new URLSearchParams(location.search);
  const peerParam = search.get("peers");

  if(peerParam === null) {
    return [];
  }

  return peerParam.split(",").map(s => s.trim());
}

function App() {
  const [localUser, setLocalUser] = useState(fetchLocalUser());
  const [shoutSummaries, setShoutSummaries] = useState(fetchShoutSummaries());

  const { peerState } = usePeer(localUser.id, getSeeds(window.location));

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
      />
      <Settings
        path='/settings'
        localUser={localUser}
        setLocalUser={(user: ShoutUser) => {
          saveLocalUser(user);
          setLocalUser(user);
        }}
      />
    </Router>
  </div>;
}

export default App;
