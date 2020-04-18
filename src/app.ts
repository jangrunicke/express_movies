import {
    MAX_REQUESTS_PER_WINDOW,
    WINDOW_SIZE,
    internalError,
    logRequestHeader,
    notFound,
    // notYetImplemented,
    responseTimeFn,
    serverConfig,
    validateContentType,
    validateUUID,
} from './shared';
import {
    create,
    deleteFn,
    download,
    find,
    findById,
    update,
    upload,
} from './film/rest';
import { isAdmin, isAdminMitarbeiter, login, validateJwt } from './auth/rest';
// Einlesen von application/json im Request-Rumpf
// Fuer multimediale Daten (Videos, Bilder, Audios): raw-body
import { json, urlencoded } from 'body-parser';
import type { Options } from 'express-rate-limit';
import bearerToken from 'express-bearer-token';
import compression from 'compression';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { helmetHandlers } from './security';
// import { join } from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { resolvers } from './film/graphql/resolvers';
import responseTime from 'response-time';
import { typeDefs } from './film/graphql/typeDefs';

const { Router } = express;

const rateLimitOptions: Options = {
    // z.B. 15min als Zeitfenster (Ms = Millisekunden)
    windowMs: WINDOW_SIZE,
    // z.B. max 100 requests/IP in einem Zeitfenster
    max: MAX_REQUESTS_PER_WINDOW,
};
const limiter = rateLimit(rateLimitOptions);

// hochgeladene Dateien als Buffer im Hauptspeicher halten
// const storage = multer.memoryStorage()
// const uploader = multer({storage})

export const PATHS = {
    filme: 'filme',
    login: 'login',
    graphql: '/api',
    html: '/html',
};

// Express als Middleware = anwendungsneutrale Dienste-/Zwischenschicht,
// d.h. Vermittler zwischen Request und Response.
// Alternativen zu Express (hat die hoechsten Download-Zahlen):
// * Hapi: von Walmart
// * Restify
// * Koa: von den urspruengl. Express-Entwicklern
// * Sails: baut auf Express auf, Waterline als ORM
// * Kraken: baut auf Express auf
//           von PayPal
//           verwaltet von der Node.js Foundation
//           genutzt von Oracle mit Oracle JET

class App {
    // Das App- bzw. Express-Objekt ist zustaendig fuer:
    //  * Konfiguration der Middleware
    //  * Routing
    // http://expressjs.com/en/api.html
    readonly app = express();

    constructor() {
        this.config();
        this.routes();
    }

    private config() {
        // eslint-disable-next-line no-process-env
        if (serverConfig.dev) {
            // Logging der eingehenden Request in der Console
            this.app.use(
                morgan('dev'),
                // Protokollierung der Response Time
                responseTime(responseTimeFn),
                // Protokollierung des eingehenden Request-Headers
                logRequestHeader,
            );
        }

        this.app.use(
            bearerToken(),

            // Spread Operator ab ES 2015
            ...helmetHandlers,

            // falls CORS fuer die Webanwendung notwendig ist:
            // corsHandler,

            // GZIP-Komprimierung implizit unterstuetzt durch Chrome, FF, ...
            //   Accept-Encoding: gzip
            // Alternative: z.B. nginx als Proxy-Server und dort komprimieren
            compression(),
            limiter,
        );
    }

    private routes() {
        this.filmeRoutes();
        this.loginRoutes();
        this.filmGraphqlRoutes();

        this.app.get('*', notFound);
        this.app.use(internalError);
    }

    private filmeRoutes() {
        // eslint-disable-line max-lines-per-function
        // vgl: Spring WebFlux.fn
        // http://expressjs.com/en/api.html
        // Beispiele fuer "Middleware" bei Express:
        //  * Authentifizierung und Autorisierung
        //  * Rumpf bei POST- und PUT-Requests einlesen
        //  * Logging, z.B. von Requests
        //  * Aufruf der naechsten Middleware-Funktion
        // d.h. "Middleware" ist eine Variation der Patterns
        //  * Filter (Interceptoren) und
        //  * Chain of Responsibility
        // Ausblick zu Express 5 (z.Zt. noch als Alpha-Release):
        //  * Router als eigenes Modul https://github.com/pillarjs/router
        //  * Zusaetzliche Syntax beim Routing
        //  * Promises statt Callbacks
        //  * Verbesserte Handhabung von Query Strings
        //  * noch keine .d.ts-Datei
        const router = Router(); // eslint-disable-line new-cap
        router
            .route('/')
            .get(find)
            .post(
                validateJwt,
                validateContentType,
                isAdminMitarbeiter,
                json(),
                create,
            );

        const idParam = 'id';
        router
            .param(idParam, validateUUID)
            .get(`/:${idParam}`, findById)
            .put(
                `/:${idParam}`,
                validateJwt,
                validateContentType,
                isAdminMitarbeiter,
                json(),
                update,
            )
            .delete(`/:${idParam}`, validateJwt, isAdmin, deleteFn)
            .put(`/:${idParam}/file`, validateJwt, isAdminMitarbeiter, upload)
            .get(`/:${idParam}/file`, download);

        this.app.use(PATHS.filme, router);
    }

    private loginRoutes() {
        const router = Router(); // eslint-disable-line new-cap
        router.route('/').post(
            urlencoded({
                extended: false,
                type: 'application/x-www-form-urlencoded',
            }),
            login,
        );
        this.app.use(PATHS.login, router);
    }

    private filmGraphqlRoutes() {
        const schema = makeExecutableSchema({
            typeDefs,
            resolvers,
        });
        const middleware = graphqlHTTP({
            schema,
            // "A graphical interactive in-browser GraphQL IDE"
            graphiql: true,
        });
        this.app.use(PATHS.graphql, middleware);
    }
}
export const { app } = new App();
