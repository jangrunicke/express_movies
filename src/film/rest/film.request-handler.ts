/* eslint-disable max-lines, no-underscore-dangle */

import {
    FilmNotExistsError,
    FilmService,
    TitelExistsError,
    ValidationError,
    VersionInvalidError,
} from '../service';
import { HttpStatus, getBaseUri, logger, mimeConfig } from '../../shared';
import type { Request, Response } from 'express';
import type { FilmData } from '../entity/types';
import JSON5 from 'json5';

// export bei async und await:
// https://blogs.msdn.microsoft.com/typescript/2015/11/30/announcing-typescript-1-7
// http://tc39.github.io/ecmascript-export
// https://nemethgergely.com/async-function-best-practices#Using-async-functions-with-express

export class FilmRequestHandler {
    // Dependency Injection ggf. durch
    // * Awilix https://github.com/jeffijoe/awilix
    // * InversifyJS https://github.com/inversify/InversifyJS
    // * Node Dependency Injection https://github.com/zazoomauro/node-dependency-injection
    // * BottleJS https://github.com/young-steveo/bottlejs
    private readonly service = new FilmService();

    // vgl Kotlin: Schluesselwort "suspend"
    async findById(req: Request, res: Response) {
        const versionHeader = req.header('If-None-Match');
        logger.debug(
            `FilmRequestandler.findById(): versionHeader=${versionHeader}`,
        );
        const { id } = req.params;
        logger.debug(`FilmRequestHandler.findById(): id=${id}`);

        let film: FilmData | undefined;
        try {
            // vgl. Kotlin: Aufruf einer suspend-Function
            film = await this.service.findById(id);
        } catch (err) {
            logger.error(
                `FilmRequestHandler.findById(): error=${JSON5.stringify(err)}`,
            );
            res.sendStatus(HttpStatus.INTERNAL_ERROR);
            return;
        }

        if (film === undefined) {
            logger.debug('FilmRequestHandler.findById(): status=NOT_FOUND');
            res.sendStatus(HttpStatus.NOT_FOUND);
            return;
        }

        logger.debug(
            `FilmRequestHanlder.findById(): film=${JSON5.stringify(film)}`,
        );
        const versionDb = film.__v;
        if (versionHeader === `"${versionDb}"`) {
            res.sendStatus(HttpStatus.NOT_MODIFIED);
            return;
        }
        logger.debug(`FilmRequestHandler.findById(): VersionDb=${versionDb}`);
        res.header('ETag', `"${versionDb}"`);

        const baseUri = getBaseUri(req);
        // HAETEOAS: Atom-Links
        film._links = {
            self: { href: `${baseUri}/${id}` },
            list: { href: `${baseUri}` },
            add: { href: `${baseUri}` },
            update: { href: `${baseUri}/${id}` },
            remove: { href: `${baseUri}/${id}` },
        };
        res.json(film);
    }

    async find(req: Request, res: Response) {
        // z.B https://.../film?titel=Sieben
        const { query } = req;
        logger.debug(
            `FindRequestHanlder.find(): queryParams=${JSON5.stringify(query)}`,
        );

        let filme: Array<FilmData>;
        try {
            filme = await this.service.find(query);
        } catch (err) {
            logger.error(
                `FilmRequestHandler.find(): error=${JSON5.stringify(err)}`,
            );
            res.sendStatus(HttpStatus.INTERNAL_ERROR);
            return;
        }

        logger.debug(
            `FilmRequestHandler.find(): filme=${JSON5.stringify(filme)}`,
        );
        if (filme.length === 0) {
            // Alternative: https://www.npmjs.com/package/http-errors
            // Damit wird aber auch der Stacktrace zum Client
            // uebertragen, weil das resultierende Fehlerobjekt
            // von Error abgeleitet ist.
            logger.debug('FilmRequestHandler.find(): status = NOT_FOUND');
            res.sendStatus(HttpStatus.NOT_FOUND);
            return;
        }

        const baseUri = getBaseUri(req);

        // asynchrone for-of Schleife statt synchrones filme.map()
        for await (const film of filme) {
            // HATEOAS: Atom Links je film
            film._links = { self: { href: `${baseUri}/${film._id}` } };
        }

        logger.debug(
            `FilmRequestHandler.find(): filme=${JSON5.stringify(filme)}`,
        );
        res.json(filme);
    }

    async create(req: Request, res: Response) {
        const contentType = req.header(mimeConfig.contentType);
        if (
            // Optional Chaining
            contentType?.toLowerCase() !== mimeConfig.json
        ) {
            logger.debug('FilmRequestHandler.create() status=NOT_ACCEPTABLE');
            res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
            return;
        }

        const filmData = req.body;
        logger.debug(
            `FilmRequestHandler.create(): body=${JSON5.stringify(filmData)}`,
        );

        let filmSaved: FilmData;
        try {
            filmSaved = await this.service.create(filmData);
        } catch (err) {
            this.handleCreateError(err, res);
            return;
        }

        const location = `${getBaseUri(req)}/${filmSaved._id}`;
        logger.debug(`FilmRequestHandler.create(): location=${location}`);
        res.location(location);
        res.sendStatus(HttpStatus.CREATED);
    }

    // eslint-disable-next-line max-lines-per-function
    async update(req: Request, res: Response) {
        const { id } = req.params;
        logger.debug(`FilmRequestHandler.update(): id=${id}`);

        const contentType = req.header(mimeConfig.contentType);
        if (contentType?.toLowerCase() !== mimeConfig.json) {
            res.status(HttpStatus.NOT_ACCEPTABLE);
            return;
        }
        const version = this.getVersionHeader(req, res);
        if (version === undefined) {
            return;
        }

        const filmData = req.body;
        filmData._id = id;
        logger.debug(
            `FilmRequestHandler.update(): film=${JSON5.stringify(id)}`,
        );

        let result: FilmData;
        try {
            result = await this.service.update(filmData, version);
        } catch (err) {
            this.handleUpdateError(err, res);
            return;
        }

        logger.debug(
            `FilmRequestHandler.update(): result=${JSON5.stringify(result)}`,
        );
        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        logger.debug(`FilmRequestHandler.delete(): id=${id}`);

        try {
            await this.service.delete(id);
        } catch (err) {
            logger.error(
                `FilmRequestHandler.dlete(): error=${JSON5.stringify(err)}`,
            );
            res.sendStatus(HttpStatus.INTERNAL_ERROR);
            return;
        }

        logger.debug('FilmRequestHandler.delete(): NO_CONTENT');
        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    // any ist ein "universal supertype", d.h. Basisklasse wie z.B. Object bei
    // Java oder Any bei Kotlin, aber auch die Moeglichkeit, Funktionen mi
    // irgendwelchen Namen aufzurufen oder auf Properties mit irgendwelchen
    // Namen zuzugreifen
    private handleCreateError(err: any, res: Response) {
        if (err instanceof ValidationError) {
            const { name, message } = err;
            logger.debug(
                `FilmRequestHandler.handleCreateError(): err.name=${name}, message=${message}`,
            );
            res.status(HttpStatus.BAD_REQUEST)
                .set('Content-Type', 'application/json')
                .send(message);
            return;
        }

        if (err instanceof TitelExistsError) {
            const { name, message } = err;
            logger.debug(
                `FilmRequestHandler.handleCreateError(): err.name=${name}, message=${message}`,
            );
            res.status(HttpStatus.BAD_REQUEST)
                .set('Content-Type', 'text/plain')
                .send(message);
            return;
        }

        logger.error(
            `FilmRequestHandler.handleCreateError(): error=${JSON5.stringify(
                err,
            )}`,
        );
        res.sendStatus(HttpStatus.INTERNAL_ERROR);
    }

    private getVersionHeader(req: Request, res: Response) {
        const versionHeader = req.header('If-Match');
        logger.debug(
            `FilmRequestHandler.getVersionHeader() versionHeader=${versionHeader}`,
        );

        if (versionHeader === undefined) {
            const msg = 'Versionsnummer fehlt';
            logger.debug(
                `FilmRequestHanlder.getVersionHeader(): status=428, message=${msg}`,
            );
            res.status(HttpStatus.PRECONDITION_REQUIRED)
                .set('Content-Type', 'text/plain')
                .send(msg);
            return;
        }

        const { length } = versionHeader;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (length < 3) {
            const msg = `Ungueltige Versionsnummer: ${versionHeader}`;
            logger.debug(
                `FilmRequestHandler.getVersionHeader(): status=412, message=${msg}`,
            );
            res.status(HttpStatus.PRECONDITION_FAILED)
                .set('Content-Type', 'text/plain')
                .send(msg);
            return;
        }

        // slice: einschl. Start, auschl.Ende
        return versionHeader.slice(1, -1);
    }

    private handleUpdateError(err: any, res: Response) {
        if (
            err instanceof VersionInvalidError ||
            err instanceof FilmNotExistsError ||
            err instanceof TitelExistsError
        ) {
            const { name, message } = err;
            logger.debug(
                `FilmRequestHandler.handleUpdateError(): err.name=${name}, message=${message}`,
            );
            res.status(HttpStatus.PRECONDITION_FAILED)
                .set('Content-Type', 'text/plain')
                .send(message);
            return;
        }

        if (err instanceof ValidationError) {
            const { name, message } = err;
            logger.debug(
                `FilmRequestHandler.handleUpdateError(): err.name=${name}, message=${message}`,
            );
            res.status(HttpStatus.BAD_REQUEST)
                .set('Content-Type', 'application/json')
                .send(message);
            return;
        }

        logger.error(
            `FilmRequestHandler.handleUpdateError(): error=${JSON5.stringify(
                err,
            )}`,
        );
        res.sendStatus(HttpStatus.INTERNAL_ERROR);
    }
}
