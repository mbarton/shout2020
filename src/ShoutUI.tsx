import React from 'react';
import { Shout } from './db';

type Props = {
    shout: Shout,
    peerId?: string
}

export default function ShoutUI({ shout, peerId }: Props) {
    return <h1>{shout.name}</h1>;
}