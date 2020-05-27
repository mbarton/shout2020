import React, { useState, useCallback } from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import * as Manifest from './data/manifest';
import { generateShoutName } from './data/names';

type Props = RouteComponentProps & {
    manifest: Manifest.State,
    createShout: (name: string) => void
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

        props.createShout(name);
        navigate('/');
    }

    const nameLengthZero = name.trim().length === 0;
    const nameAlreadyUsed = Object.values(props.manifest).find(shout => shout.name.value === name) !== undefined;

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