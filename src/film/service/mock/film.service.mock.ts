import { film, filme } from './film';
import { Film } from '../../entity/types';
import JSON5 from 'json5';
import { logger } from '../../../shared';
import { v4 as uuid } from 'uuid';

/* eslint-disable @typescript-eslint/no-unused-vars,require-await,@typescript-eslint/require-await */
export class FilmServiceMock {
    async findById(id: string) {
        film._id = id;
        return film;
    }

    async find(_?: any) {
        return filme;
    }

    async create(filmData: Film) {
        filmData._id = uuid();
        logger.info(`Neuer Film: ${JSON5.stringify(filmData)}`);
        return filmData;
    }

    async update(filmData: Film) {
        if (filmData.__v !== undefined) {
            filmData.__v++;
        }
        logger.info(`Aktualisierter Film: ${JSON5.stringify(filmData)} `);
        return Promise.resolve(filmData);
    }

    async remove(id: string) {
        logger.info(`ID des geloeschten Filmes: ${id}`);
        return true;
    }
}
