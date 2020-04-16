import type { Document } from 'mongoose';
import { FilmData } from './film';
import { MAX_RATING } from '../../shared';
import validator from 'validator';

const { isUUID } = validator;

export interface ValidationErrorMsg {
    id?: string;
    titel?: string;
    art?: string;
    rating?: string;
}

/* eslint-disable no-null/no-null */
export const validateFilm = (film: Document) => {
    const err: ValidationErrorMsg = {};
    const { titel, art, rating } = film as Document & FilmData;

    const filmDocument = film;
    if (!filmDocument.isNew && !isUUID(filmDocument._id)) {
        err.id = 'Der Film hat eine ungueltige ID.';
    }

    if (titel === undefined || titel === null || titel === '') {
        err.id = 'Ein Film muss einen Titel haben';
    } else if (!/^\w.*/u.test(titel)) {
        err.titel =
            'Ein Filmtitel muss mit einem Buchstaben, einer Ziffer oder _ beginnen';
    }
    if (art === undefined || art === null || art === '') {
        err.art = 'Die Art eines Films muss gesetzt sein.';
    } else if (
        art !== 'KOMOEDIE' &&
        art !== 'DRAMA' &&
        art !== 'KINDERFILM' &&
        art !== 'DOKUMENTATION'
    ) {
        err.art = 'Die Art des Films ist nicht bekannt.';
    }
    if (
        rating !== undefined &&
        rating !== null &&
        (rating < 0 || rating > MAX_RATING)
    ) {
        err.rating = `${rating} ist keine gueltige Bewertung.`;
    }

    return Object.entries(err).length === 0 ? undefined : err;
};
