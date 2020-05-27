import * as HLC from "./hlc";

export type LWWR<T> = {
    value: T,
    ts: HLC.HLC
}

export function create<T>(node: string, value: T, ts: number): LWWR<T> {
    return {
        value,
        ts: HLC.create(node, ts)
    };
}

export function merge<T>(left: LWWR<T>, right: LWWR<T>): LWWR<T>{
    if(HLC.gt(left.ts, right.ts)) {
        return left;
    }

    return right;
}