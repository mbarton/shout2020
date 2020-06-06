import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { PeerState } from './peer';
import { generateUsername } from './data/names';
import { Identity } from './data/state';
import * as Users from './data/users';

type Props = RouteComponentProps & {
    identity: Identity,
    users: Users.State,
    peer: PeerState,
    updateUserMetadata: (name: string) => void
}

export default function Settings(props: Props) {
    const localUserName = props.users[props.identity.userId].name.value;
    const [newLocalUsername, setNewLocalUsername] = useState<string | undefined>(undefined);

    function generateNewUsername() {
        setNewLocalUsername(generateUsername());
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        if(newLocalUsername) {
            props.updateUserMetadata(newLocalUsername);
        }
    }

    return <React.Fragment> 
        <form onSubmit={onSubmit}>
            <fieldset>
                <label htmlFor="idField">ID</label>
                <input type="text" id="idField" disabled value={props.identity.userId} />
                <label htmlFor="nameField">Name</label>
                <div className="row">
                    <div className="column">
                        <input
                            type="text"
                            id="nameField"
                            placeholder="Username"
                            value={newLocalUsername || localUserName}
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
                </tr>
            </thead>
            <tbody>
                {props.peer.userConnections.flatMap(({ sessionConnections }) => {
                    return sessionConnections.map(({ peerConnection }) => {
                        return <tr key={peerConnection.peer}>
                            <td>{peerConnection.peer}</td>
                        </tr>;
                    });
                })}
            </tbody>
        </table>
    </React.Fragment>;
}