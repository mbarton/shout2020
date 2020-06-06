import React, { useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import ShoutUI from './ShoutUI';
import * as Manifest from './data/manifest';

type Props = RouteComponentProps & {
    id?: string,
    manifest: Manifest.State
}

export default function ShoutLoader(props: Props) {
    if(props.id === undefined) {
        return <div>Missing ID</div>;
    }

    const shout = props.manifest[props.id];

    if(!shout) {
        return <div>4 (to the) 04 - that shout does not exist!</div>;
    }

    return <ShoutUI shout={shout} {...props} />;
}