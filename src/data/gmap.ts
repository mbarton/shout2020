export type GMap<T> = {
    [key: string]: T
}

export function merge<T>(left: GMap<T>, right: GMap<T>, mergeValues: (left: T, right: T) => T) {
    return Object.entries(right).reduce((acc, [id, value]) => {
        if(id in acc) {
            return { ...acc, [id]: mergeValues(acc[id], value) };
        }

        return { ...acc, [id]: value };
    }, left);
}