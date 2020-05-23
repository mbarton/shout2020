import React, { useState, useCallback } from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { v4 as uuidv4 } from 'uuid';
import { generateShoutName, ShoutSummary, Shout, ShoutUser } from './db';

type Props = RouteComponentProps & {
    localUser: ShoutUser,
    existingShouts: ShoutSummary[],
    saveShout: (shout: Shout) => void
}

export default function CreateShout(props: Props) {
    const navigate = useNavigate();
    const [name, setName] = useState(generateShoutName());

    const nameRef = useCallback((elem: HTMLInputElement | null) => {
        if(elem) {
            elem.focus();
        }
    }, []);

    function generateNewName() {
        setName(generateShoutName());
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        props.saveShout({
            id: uuidv4(),
            name,
            createdTime: new Date().getTime(),
            createdBy: props.localUser
        });

        navigate('/');
    }

    const nameLengthZero = name.trim().length === 0;
    const nameAlreadyUsed = props.existingShouts.find(shout => shout.name === name) !== undefined;

    return <form onSubmit={onSubmit}>
        <fieldset>
            <label htmlFor="nameField">Name</label>
            <div className="row">
                <div className="column">
                    <input
                        type="text"
                        id="nameField"
                        placeholder="Name"
                        value={name}
                        ref={nameRef}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
                <div>
                    <button type="button" className="button-outline" onClick={generateNewName}>
                        Generate
                    </button>
                </div>
            </div>
            <input
                className="button-primary"
                type="submit"
                value="Save"
                disabled={nameLengthZero || nameAlreadyUsed}
            />
        </fieldset>
    </form>;
}