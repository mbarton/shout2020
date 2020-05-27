import * as LWWR from "./lwwr";
import * as GMap from "./gmap";

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

        // TODO MRB: either we prefer a value to undefined or we pass the full LWWR
        // state through to the seeds otherwise this will overwrite everyone's usernames
        return { ...acc, [seed]: {
            name: LWWR.create(localUserId, undefined, Date.now())
        } };
    }, state);
}

export function setUser(id: string, name: string, localUserId: string): SetUserAction {
    return {
        type: 'set_user',
        id,
        user: {
            name: LWWR.create(localUserId, name, Date.now())
        }
    };
}