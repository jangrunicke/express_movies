/* eslint-disable max-classes-per-file */

import type { ValidationErrorMsg } from '../entity/types';
import { logger } from '../../shared';

export class ValidationError extends Error {
    readonly name = 'ValidationError';
    readonly message!: string;
    // readonly code = 4711

    constructor(msg: ValidationErrorMsg) {
        super();
        // *NICHT* JSON5, damit der Client einen regulaeren JSON-Parser nutzen kann
        this.message = JSON.stringify(msg);
        logger.debug(`ValidationError.constructor(): ${this.message}`);
    }
}

export class TitelExistsError extends Error {
    readonly name = 'TitelExistsError';

    constructor(public readonly message: string) {
        super();
        logger.debug(`TitelExistsError.constructor(): ${message}`);
    }
}

export class VersionInvalidError extends Error {
    readonly name = 'VersionInvalidError';

    constructor(public readonly message: string) {
        super();
        logger.debug(`VersionInvalidError.constructor(): ${message}`);
    }
}

export class FilmNotExistsError extends Error {
    readonly name = 'FilmNotExistsError';

    constructor(public readonly message: string) {
        super();
        logger.debug(`FilmNotExitsError.constructor(): ${message}`);
    }
}

export class FileNotFoundError extends Error {
    readonly name = 'FileNotFoundError';

    constructor(public readonly message: string) {
        super();
        logger.debug(`FileNotFoundError.constructor(): ${message}`);
    }
}

export class MultipleFilesError extends Error {
    readonly name = 'MultipleFilesError';

    constructor(public readonly message: string) {
        super();
        logger.debug(`MultipleFilesError.constructor(): ${message}`);
    }
}
