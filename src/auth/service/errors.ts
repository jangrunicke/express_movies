/* eslint-disable max-classes-per-file */
import { logger } from '../../shared';

export class AuthorizationInvalidError extends Error {
    name = 'AuthorizationInvalidError';

    constructor(public readonly message: string) {
        super();
        logger.silly('AuthorizationInvalidError.constructor()');
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export class TokenInvalidError extends Error {
    name = 'TokenInvalidError';

    constructor(public readonly message: string) {
        super();
        logger.silly('TokenInvalidError.constructor()');
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}
