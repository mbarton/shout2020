import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import Peer from 'peerjs';

function App() {
  const [id, setId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const peer = new Peer();
    peer.on('open', setId);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {id}
      </header>
    </div>
  );
}

export default App;
