import type {
    IResolverObject,
    IResolvers,
} from 'graphql-tools/dist/Interfaces';
import type { Film } from './../entity/types';
import { FilmService } from '../service/film.service';
import { logger } from '../../shared';

const filmService = new FilmService();

const findFilme = (titel: string) => {
    const suchkriterium = titel === undefined ? {} : { titel };
    return filmService.find(suchkriterium);
};

interface TitelCriteria {
    titel: string;
}

interface IdCriteria {
    id: string;
}

const createFilm = (film: Film) => {
    film.datum = new Date(film.datum as string);
    return filmService.create(film);
};

const updateFilm = async (film: Film) => {
    const version = film.__v ?? 0;
    film.datum = new Date(film.datum as string);
    const filmUpdated = await filmService.update(film, version.toString());
    logger.debug(`resolvers updateFilm(): Versionsnummer: ${film.__v}`);
    return filmUpdated;
};

const deleteFilm = async (id: string) => {
    await filmService.delete(id);
};

// Queries passend zu "type Query" in typeDefs.ts
const query: IResolverObject = {
    // Filme suchen, ggf. mit Titel als Suchkriterium
    filme: (_: unknown, { titel }: TitelCriteria) => findFilme(titel),
    // Ein Film suchen mit einer bestimmten ID.
    film: (_: unknown, { id }: IdCriteria) => filmService.findById(id),
};

const mutation: IResolverObject = {
    createFilm: (_: unknown, film: Film) => createFilm(film),
    updateFilm: (_: unknown, film: Film) => updateFilm(film),
    deleteFilm: (_: unknown, { id }: IdCriteria) => deleteFilm(id),
};

export const resolvers: IResolvers = {
    Query: query,
    Mutation: mutation,
};
