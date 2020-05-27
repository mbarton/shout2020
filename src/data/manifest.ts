import { v4 as uuidv4 } from 'uuid';
import * as GMap from "./gmap";
import * as LWWR from "./lwwr";

export type Item = {
    name: LWWR.LWWR<string>,
    createdAt: LWWR.LWWR<number>,
    createdBy: LWWR.LWWR<string>
};

export type State = GMap.GMap<Item>;

type SetStateAction = { type: 'set_state', state: State };
type CreateAction = { type: 'create', id: string, item: Item }; 

export type Action =
    SetStateAction |
    CreateAction;

export function create(name: string, localUserId: string): CreateAction {
    return {
        type: 'create',
        id: uuidv4(),
        item: {
            name: LWWR.create(localUserId, name, Date.now()),
            createdAt: LWWR.create(localUserId, Date.now(), Date.now()),
            createdBy: LWWR.create(localUserId, localUserId, Date.now())
        }
    }
}

export function merge(left: State, right: State): State {
    return GMap.merge(left, right,
        (left: Item, right: Item) => {
            return {
                name: LWWR.merge(left.name, right.name),
                createdAt: LWWR.merge(left.createdAt, right.createdAt),
                createdBy: LWWR.merge(left.createdBy, right.createdBy)
            }
        });
}

export function reducer(state: State, action: Action): State {
    switch(action.type) {
        case 'set_state':
            return merge(state, action.state);

        case 'create':
            return merge(state, {
                [action.id]: action.item
            });
    }
}

export const base: State = {};