import React from 'react';
import { RouteComponentProps, Link } from '@reach/router';
import sortBy from 'lodash.sortby';
import * as Manifest from './data/manifest';
import * as Users from './data/users';
import { ShareButton } from './ShareButton';

type Props = RouteComponentProps & {
    manifest: Manifest.State,
    users: Users.State,
    localUserId: string
}

function getShoutDisplayName(itemId: string, item: Manifest.Item, localUserId: string, users: Users.State): string {
    const createdByUserId = item.createdBy.value;
    
    if(createdByUserId in users) {
        const createdBy = users[createdByUserId].name.value;

        if(createdByUserId === localUserId) {
            return item.name.value;
        }

        return `${createdBy}/${item.name.value}`;
    }

    return itemId;
} 

export default function SelectShout(props: Props) {
    const shouts = sortBy(Object.entries(props.manifest), ([, { createdAt }]) => createdAt.value);

    return <table>
        <thead>
            <tr>
                <td>Name</td>
                <td>Created</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            {shouts.map(([id, item]) => {
                const displayName = getShoutDisplayName(id, item, props.localUserId, props.users);

                return <tr key={id}>
                    <td>
                        <Link to={`/shout/${id}`}>{displayName}</Link>
                    </td>
                    <td>
                        {new Date(item.createdAt.value).toLocaleString()}
                    </td>
                    <td>
                        {/* <div className='float-right'>
                            <ShareButton id={shout.id} peerId={props.sessionId} connected={props.connected} />
                            <button className="button" onClick={() => props.deleteShout(shout.id)}>Delete</button>
                        </div> */}
                    </td>
                </tr>;
            })}
        </tbody>
    </table>;
}