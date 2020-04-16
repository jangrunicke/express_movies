/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import dotenv from 'dotenv';
const result = dotenv.config();
if (result.error !== undefined) {
    throw result.error;
}
console.info(`.env: ${JSON.stringify(result.parsed)}`);

import { dbConfig } from '../src/shared/config/db';
import { exec } from 'shelljs';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(0));
const values = argv._;

const { atlas, adminUrl, mockDB } = dbConfig;

const mongostart = () => {
    if (atlas || mockDB) {
        console.warn('Atlas ist konfiguriert!');
        return;
    }

    const configFile = 'C:/Zimmermann/mongodb/config.yml';
    exec(`mongod --version && mongod --config=${configFile}`);
};

const mongostop = () => {
    if (atlas || mockDB) {
        console.warn('Atlas ist konfiguriert!');
        return;
    }
    exec(`mongo --eval "db.shutdownServer({force: true})" ${adminUrl}`);
};

switch (values[2]) {
    case 'stop':
        mongostop();
        break;
    case 'express':

    case 'start':
    default:
        mongostart();
}
