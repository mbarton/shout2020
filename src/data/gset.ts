import uniq from "lodash.uniq";

export type GSet<T> = T[];

export function create<T>(elems: T[]): GSet<T> {
    return [...elems];
}

export function merge<T>(left: GSet<T>, right: GSet<T>): GSet<T> {
    return uniq([...left, ...right]);
}