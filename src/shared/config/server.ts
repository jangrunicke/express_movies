import JSON5 from 'json5';
import dotenv from 'dotenv';
import { hostname } from 'os';
import ip from 'ip';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export enum Cloud {
    HEROKU = 'heroku',
    OPENSHIFT = 'openshift',
}

interface ServerConfig {
    dev: boolean;
    production: boolean;
    host: string;
    port: number;
    ip: string;
    cloud: Cloud | undefined;
    key?: Buffer;
    cert?: Buffer;
}

// .env nur einlesen, falls nicht in der Cloud
dotenv.config();

const computername = hostname();
const ipAddress = ip.address();

// hostname() ist bei
//  * Heroku:       eine UUID
//  * OpenShift:    <Projektname_aus_package.json>-<Build-Nr>-<random-alphanumeric-5stellig>
let cloud: Cloud | undefined;
const herokuRegexp = /[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-[\dA-Fa-f]{12}/u; // eslint-disable-line max-len
const openshiftRegexp = /beispiel-\d+-\w{5}/u;
if (herokuRegexp.test(computername)) {
    cloud = Cloud.HEROKU;
} else if (openshiftRegexp.test(computername)) {
    cloud = Cloud.OPENSHIFT;
}

const { NODE_ENV } = process.env; // eslint-disable-line no-process-env
const production = NODE_ENV === 'production';

let dev = false;
if (
    NODE_ENV !== undefined &&
    (NODE_ENV.startsWith('dev') || NODE_ENV.startsWith('test'))
) {
    dev = true;
}

const { SERVER_PORT } = process.env; // eslint-disable-line no-process-env
let port = NaN;
if (SERVER_PORT !== undefined) {
    port = parseInt(SERVER_PORT, 10);
}
if (isNaN(port)) {
    // SERVER_PORT ist zwar gesetz, aber keine Zahl
    if (cloud === undefined || cloud === Cloud.OPENSHIFT) {
        port = 8443; // eslint-disable-line @typescript-eslint/no-magic-numbers
    } else {
        port = parseInt(process.env.PORT as string, 10); // eslint-disable-line no-process-env
    }
}

export const serverConfig: ServerConfig = {
    dev,
    production,
    host: computername,
    ip: ipAddress,
    port,
    cloud,

    key:
        cloud === undefined
            ? readFileSync(resolve(__dirname, 'key.pem'))
            : undefined,
    cert:
        cloud === undefined
            ? readFileSync(resolve(__dirname, 'certificate.cer'))
            : undefined,
};

const logServerConfig = {
    dev,
    production,
    host: computername,
    port,
    ip: ipAddress,
    cloud,
};
console.info(`serverConfig: ${JSON5.stringify(logServerConfig)}`);
