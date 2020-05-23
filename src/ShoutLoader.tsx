import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { fetchShoutById } from './db';

type Props = RouteComponentProps & {
    id?: string
}

export default function ShoutLoader(props: Props) {
    if(props.id === undefined) {
        return <div>Missing ID</div>;
    }

    const shout = fetchShoutById(props.id);

    if(!shout) {
        return <div>4 (to the) 04 - that shout does not exist!</div>;
    }

    return <h1>{props.id}</h1>;
}