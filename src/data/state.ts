import { v4 as uuidv4 } from 'uuid';

import * as Manifest from "./manifest";
import * as Users from './users';
import { useReducer } from 'react';

export type Identity = {
    id: string
    iteration: number
}

export type ShoutState = {
    identity: Identity
    users: Users.State,
    manifest: Manifest.State
}

export type ShoutAction =
    { type: 'user_action', action: Users.Action } |
    { type: 'manifest_action', action: Manifest.Action };

function base(): ShoutState {
    return {
        identity: {
            id: uuidv4(),
            iteration: 0
        },
        users: Users.base,
        manifest: Manifest.base
    }
}

export function saveLocal(state: ShoutState) {
    const json = JSON.stringify(state);
    localStorage.setItem('shout-db-v1', json);
}

export function loadLocal(): ShoutState {
    // eslint-disable-next-line no-restricted-globals
    const search = new URLSearchParams(location.search);

    const seedParam = search.get("seed");
    const seeds = seedParam === null ? [] : seedParam.split(",").map(s => s.trim());

    const json = localStorage.getItem('shout-db-v1');
    const storedState: ShoutState = json ? JSON.parse(json) : base();

    const initialState: ShoutState = {
        ...storedState,
        identity: {
            id: storedState.identity.id,
            // Increase the iteration. This allows the same user to have multiple tabs open
            iteration: storedState.identity.iteration + 1
        },
        users: Users.buildInitialState(storedState.identity.id, seeds, storedState.users)
    };

    saveLocal(initialState);
    return initialState;
}

function _reducer(state: ShoutState, action: ShoutAction): ShoutState {
    switch(action.type) {
        case 'user_action':
            return { ...state, users: Users.reducer(state.users, action.action) };

        case 'manifest_action':
            return { ...state, manifest: Manifest.reducer(state.manifest, action.action) };
    }
}

function reducer(state: ShoutState, action: ShoutAction): ShoutState {
    const ret = _reducer(state, action);
    saveLocal(ret);

    return ret;
}

export function useShoutState(): [ShoutState, React.Dispatch<ShoutAction>] {
    const [state, dispatch] = useReducer(reducer, undefined, loadLocal); 

    function wrapDispatch(action: ShoutAction) {
        // TODO MRB: send down peer connections
        dispatch(action);
    }

    return [state, wrapDispatch];
}