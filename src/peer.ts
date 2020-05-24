import Peer from 'peerjs';
import { useState, useEffect } from 'react';

type PeerState = {
    connectedToBackend: boolean,
    connectedPeers: string[]
}

type InternalPeerState = {
    connectedToBackend: boolean,
    connections: Peer.DataConnection[]
}

export function usePeer(id: string, seeds: string[]): { peerState: PeerState, connectToPeer: (id: string) => void } {
    const [peerState, setPeerState] = useState<InternalPeerState>({
        connectedToBackend: false,
        connections: []
    });

    useEffect(() => {
        const peer = new Peer(id, {
            host: 'penguin.linux.test',
            port: 9000
        });

        peer.on('open', () => {
            setPeerState((peerState: InternalPeerState) => {
                return { ...peerState, connectedToBackend: true }
            });
        });

        peer.on('connection', (connection) => {
            setPeerState((peerState: InternalPeerState) => {
                const connections = [...peerState.connections, connection];
                return { ...peerState, connections }
            });
        });

        peer.on('error', err => {
            console.error(err);
        });
    }, [id]);

    function connectToPeer(id: string) {

    }

    const publicPeerState: PeerState = {
        connectedToBackend: peerState.connectedToBackend,
        connectedPeers: peerState.connections.map(({ peer }) => peer)
    };

    return { peerState: publicPeerState, connectToPeer };
}