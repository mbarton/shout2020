import Peer from 'peerjs';
import { useEffect, useReducer, useState, useRef } from 'react';
import { Identity, ShoutAction } from './data/state';
import * as Manifest from './data/manifest';
import * as Users from './data/users';
import difference from 'lodash.difference';
import uniq from 'lodash.uniq';

type SessionConnection =
    { sessionId: String, state: 'connecting', peerConnection: Peer.DataConnection } |
    { sessionId: String, state: 'connected', peerConnection: Peer.DataConnection };

type UserConnection = { userId: string, sessionConnections: SessionConnection[] };

export type PeerState = {
    connectedToSignalling: boolean,
    userConnections: UserConnection[],
    error?: any
}

type PeerAction =
    { type: 'set_signalling_connected', connected: boolean } |
    { type: 'add_user', userId: string } |
    { type: 'add_session', userId: string, sessionId: string, peerConnection: Peer.DataConnection } |
    { type: 'session_connected', userId: string, sessionId: string } |
    { type: 'session_disconnected', userId: string, sessionId: string } |
    { type: 'set_error', error: any };

function reducer(state: PeerState, action: PeerAction): PeerState {
    switch(action.type) {
        case 'set_signalling_connected':
            return { ...state, connectedToSignalling: action.connected };

        case 'add_user':
            return { ...state, userConnections: state.userConnections.concat([
                { userId: action.userId, sessionConnections: [] }
            ]) };

        case 'add_session': {
            return { ...state, userConnections: state.userConnections.map(userConnection => {
                return { ...userConnection, sessionConnections: userConnection.sessionConnections.concat([
                    { sessionId: action.sessionId, state: 'connecting', peerConnection: action.peerConnection }
                ]) };
            })};
        }

        case 'session_connected': {
            return { ...state, userConnections: state.userConnections.map(userConnection => {
                return { ...userConnection, sessionConnections: userConnection.sessionConnections.map(sessionConnection => {
                    if(sessionConnection.sessionId === action.sessionId) {
                        return { ...sessionConnection, state: 'connected' };
                    }

                    return sessionConnection;
                })};
            })};
        }

        case 'session_disconnected':
            return { ...state, userConnections: state.userConnections.map(userConnection => {
                return { ...userConnection, sessionConnections: userConnection.sessionConnections.filter(sessionConnection => {
                    return sessionConnection.sessionId !== action.sessionId;
                })};
            })};

        case 'set_error':
            return { ...state, error: action.error };
    }
}

function bootUpConnection(userId: string, sessionId: string, peerConnection: Peer.DataConnection, dispatch: React.Dispatch<PeerAction>, dispatchInboundMessage: React.Dispatch<ShoutAction>): void {
    peerConnection.on('open', () => {
        console.log(`Connected to peer ${peerConnection.peer}`);
        dispatch({ type: 'session_connected', userId, sessionId });
    });

    peerConnection.on('data', (data: string) => {
        const message = JSON.parse(data);
        
        switch(message.type) {
            default:
                console.log("Inbound message " + JSON.stringify(message));
                dispatchInboundMessage(message);
                break;
        }
    });

    peerConnection.on('close', () => {
        console.log(`Disconnected from peer ${peerConnection.peer}`);
        dispatch({ type: 'session_disconnected', userId, sessionId });
    });

    peerConnection.on('error', (error) => {
        dispatch({ type: 'set_error', error });
    });

    dispatch({ type: 'add_session', userId, sessionId, peerConnection });
}

async function connectToUser(userId: string, localSessionId: string, discoveryEndpoint: string, peer: Peer, dispatch: React.Dispatch<PeerAction>, dispatchInboundMessage: React.Dispatch<ShoutAction>) {
    dispatch({ type: 'add_user', userId });
    console.log(`Looking up sessions for ${userId} from ${discoveryEndpoint}`);

    const discoveryResponse = await fetch(discoveryEndpoint);
    
    // TODO MRB: filter on the server
    const sessionIds = (await discoveryResponse.json() as string[])
        .filter(sessionId => sessionId !== localSessionId && sessionId.startsWith(`${userId}_`));

    if(sessionIds.length === 0) {
        dispatch({ type: 'set_error', error: `${userId} is not connected!`});
    } else {
        sessionIds.forEach(sessionId => {
            console.log(`Connecting to session ${sessionId}`);

            const peerConnection = peer.connect(sessionId);
            bootUpConnection(userId, sessionId, peerConnection, dispatch, dispatchInboundMessage);
        });
    }
}

function bootUp(host: string, port: number, sessionId: string, dispatch: React.Dispatch<PeerAction>, dispatchInboundMessage: React.Dispatch<ShoutAction>): Peer {
    const key = 'shout';

    console.log(`Connecting to signalling server ws://${host}:${port}/${key}`);
    const peerJs = new Peer(sessionId, { host, port, key });

    peerJs.on('open', () => {
        dispatch({ type: 'set_signalling_connected', connected: true });
    });

    peerJs.on('connection', (connection) => {
        const [userId, sessionId] = connection.peer.split("_");
        bootUpConnection(userId, sessionId, connection, dispatch, dispatchInboundMessage);
    });

    peerJs.on('disconnected', () => {
        dispatch({ type: 'set_signalling_connected', connected: false });
    });

    peerJs.on('error', (error) => {
        dispatch({ type: 'set_error', error });
    });

    return peerJs;
}

export function usePeer(identity: Identity, manifest: Manifest.State, users: Users.State, dispatchLocal: React.Dispatch<ShoutAction>): [PeerState, (action: ShoutAction) => void] {
    const host = 'localhost';
    const port = 9000;
    
    const sessionId = `${identity.userId}_${identity.sessionId}`;
    const discoveryEndpoint = `http://${host}:${port}/api/peers`;

    const peer = useRef<Peer | null>();

    const [state, dispatch] = useReducer(reducer, {
        connectedToSignalling: false,
        userConnections: []
    });

    useEffect(() => {
        peer.current = bootUp(host, port, sessionId, dispatch, dispatchLocal);

        Object.keys(users).forEach(userId => {
            connectToUser(userId, sessionId, discoveryEndpoint, peer.current!, dispatch, dispatchLocal);
        });
    }, []);

    // useEffect(() => {
    //     // TODO MRB: re-enable to connect to peers based on shouts
    //     // const usersFromManifests = uniq(Object.values(manifest).flatMap(({ users }) => users));
    //     // const currentUsersWithConnections = Object.keys(state.userConnections);
    //     // const newUsers = difference(currentUsersWithConnections, usersFromManifests);
        
    //     // newUsers.forEach(userId =>  {
    //     //     connectToUser(userId, discoveryEndpoint, peer.current!, dispatch, dispatchLocal);
    //     // });
    // }, [manifest]);

    function dispatchRemote(action: ShoutAction) {
        // TODO MRB: more intelligent routing based on which user is present in which shout
        state.userConnections.forEach(({ sessionConnections }) => {
            sessionConnections.forEach(({ state, peerConnection}) => {
                if(state === 'connected') {
                    const message = JSON.stringify(action);

                    console.log(`Outbound message to ${peerConnection.peer} - ${message}`);
                    peerConnection.send(message);
                }
            });
        })
    }

    return [state, dispatchRemote];
}