import Peer from 'peerjs';
import { useEffect, useReducer } from 'react';
import { Identity } from './data/state';
import * as Users from './data/users';


const HEARTBEAT_INTERVAL = 1000;

type PeerMessage =
    { type: 'heartbeat'};

export type PeerConnection = {
    connection: Peer.DataConnection,
    heartbeatIntervalHandle?: NodeJS.Timeout,
    lastHeartbeatReceived?: number
}

export type PeerState = {
    sessionId: string,
    connectedToBackend: boolean,
    connections: { [key: string]: PeerConnection },
    error?: any
}

type PeerAction =
    { type: 'set_connected_to_backend', connectedToBackend: boolean } |
    { type: 'set_connection_state', connection: PeerConnection } |
    { type: 'update_heartbeat', connectionId: string } |
    { type: 'remove_connection', connectionId: string } |
    { type: 'set_error', error: any };

function reducer(state: PeerState, action: PeerAction): PeerState {
    switch(action.type) {
        case 'set_connected_to_backend':
            return { ...state, connectedToBackend: action.connectedToBackend };

        case 'set_connection_state': {
            const before = state.connections;
            const after = { ...before, [action.connection.connection.peer]: action.connection };    

            return { ...state, connections: after };
        }

        case 'update_heartbeat': {
            const connectionBefore = state.connections[action.connectionId];
            const connectionAfter = { ...connectionBefore, lastHeartbeatReceived: Date.now() };

            const before = state.connections;
            const after = { ...before, [action.connectionId]: connectionAfter };
            
            return { ...state, connections: after };
        }

        case 'remove_connection':
            const { heartbeatIntervalHandle } = state.connections[action.connectionId];
            if(heartbeatIntervalHandle) {
                clearInterval(heartbeatIntervalHandle);
            }

            const after = { ...state.connections };
            delete after[action.connectionId];

            return { ...state, connections: after };

        case 'set_error':
            return { ...state, error: action.error };
    }
}

function bootUpConnection(connection: Peer.DataConnection, dispatch: React.Dispatch<PeerAction>): void {
    connection.on('open', () => {
        console.log(`Connected to peer ${connection.peer}`);

        dispatch({ type: 'set_connection_state', connection: {
            connection,
            heartbeatIntervalHandle: setInterval(() => {
                const message = { type: 'heartbeat' };
                // console.log("Outbound message " + JSON.stringify(message));

                connection.send(JSON.stringify(message));
            }, HEARTBEAT_INTERVAL)
        }})
    });

    connection.on('data', (data: string) => {
        const message = JSON.parse(data);
        // console.log("Inbound message " + JSON.stringify(message));
        
        switch(message.type) {
            case 'heartbeat':
                dispatch({ type: 'update_heartbeat', connectionId: connection.peer });
                break;
        }
    });

    connection.on('close', () => {
        console.log(`Disconnected from peer ${connection.peer}`);

        dispatch({ type: 'remove_connection', connectionId: connection.peer });
    });

    connection.on('error', (error) => {
        dispatch({ type: 'set_error', error });
    });

    dispatch({ type: 'set_connection_state', connection: {
        connection
    }});
}

function bootUp(sessionId: string, seeds: string[], dispatch: React.Dispatch<PeerAction>) {
    const host = 'penguin.linux.test';
    const port = 9000;
    const key = 'shout';
    
    console.log(`Connecting to PeerJS signalling server wss://${host}:${port}/${key}`);
    
    const peer = new Peer(sessionId, { host, port, key });

    peer.on('open', () => {
        dispatch({ type: 'set_connected_to_backend', connectedToBackend: true });
    });

    peer.on('connection', (connection) => {
        bootUpConnection(connection, dispatch);
    });

    peer.on('disconnected', () => {
        dispatch({ type: 'set_connected_to_backend', connectedToBackend: false });
    });

    peer.on('error', (error) => {
        dispatch({ type: 'set_error', error });
    });

    seeds.forEach(seed => {
        console.log(`Connecting to seed ${seed}`);
        
        const connection = peer.connect(seed);
        bootUpConnection(connection, dispatch);
    });
}

export function usePeer(identity: Identity, users: Users.State): PeerState {
    const sessionId = `${identity.id}_${identity.iteration}`;
    const initialPeers = [...Object.keys(users)].filter(id => id !== identity.id);

    const [state, dispatch] = useReducer(reducer, {
        sessionId,
        connectedToBackend: false,
        connections: {}
    });

    useEffect(() => {        
        bootUp(sessionId, initialPeers, dispatch);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // TODO MRB: react to users being added and removed in appState

    return state;
}