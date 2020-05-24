import { v4 as uuidv4 } from 'uuid';
import { uniqueNamesGenerator, adjectives, animals, colors, countries } from 'unique-names-generator';

export type ShoutUser = {
    id: string,
    iteration: number,
    name: string
}

export type StartupData = {
    localUser: ShoutUser,
    sessionId: string,
    seeds: string[]
}

export type ShoutSummary = {
    id: string,
    name: string,
    createdTime: number,
    createdBy: ShoutUser
}

export type Shout = ShoutSummary & {
    // TODO
}

export function generateUsername(): string {
    return uniqueNamesGenerator({
        length: 2,
        separator: ' ',
        style: 'capital',
        dictionaries: [adjectives, animals]
    });
}

export function generateShoutName(): string {
    return uniqueNamesGenerator({
        length: 2,
        separator: ' ',
        style: 'capital',
        dictionaries: [colors, countries]
    }); 
}

export function saveLocalUser(user: ShoutUser) {
    localStorage.setItem('shout-local-user', JSON.stringify({ user }));
}

export function fetchLocalUser(): ShoutUser {
    const json = localStorage.getItem('shout-local-user');

    if(json === null) {
        const user = {
            id: uuidv4(),
            iteration: 0,
            name: generateUsername()
        };

        saveLocalUser(user);
        return user;
    }

    return JSON.parse(json).user;
}

let startUpDataCache: StartupData | undefined = undefined;

export function fetchStartupData(): StartupData {
    if(startUpDataCache) {
        return startUpDataCache;
    }

    const userFromDB = fetchLocalUser();

    // Increase the iteration. This allows the same user to have multiple tabs open
    const localUser = { ...userFromDB, iteration: userFromDB.iteration + 1 };
    saveLocalUser(localUser);

    // eslint-disable-next-line no-restricted-globals
    const search = new URLSearchParams(location.search);
    const peerParam = search.get("seed");

    const seeds = peerParam === null ? [] : peerParam.split(",").map(s => s.trim());
    
    const sessionId = `${localUser.id}_${localUser.iteration}`;

    const ret = { localUser, seeds, sessionId };
    startUpDataCache = ret;
    
    return ret;
}

export function saveShoutSummaries(summaries: ShoutSummary[]) {
    localStorage.setItem('shout-summaries', JSON.stringify({ summaries }));
}

export function fetchShoutSummaries(): ShoutSummary[] {
    const json = localStorage.getItem('shout-summaries');

    if(json === null) {
        saveShoutSummaries([]);
        return [];
    }

    return JSON.parse(json).summaries;
}

export function saveShout(shout: Shout) {
    localStorage.setItem(`shout-by-id-${shout.id}`, JSON.stringify({ shout }));
}

export function deleteShout(id: string) {
    localStorage.removeItem(`shout-by-id-${id}`);
}

export function fetchShoutById(id: string): Shout | undefined {
    const json = localStorage.getItem(`shout-by-id-${id}`);

    if(json === null) {
        return undefined;
    }

    return JSON.parse(json).shout;
}