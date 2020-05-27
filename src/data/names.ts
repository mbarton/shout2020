import { uniqueNamesGenerator, adjectives, animals, colors, countries } from 'unique-names-generator';

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