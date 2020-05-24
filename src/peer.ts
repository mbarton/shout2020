import Peer from 'peerjs';
import { useState, useEffect } from 'react';
import { ShoutUser, fetchStartupData } from './db';

type PeerState = {
    connectedToBackend: boolean,
    connectedPeers: string[]
}

type InternalPeerState = {
    connectedToBackend: boolean,
    connections: Peer.DataConnection[]
}

const startupData = fetchStartupData();

export function usePeer(): PeerState {
    const [peerState, setPeerState] = useState<InternalPeerState>({
        connectedToBackend: false,
        connections: []
    });

    function onNewConnection(connection: Peer.DataConnection) {
        console.log(connection);

        connection.on('open', () => {
            setPeerState((peerState: InternalPeerState) => {
                const connections = [...peerState.connections, connection];
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
            port: 9000
        });

        peer.on('open', () => {
            setPeerState((peerState: InternalPeerState) => {
                return { ...peerState, connectedToBackend: true }
            });
        });

        peer.on('connection', onNewConnection);

        startupData.seeds.forEach(seedId => {
            const conn = peer.connect(seedId);
            onNewConnection(conn);
        });
    }, []);

    const publicPeerState: PeerState = {
        connectedToBackend: peerState.connectedToBackend,
        connectedPeers: peerState.connections.map(({ peer }) => peer)
    };

    return publicPeerState;
}