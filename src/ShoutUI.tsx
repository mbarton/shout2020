import React from 'react';

import * as Manifest from './data/manifest';

type Props = {
    shout: Manifest.Item
}

export default function ShoutUI({ shout }: Props) {
    return <h1>{shout.name.value}</h1>;
}