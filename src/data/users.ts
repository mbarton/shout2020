import * as LWWR from "./lwwr";
import * as GMap from "./gmap";

type UserState = { name: LWWR.LWWR<string | undefined> };
export type State = GMap.GMap<UserState>;

export function merge(left: State, right: State): State {
    return GMap.merge(left, right, (left: UserState, right: UserState) => {
        return { name: LWWR.merge(left.name, right.name) }
    });
}

export type Action =
    { type: 'set_state', state: State };

export function reducer(state: State, action: Action): State {
    switch(action.type) {
        case 'set_state':
            return merge(state, action.state);
    }
}

export const base: State = {};

export function addSeeds(seeds: string[], state: State): State {
    return seeds.reduce((acc, seed) => {
        if(seed in acc) {
            return acc;
        }

        return { ...acc, [seed]: {} };
    }, state);
}

export function addUser(id: string, name: string, state: State, localUserId: string): State {
    const newState: State = {
        [id]: {
            name: LWWR.create(localUserId, name, Date.now())
        }
    }

    return merge(state, newState);
}