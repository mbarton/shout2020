import * as LWWR from "./lwwr";
import * as GMap from "./gmap";
import { generateUsername } from "./names";

type UserState = { name: LWWR.LWWR<string | undefined> };
export type State = GMap.GMap<UserState>;

export function merge(left: State, right: State): State {
    return GMap.merge(left, right, (left: UserState, right: UserState) => {
        return { name: LWWR.merge(left.name, right.name) }
    });
}

export type SetStateAction = { type: 'set_state', state: State };
export type SetUserAction = { type: 'set_user', id: string, user: UserState };

export type Action =
    SetStateAction |
    SetUserAction;

export function reducer(state: State, action: Action): State {
    switch(action.type) {
        case 'set_state':
            return merge(state, action.state);
        
        case 'set_user':
            return merge(state, {
                [action.id]: action.user
            });
    }
}

export const base: State = {};

export function addSeeds(seeds: string[], state: State, localUserId: string): State {
    return seeds.reduce((acc, seed) => {
        if(seed in acc) {
            return acc;
        }

        
        return { ...acc, [seed]: {
            name: LWWR.create(localUserId, undefined, Date.now())
        } };
    }, state);
}

export function setUser(id: string, localUserId: string, name?: string): SetUserAction {
    return {
        type: 'set_user',
        id,
        user: {
            name: LWWR.create(localUserId, name, Date.now())
        }
    };
}

export function buildInitialState(localUserId: string, seeds: string[], storedState: State): State {
    let actions = [];

    if(!(localUserId in storedState)) {
        const username = generateUsername();
        
        console.log("Generating username for brand new user");
        console.log(`Welcome to the show ${username} [${localUserId}]`);

        actions.push(setUser(localUserId, localUserId, generateUsername()));
    }

    for(const seed of seeds) {
        if(!(seed in storedState)) {
            // TODO MRB: either we prefer a value to undefined or we pass the full LWWR
            // state through to the seeds otherwise this will overwrite everyone's usernames
            actions.push(setUser(seed, localUserId, undefined));
        }
    }

    return actions.reduce((state, action) =>
        reducer(state, action)
    , storedState);
}