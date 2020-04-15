import { GridFSBucket, MongoClient } from 'mongodb';
import { Readable } from 'stream';
import { closeMongoDBClient } from './mongoDB';
import { logger } from '../../shared';

/* eslint-disable max-params */
export const saveReadable = (
    readable: Readable,
    bucket: GridFSBucket,
    filename: string,
    metadata: any,
    client: MongoClient,
) => {
    readable
        .pipe(bucket.openUploadStream(filename, metadata))
        .on('finish', () => {
            logger.debug('gridfs.saveReadable(): UploadStream ist beendet');
            closeMongoDBClient(client);
        });
};
