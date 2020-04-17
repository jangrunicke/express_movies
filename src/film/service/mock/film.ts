import { FilmArt } from './../../entity';
import type { FilmData } from './../../entity/types';

export const film: FilmData = {
    _id: '00000000-0000-0000-0000-000000000001',
    titel: 'Sieben',
    rating: 9,
    art: FilmArt.DRAMA,
    regisseur: {
        vorname: 'David',
        nachame: 'Fincher',
    },
    datum: new Date('1995-11-23'),
    schlagwoerter: ['VERBRECHEN'],
    __v: 0,
    createdAt: 0,
    updatedAt: 0,
};

export const filme: Array<FilmData> = [
    film,
    {
        _id: '00000000-0000-0000-0000-000000000002',
        titel: 'Schweigen der Laemmer',
        rating: 8,
        art: FilmArt.DRAMA,
        regisseur: {
            vorname: 'Jonathan',
            nachame: 'Demme',
        },
        datum: new Date('1991-04-11'),
        schlagwoerter: ['VERBRECHEN', 'PSYCHO'],
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
    },
];
