import { dbConfig, logger } from '../../shared';
import JSON5 from 'json5';
import { MongoClient } from 'mongodb';

export const connectMongoDB = async () => {
    const { dbName, url } = dbConfig;
    logger.debug(`mongodb.connectMongoDB(): url=${url}`);
    // TODO Conneciton Pooling
    const client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    await client.connect();
    logger.debug('mongodb.connectMongoDB(): DB-Client geoeffnet');
    const db = client.db(dbName);

    return { db, client };
};

export const closeMongoDBClient = (client: MongoClient) => {
    client
        .close()
        .then(() =>
            logger.debug(
                'mongodb.closeDbClient(): DB-Client wurde geschlossen',
            ),
        )
        .catch(err =>
            logger.error(`mongodb.closeDbClient(): ${JSON5.stringify(err)}`),
        );
};
