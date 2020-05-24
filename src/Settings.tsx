import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { ShoutUser, generateUsername } from './db';
import { PeerConnection } from './peer';

type Props = RouteComponentProps & {
    localUser: ShoutUser,
    connectedPeers: PeerConnection[]
    setLocalUser: (user: ShoutUser) => void
}

export default function Settings(props: Props) {
    const [newLocalUsername, setNewLocalUsername] = useState<string | undefined>(undefined);

    function generateNewUsername() {
        setNewLocalUsername(generateUsername());
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        if(newLocalUsername) {
            props.setLocalUser({ ...props.localUser, name: newLocalUsername });
        }
    }

    return <React.Fragment> 
        <form onSubmit={onSubmit}>
            <fieldset>
                <label htmlFor="idField">ID</label>
                <input type="text" id="idField" disabled value={props.localUser.id} />
                <label htmlFor="nameField">Name</label>
                <div className="row">
                    <div className="column">
                        <input
                            type="text"
                            id="nameField"
                            placeholder="Username"
                            value={newLocalUsername || props.localUser.name}
                            onChange={e => setNewLocalUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <button type="button" className="button-outline" onClick={generateNewUsername}>
                            Generate
                        </button>
                    </div>
                </div>
                <input
                    className="button-primary"
                    type="submit"
                    value="Save"
                    disabled={newLocalUsername !== undefined && newLocalUsername.trim().length === 0}
                />
            </fieldset>
        </form>
        <hr />
        <table>
            <thead>
                <tr>
                    <td>Peer ID</td>
                    <td>Last active</td>
                </tr>
            </thead>
            <tbody>
                {props.connectedPeers.map(peer =>
                    <tr key={peer.id}>
                        <td>{peer.id}</td>
                        <td>{new Date(peer.lastHeartbeatReceived).toLocaleString()}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </React.Fragment>;
}