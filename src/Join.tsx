import React from "react";
import { RouteComponentProps } from "@reach/router";

type Props = RouteComponentProps & {
    connectedToBackend: boolean,
    peerIds: string[],
    connectedPeerIds: string[]
}

export default function Join({ connectedToBackend, peerIds, connectedPeerIds }: Props) {
    console.log({ peerIds, connectedPeerIds });
    const connectedToPeers = peerIds.some(peerId => connectedPeerIds.includes(peerId));

    return <React.Fragment>
        <dl>
            <dt>Connecting to backend {connectedToBackend ? '✅' : '🔄'}</dt>
            <dt>Connecting to peers {connectedToPeers ? '✅' : '🔄'}</dt>
        </dl>
    </React.Fragment>;
}
