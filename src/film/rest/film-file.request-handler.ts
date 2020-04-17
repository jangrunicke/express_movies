import {
    FileNotFoundError,
    FilmNotExistsError,
    MultipleFilesError,
} from '../service/errors';
import { HttpStatus, logger } from '../../shared';
import type { Request, Response } from 'express';
import { FilmFileService } from '../service';
import JSON5 from 'json5';

// export bei async und await:
// https://blogs.msdn.microsoft.com/typescript/2015/11/30/announcing-typescript-1-7
// http://tc39.github.io/ecmascript-export
// https://nemethgergely.com/async-function-best-practices#Using-async-functions-with-express

export class FilmFileRequestHandler {
    private readonly service = new FilmFileService();

    upload(req: Request, res: Response) {
        const { id } = req.params;
        logger.debug(`FilmFileRequestHandler.uploadBinary(): id=${id}`);

        // https://jsao.io/2019/06/uploading-and-downloading-files-buffering-in-node-js

        const data: Array<any> = [];
        let totalBytesInBuffer = 0;
        req.on('data', (chunk: Array<any>) => {
            const { length } = chunk;
            logger.debug(
                `FilmFileRequestHandler.uploadBinary(): data ${length}`,
            );
            data.push(chunk);
            totalBytesInBuffer += length;
        })
            .on('aborted', () =>
                logger.debug('FilmFileRequestHandler.uploadBinary(): aborted'),
            )
            .on('end', () => {
                logger.debug(
                    `FilmFileRequestHandler.uploadBinary(): end ${totalBytesInBuffer}`,
                );
                const buffer = Buffer.concat(data, totalBytesInBuffer);
                this.save(req, id, buffer)
                    .then(() => res.sendStatus(HttpStatus.NO_CONTENT))
                    .catch(err =>
                        logger.error(
                            `Fehler beim Abspeichern: ${JSON5.stringify(err)}`,
                        ),
                    );
            });
    }

    async download(req: Request, res: Response) {
        const { id } = req.params;
        logger.debug(`FilmFileRequestHandler.downloadBinary(): ${id}`);
        if (id === undefined) {
            res.status(HttpStatus.BAD_REQUEST).send('Kein Film-Id');
            return;
        }

        let file;
        try {
            file = await this.service.find(id);
        } catch (err) {
            this.handleDownloadError(err, res);
            return;
        }

        const { readStream, contentType } = file;
        res.contentType(contentType);
        // https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93
        readStream.pipe(res);
    }

    private async save(req: Request, id: any, buffer: Buffer) {
        const contentType = req.headers['content-type'];
        await this.service.save(id, buffer, contentType);
    }

    private handleDownloadError(err: Error, res: Response) {
        if (err instanceof FilmNotExistsError) {
            logger.debug(err.message);
            res.status(HttpStatus.NOT_FOUND).send(err.message);
            return;
        }

        if (err instanceof FileNotFoundError) {
            logger.error(err.message);
            res.status(HttpStatus.NOT_FOUND).send(err.message);
            return;
        }

        if (err instanceof MultipleFilesError) {
            logger.error(err.message);
            res.status(HttpStatus.INTERNAL_ERROR).send(err.message);
            return;
        }

        logger.error(
            `FilmFileRequestHandler.handleDownloadError(): error=${JSON5.stringify(
                err,
            )}`,
        );
        res.sendStatus(HttpStatus.INTERNAL_ERROR);
    }
}
