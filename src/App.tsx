import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import Peer from 'peerjs';

const peer = new Peer({
  host: "penguin.linux.test",
  port: 9000
});

function App() {
  const [id, setId] = useState<string | undefined>(undefined);
  const [remoteId, setRemoteId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    peer.on('open', setId);

    peer.on('connection', conn => {
      console.log('Connecion from ' + conn.peer);
    });
  }, []);

  function connect() {
    if(remoteId) {
      const conn = peer.connect(remoteId);

      conn.on('open', () => {
        console.log("Connected to " + remoteId);
      });
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        {id}
        <input
          type="text"
          placeholder="enter remote ID"
          value={remoteId || ''}
          onChange={(e) => setRemoteId(e.target.value)}
        />
        <button
          disabled={remoteId === undefined || remoteId.length === 0}
          onClick={connect}
        >Connect</button>
      </header>
    </div>
  );
}

export default App;
