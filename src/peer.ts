import Peer from 'peerjs';
import { useState, useEffect } from 'react';
import { StartupData } from './db';

export type PeerConnection = {
    id: string,
    lastHeartbeatReceived: number
}

export type PeerState = {
    sessionId: string,
    connectedToBackend: boolean,
    connectedPeers: PeerConnection[]
}

type InternalPeerConnection = {
    connection: Peer.DataConnection,
    heartbeatIntervalHandle: NodeJS.Timeout,
    lastHeartbeatReceived: number
}

type InternalPeerState = {
    connectedToBackend: boolean,
    connections: InternalPeerConnection[]
}

export function usePeer(startupData: StartupData): PeerState {
    const [peerState, setPeerState] = useState<InternalPeerState>({
        connectedToBackend: false,
        connections: []
    });

    function onNewConnection(connection: Peer.DataConnection) {
        connection.on('open', () => {
            console.log("Connection established with " + connection.peer);

            connection.on('data', (data) => {
                switch(data.type) {
                    case 'HEARTBEAT':
                        setPeerState((peerState: InternalPeerState) => {
                            const connections = peerState.connections.map(conn => {
                                if(conn.connection.peer === connection.peer) {
                                    return {...conn, lastHeartbeatReceived: Date.now() }
                                }

                                return conn;
                            });

                            return {...peerState, connections};
                        });

                        break;

                    default:
                        console.error("Unknown message type " + data.type);
                }
            });

            setPeerState((peerState: InternalPeerState) => {
                const heartbeatIntervalHandle = setInterval(() => {
                    connection.send({ type: 'HEARTBEAT' });
                }, 1000);

                const internalConnection = {
                    connection,
                    heartbeatIntervalHandle,
                    lastHeartbeatReceived: Date.now()
                }

                const connections = [...peerState.connections, internalConnection];
                return { ...peerState, connections }
            });
        });

        connection.on('close', () => {
            console.log("Connection closed with " + connection.peer);

            setPeerState((peerState: InternalPeerState) => {
                const deadConnection = peerState.connections.find(c => c.connection.peer === connection.peer);
                
                if(deadConnection) {
                    clearInterval(deadConnection.heartbeatIntervalHandle);
                } else {
                    console.error("Unable to find internal connection for " + connection.peer);
                }

                const connections = peerState.connections.filter(c => c.connection.peer !== connection.peer);
                return { ...peerState, connections }
            });
        });

        connection.on('error', err => {
            console.error(err);
        });
    }

    useEffect(() => {
        const peer = new Peer(startupData.sessionId, {
            host: 'penguin.linux.test',
            port: 9000,
            key: 'shout'
        });

        peer.on('open', () => {
            setPeerState((peerState: InternalPeerState) => {
                return { ...peerState, connectedToBackend: true }
            });
        });

        peer.on('connection', onNewConnection);

        startupData.seeds.forEach(seedId => {
            console.log("Establishing connection with seed " + seedId);

            const conn = peer.connect(seedId);
            onNewConnection(conn);
        });
    }, []);

    const publicPeerState: PeerState = {
        sessionId: startupData.sessionId,
        connectedToBackend: peerState.connectedToBackend,
        connectedPeers: peerState.connections.map(({ connection, lastHeartbeatReceived }) => {
            return {
                id: connection.peer,
                lastHeartbeatReceived
            };
        })
    };

    return publicPeerState;
}