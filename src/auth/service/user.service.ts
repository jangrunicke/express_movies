import JSON5 from 'json5';
import { logger } from '../../shared';
import { users } from './users';

export interface User {
    _id: string;
    username: string;
    password: string;
    email: string;
    roles?: Array<string>;
}

export class UserService {
    constructor() {
        logger.info(`UsersService: users=${JSON5.stringify(users)}`);
    }

    findByUsername(username: string) {
        return users.find((u: User) => u.username === username);
    }

    findById(id: string) {
        return users.find((u: User) => u._id === id);
    }

    findByEmail(email: string) {
        return users.find((u: User) => u.email === email);
    }
}
