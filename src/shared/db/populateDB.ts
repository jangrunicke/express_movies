import { Collection, Db, GridFSBucket, MongoClient } from 'mongodb';
import { dbConfig, serverConfig } from './../config';
import { connectMongoDB } from './mongoDB';
import { createReadStream } from 'fs';
import { filme } from './filme';
import { logger } from '../logger';
import { resolve } from 'path';
import { saveReadable } from './gridfs';

const createIndex = async (collection: Collection) => {
    // http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#createIndex
    // Beachte: bei createIndexes() gelten die Optionen fuer alle Indexe gelten
    let index = await collection.createIndex('titel', { unique: true });
    logger.warn(`Der Index ${index} wurde angelegt.`);
    index = await collection.createIndex('schlagwoerter', { sparse: true });
    logger.warn(`Der Index ${index} wurde angelegt.`);
};

const uploadBinary = (db: Db, client: MongoClient) => {
    // Kein File-Upload in die Cloud
    if (serverConfig.cloud !== undefined) {
        logger.info('uploadBinary(): Keine Binaerdateien mit der Cloud');
        return;
    }

    const filenameBinary = 'image.png';
    const contentType = 'image/png';

    const filename = '00000000-0000-0000-0000-000000000001';
    logger.warn(`uploadBinary(): "${filename}" wird eingelesen.`);

    // https://mongodb.github.io/node-mongodb-native/3.5/tutorials/gridfs/streaming
    const bucket = new GridFSBucket(db);
    bucket.drop();

    const readable = createReadStream(resolve(__dirname, filenameBinary));
    const metadata = { contentType };
    saveReadable(readable, bucket, filename, { metadata }, client);
};

export const populateDB = async (dev?: boolean) => {
    let devMode = dev;
    if (devMode === undefined) {
        devMode = dbConfig.dbPopulate;
    }
    logger.info(`populateDB(): devMode=${devMode}`);

    if (!devMode) {
        return;
    }

    const { db, client } = await connectMongoDB();

    const collectionName = 'Film';
    let dropped = false;
    try {
        dropped = await db.dropCollection(collectionName);
    } catch (err) {
        // Falls der Error *NICHT* durch eine fehlende Collection verursacht wurde
        if (err.name !== 'MongoError') {
            logger.error(`Fehler beim Neuladen der DB ${db.databaseName}`);
            return;
        }
    }
    if (dropped) {
        logger.warn(`Die Collection "${collectionName}" wurde geloescht.`);
    }

    const collection = await db.createCollection(collectionName);
    logger.warn(
        `Die Collection "${collection.collectionName}" wurde erstellt.`,
    );

    const result = await collection.insertMany(filme);
    logger.warn(`${result.insertedCount} Datensaetze wurdem eingefügt`);

    await createIndex(collection);
    uploadBinary(db, client);
};
