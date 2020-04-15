import JSON5 from 'json5';
import { serverConfig } from './server';

// sicherstellen, dass lokal .env eingelesen wurde
console.assert(serverConfig.host);

// -----------------------------------------------------------------------------
// D e f a u l t w e r t e
// -----------------------------------------------------------------------------
const replicaSet = 'replicaSet';

// -----------------------------------------------------------------------------
// U m g e b u n g s v a r i a b l e
// -----------------------------------------------------------------------------
const {
    DB_NAME,
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_POPULATE,
    MOCK_DB,
} = process.env; // eslint-disable-line no-process-env

// -----------------------------------------------------------------------------
// E i n s t e l l u n g e n
// -----------------------------------------------------------------------------
const dbName = DB_NAME ?? 'acme';
const atlas = DB_HOST?.endsWith('mongodb.net') ?? false;
const host = DB_HOST ?? 'localhost';
const user = DB_USER ?? 'admin';
const pass = DB_PASS ?? 'p';
const dbPopulate = DB_POPULATE !== undefined;

let url: string;
let adminUrl: string;

if (atlas) {
    // https://docs.mongodb.com/manual/reference/connection-string
    // Default:
    //  retryWrites=true            ab MongoDB-Treiber 4.2
    //  readPreference=primary
    // "mongodb+srv://" statt "mongodb://" fuer eine "DNS seedlist" z.B. bei "Replica Set"
    // https://docs.mongodb.com/manual/reference/write-concern
    url = `mongodb+srv://${user}:${pass}@${host}/${dbName}?replicaSet=Cluster0-shard-0&w=majority`;
    adminUrl = `mongodb+srv://${user}:${pass}@${host}/admin?w=majority`;
} else {
    url = `mongodb://${user}:${pass}@${host}/${dbName}?replicaSet=${replicaSet}&authSource=admin`;
    adminUrl = `mongodb://${user}:${pass}@${host}/admin`;
}

const mockDB = MOCK_DB === 'true';

export const dbConfig = {
    atlas,
    url,
    adminUrl,
    dbName,
    host,
    user,
    pass,
    dbPopulate,
    mockDB,
};

const dbConfigLog = {
    atlas,
    url: url.replace(/\/\/.*:/u, '//USERNAME:@').replace(/:[^:]*@/u, ':***@'),
    adminUrl: adminUrl
        .replace(/\/\/.*:/u, '//USERNAME:@')
        .replace(/:[^:]*@/u, ':***@'),
    dbName,
    host,
    dbPopulate,
    mockDB,
};

console.info(`dbConfig: ${JSON5.stringify(dbConfigLog)}`);
