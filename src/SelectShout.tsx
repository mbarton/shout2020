import React from 'react';
import { RouteComponentProps, Link } from '@reach/router';
import sortBy from 'lodash.sortby';
import { ShoutSummary, ShoutUser } from './db';
import { ShareButton } from './ShareButton';

type Props = RouteComponentProps & {
    shouts: ShoutSummary[],
    localUser: ShoutUser,
    connected: boolean,
    deleteShout: (id: string) => void
}

export default function SelectShout(props: Props) {
    const shouts = sortBy(props.shouts, ({ createdTime }) => createdTime);

    return <table>
        <thead>
            <tr>
                <td>Name</td>
                <td>Created</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            {shouts.map(({ id, name, createdTime, createdBy }) => {
                const displayName = createdBy.id !== props.localUser.id
                    ? `${createdBy.name}/${name}`
                    : name; 

                return <tr key={id}>
                    <td>
                        <Link to={`/shout/${id}`}>{displayName}</Link>
                    </td>
                    <td>
                        {new Date(createdTime).toLocaleString()}
                    </td>
                    <td>
                        <div className='float-right'>
                            <ShareButton id={id} peerId={props.localUser.id} connected={props.connected} />
                            <button className="button" onClick={() => props.deleteShout(id)}>Delete</button>
                        </div>
                    </td>
                </tr>;
            })}
        </tbody>
    </table>;
}