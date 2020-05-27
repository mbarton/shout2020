// https://jaredforsyth.com/posts/hybrid-logical-clocks/

export type HLC = {
    ts: number,
    count: number,
    node: string
}

export function create(node: string, ts: number): HLC {
    return {
        ts,
        count: 0,
        node
    };
}

export function inc(local: HLC, now: number): HLC {
    if(now > local.ts) {
        return { ts: now, count: 0, node: local.node };
    }

    return { ...local, count: local.count + 1 };
}

export function recv(local: HLC, remote: HLC, now: number): HLC {
    if(now > local.ts && now > remote.ts) {
        return { ...local, ts: now, count: 0 };
    }

    if(local.ts === remote.ts) {
        return { ...local, count: Math.max(local.count, remote.count) + 1 };
    } else if(local.ts > remote.ts) {
        return { ...local, count: local.count + 1 };
    } else {
        return { ...local, ts: remote.ts, count: remote.count + 1 };
    }
}

export function cmp(left: HLC, right: HLC): number {
    if(left.ts === right.ts) {
        if(left.count === right.count) {
            if(left.node === right.node) {
              return 0;
            }

            return left.node < right.node ? -1 : 1;
        }

        return left.count - right.count;
    }

    return left.ts - right.ts;
}

export function gt(left: HLC, right: HLC): boolean {
    return cmp(left, right) > 0;
}