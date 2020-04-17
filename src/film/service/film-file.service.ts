import {
    FileNotFoundError,
    FilmNotExistsError,
    MultipleFilesError,
} from './errors';
import { GridFSBucket, ObjectId } from 'mongodb';
import { closeMongoDBClient, connectMongoDB, saveReadable } from '../../shared';
import { FilmModel } from '../entity';
import JSON5 from 'json5';
import { Readable } from 'stream';
import { logger } from '../../shared';

/* eslint-disable no-null/no-null */
export class FilmFileService {
    async save(id: string, buffer: Buffer, contentType: string | undefined) {
        logger.debug(
            `FilmFileService.save(): id = ${id}, contentType=${contentType}`,
        );

        // Gibt es ein Film zur angegebenen ID?
        const film = await FilmModel.findById(id);
        if (film === null) {
            return false;
        }

        const { db, client } = await connectMongoDB();
        const bucket = new GridFSBucket(db);
        await this.deleteFiles(id, bucket);

        const readable = new Readable();
        // _read ist erforderlich, kann die leere Funktion sein
        readable._read = () => {}; // eslint-disable-line no-underscore-dangle,@typescript-eslint/unbound-method,no-empty-function,@typescript-eslint/no-empty-function
        readable.push(buffer);
        readable.push(null);

        const metadata = { contentType };
        saveReadable(readable, bucket, id, { metadata }, client);
        return true;
    }

    async find(filename: string) {
        logger.debug(`FilmFileServie.findFile(): filename=${filename}`);
        await this.checkFilename(filename);

        const { db, client } = await connectMongoDB();

        const bucket = new GridFSBucket(db);
        const contentType = await this.getContentType(filename, bucket);

        const readStream = bucket
            .openDownloadStreamByName(filename)
            .on('end', () => closeMongoDBClient(client));
        return { readStream, contentType };
    }

    private async deleteFiles(filename: string, bucket: GridFSBucket) {
        logger.debug(`FilmFileService.deleteFiles(): filename=${filename}`);
        const idObjects: Array<{ _id: ObjectId }> = await bucket
            .find({ filename })
            .project({ _id: 1 })
            .toArray();
        const ids = idObjects.map(obj => obj._id);
        logger.debug(
            `FilmFileService.deleteFiles(): ids=${JSON5.stringify(ids)}`,
        );
        ids.forEach(fileId =>
            bucket.delete(fileId, () =>
                logger.debug(
                    `FilmFileService.deleteFiles(): geloeschte ID=${JSON5.stringify(
                        fileId,
                    )}`,
                ),
            ),
        );
    }

    private async checkFilename(filename: string) {
        logger.debug(`FilmFileService.checkFilename(): filename=${filename}`);

        // Gibt es ein Film mit dem gegebenen "filename" als ID?
        const film = await FilmModel.findById(filename);
        if (film === null) {
            throw new FilmNotExistsError(
                `Es gibt kein Film mit der Id ${filename}`,
            );
        }

        logger.debug(
            `FilmFileService.checkFilename(): buch=${JSON5.stringify(film)}`,
        );
    }

    private async getContentType(filename: string, bucket: GridFSBucket) {
        let files;
        try {
            files = await bucket.find({ filename }).toArray();
        } catch (err) {
            logger.error(`${JSON5.stringify(err)}`);
            files = [];
        }

        switch (files.length) {
            case 0:
                throw new FileNotFoundError(
                    `FilmFileService.getContentType(): Es gibt kein File mit Name ${filename}`,
                );
            case 1: {
                const [file] = files;
                const { contentType }: { contentType: string } = file.metadata;
                logger.debug(
                    `FilmFileService.getContentType(): contentType=${contentType}`,
                );
                return contentType;
            }
            default:
                throw new MultipleFilesError(
                    `FilmFileService.getContentType(): Es gibt mehr als ein File mit Name ${filename}`,
                );
        }
    }
}
