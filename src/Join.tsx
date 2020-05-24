import React from "react";
import { RouteComponentProps } from "@reach/router";

type Props = RouteComponentProps & {
    connectedToBackend: boolean
}

export default function Join({ connectedToBackend }: Props) {
    return <React.Fragment>
        <dl>
            <dt>Connecting to Shout backend {connectedToBackend ? '✅' : '🔄'}</dt>
            {/* <dt>Connecting to Shout session {hackConnectedRemotePeerId ? '✅' : '🔄'}</dt> */}
        </dl>
    </React.Fragment>;
}
