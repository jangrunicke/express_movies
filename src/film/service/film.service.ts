import { Document, startSession } from 'mongoose';
import type { Film, FilmData } from '../entity/types';
import { FilmModel, validateFilm } from '../entity';
import {
    FilmNotExistsError,
    TitelExistsError,
    ValidationError,
    VersionInvalidError,
} from './errors';
import { dbConfig, logger } from '../../shared';
import { FilmServiceMock } from './mock';
import JSON5 from 'json5';
import { v4 as uuid } from 'uuid';

const { mockDB } = dbConfig;

// API-Dokumentation zu mongoose:
// http://mongoosejs.com/docs/api.html
// https://github.com/Automattic/mongoose/issues/3949

/* eslint-disable require-await, no-null/no-null */
export class FilmService {
    private readonly mock: FilmServiceMock | undefined;

    constructor() {
        if (mockDB) {
            this.mock = new FilmServiceMock();
        }
    }

    // Status eines Promise:
    // Pending: das Resultat gibt es noch nicht, weil die asynchrone Operation,
    //          die das Resultat liefert, noch nicht abgeschlossen ist
    // Fulfilled: die asynchrone Operation ist abgeschlossen und
    //            das Promise-Objekt hat einen Wert
    // Rejected: die asynchrone Operation ist fehlgeschlagen and das
    //           Promise-Objekt wird nicht den Status "fulfilled" erreichen.
    //           Stattdessen ist im Promise-Objekt die Fehlerursache enthalten.

    async findById(id: string) {
        if (this.mock !== undefined) {
            return this.mock.findById(id);
        }
        logger.debug(`FilmService.findById(): id= ${id}`);

        // ein Buch zur gegebenen ID asynchron suchen
        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        // null falls nicht gefunden
        // lean() liefert ein "Plain JavaScript Object" statt ein Mongoose Document
        return FilmModel.findById(id)
            .lean<FilmData>()
            .then(film => film ?? undefined);
    }

    async find(query?: any) {
        if (this.mock !== undefined) {
            return this.mock.find(query);
        }

        logger.debug(`FilmService.find(): query=${JSON5.stringify(query)}`);
        const tmpQuery = FilmModel.find().lean<FilmData>();

        // alle Buecher asynchron suchen u. aufsteigend nach titel sortieren
        // nach _id sortieren: Timestamp des INSERTs (Basis: Sek)
        // https://docs.mongodb.org/manual/reference/object-id
        if (query === undefined || Object.entries(query).length === 0) {
            // lean() liefert ein "Plain JavaScript Object"
            return tmpQuery.sort('title').lean<FilmData>();
        }

        const { titel, verbrechen, psycho, disney, umwelt, ...dbQuery } = query;

        // Filme zur Query(= JSON-Objekt durch Express) asynchron suchen
        if (titel !== undefined) {
            // Titel in der Query: Teilstring des Titels,
            // d.h. "LIKE" als regulaerer Ausdruck
            // 'i': keine Unterscheidung zw. Gross- u. Kleinschreibung
            // NICHT /.../, weil das Muster variabel sein muss
            // CAVEAT: KEINE SEHR LANGEN Strings wg. regulaerem Ausdruck
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (titel.length < 20) {
                dbQuery.titel = new RegExp(titel, 'iu'); // eslint-disable-line security/detect-non-literal-regexp
            }
        }

        // z.B. {verbrechen: true, psycho: true}
        const schlagwoerter = [];
        if (verbrechen === 'true') {
            schlagwoerter.push('VERBRECHEN');
        }
        if (psycho === 'true') {
            schlagwoerter.push('PSYCHO');
        }
        if (disney === 'true') {
            schlagwoerter.push('DISNEY');
        }
        if (umwelt === 'true') {
            schlagwoerter.push('UMWELT');
        }
        if (schlagwoerter.length === 0) {
            delete dbQuery.schlagwoerter;
        } else {
            dbQuery.schlagwoerter = schlagwoerter;
        }

        logger.debug(`FilmService.find(): dbQuery=${JSON5.stringify(dbQuery)}`);

        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        // leeres Array, falls nichts gefunden wird
        // lean() liefert ein "Plain JavaScript Object" statt ein Mongoose Document
        return FilmModel.find(dbQuery).lean<FilmData>();
        // Buch.findOne(query), falls das Suchkriterium eindeutig ist
        // bei findOne(query) wird null zurueckgeliefert, falls nichts gefunden
    }

    // eslint-disable-next-line max-statements,max-lines-per-function
    async create(filmData: Film) {
        if (this.mock !== undefined) {
            return this.mock.create(filmData);
        }

        // Der gegebene Film innerhabl von save() asynchron neu anlegen:
        // Promise.reject(err) bei Verletzung von DB-Constraints, z.B. unique

        const film = new FilmModel(filmData);
        const errorMsg = validateFilm(film);
        if (errorMsg !== undefined) {
            logger.debug(
                `BuchService.create(): Validation Message: ${JSON5.stringify(
                    errorMsg,
                )}`,
            );
            // Promise<void> als Rueckgabewert
            // Eine von Error abgeleitete Klasse hat die Property "message"
            return Promise.reject(new ValidationError(errorMsg));
        }

        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        const { titel } = filmData;
        const tmp = await FilmModel.findOne({ titel }).lean<FilmData>();
        if (tmp !== null) {
            // Promise<void> als Rueckgabewert
            // Eine von Error abgeleitete Klasse hat die Property "message"
            return Promise.reject(
                new TitelExistsError(`Der Titel "${titel}" existiert bereits`),
            );
        }

        film._id = uuid(); // eslint-disable-line require-atomic-updates

        let filmSaved!: Document;
        const session = await startSession();
        try {
            await session.withTransaction(async () => {
                filmSaved = await film.save();
            });
        } catch (err) {
            logger.error(
                `FilmService.create(): Die Transaktion wurde abgebrochen: ${JSON5.stringify(
                    err,
                )}`,
            );
            // TODO Weitere Fehlerbehandlung bei Rollback
        } finally {
            session.endSession();
        }
        const filmDataSaved: FilmData = filmSaved.toObject();
        logger.debug(
            `FilmService.create(): filmDataSaved=${JSON5.stringify(
                filmDataSaved,
            )}`,
        );

        // TODO Email senden

        return filmDataSaved;
    }

    // eslint-disable-next-line max-lines-per-function,max-statements
    async update(filmData: Film, versionStr: string) {
        if (this.mock !== undefined) {
            return this.mock.update(filmData);
        }

        if (versionStr === undefined) {
            return Promise.reject(
                new VersionInvalidError('Die Versionnummer fehlt'),
            );
        }
        const version = Number.parseInt(versionStr, 10);
        if (Number.isNaN(version)) {
            return Promise.reject(
                new VersionInvalidError('Die Versionsnummer ist ungueltig'),
            );
        }
        logger.debug(`FilmService.update(): version=${version}`);

        logger.debug(`BuchService.update(): buch=${JSON5.stringify(filmData)}`);
        const film = new FilmModel(filmData);
        const err = validateFilm(film);
        if (err !== undefined) {
            logger.debug(
                `FilmService.update(): Validation Message: ${JSON5.stringify(
                    err,
                )}`,
            );
            // Promise<void> als Rueckgabewert
            return Promise.reject(new ValidationError(err));
        }

        const { titel }: { titel: string } = filmData;
        const tmp = await FilmModel.findOne({ titel }).lean<FilmData>();
        if (tmp !== null && tmp._id !== film._id) {
            return Promise.reject(
                new TitelExistsError(
                    `Der Titel "${titel}" existiert bereits bei ${
                        tmp._id as string
                    }.`,
                ),
            );
        }

        const filmDb = await FilmModel.findById(film._id).lean<FilmData>();
        if (filmDb === null) {
            return Promise.reject(
                new FilmNotExistsError('Kein Film mit der ID'),
            );
        }
        const versionDb = filmDb?.__v ?? 0;
        if (version < versionDb) {
            return Promise.reject(
                new VersionInvalidError(
                    `Die Versionsnummer ${version} ist nicht aktuell`,
                ),
            );
        }

        // findByIdAndReplace ersetzt ein Document mit ggf. weniger Properties
        const result = await FilmModel.findByIdAndUpdate(film._id, film).lean<
            FilmData
        >();
        if (result === null) {
            return Promise.reject(
                new VersionInvalidError(
                    `Kein Film mit ID ${
                        film._id as string
                    } und Version ${version}`,
                ),
            );
        }

        if (result.__v !== undefined) {
            result.__v++;
        }
        logger.debug(`FilmService.update(): result=${JSON5.stringify(result)}`);

        // Weitere Methoden von mongoose zum Aktualisieren:
        //    Buch.findOneAndUpdate(update)
        //    buch.update(bedingung)
        return Promise.resolve(result);
    }

    async delete(id: string) {
        if (this.mock !== undefined) {
            return this.mock.remove(id);
        }
        logger.debug(`FilmService.delete(): id=${id}`);

        // Der Film zur gegebenen ID asynchron loeschen
        const { deletedCount } = await FilmModel.deleteOne({ _id: id });
        logger.debug(`FilmService.delete(): deletedCount=${deletedCount}`);
        return deletedCount !== undefined;

        // Weitere Methoden von mongoose, um zu loeschen:
        //  Buch.findByIdAndRemove(id)
        //  Buch.findOneAndRemove(bedingung)
    }
}
