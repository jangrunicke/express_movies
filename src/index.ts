// Stacktraces mit Beruecksichtigung der TypeScript-Dateien
// eslint-disable-next-line sort-imports
import 'source-map-support/register';

import { connectDB, logger, populateDB, serverConfig } from './shared';
import { release, type } from 'os';
import JSON5 from 'json5';
// "type-only import" ab TypeScript 3.8
import type { RequestListener } from 'http';
import type { SecureContextOptions } from 'tls';
import { app } from './app';
import { connection } from 'mongoose';
import { createServer } from 'https';
import ip from 'ip';

// Arrow Function
const disconnectDB = () => {
    connection
        .close()
        /* eslint-disable no-process-exit */
        .catch(() => process.exit(0));
};

const shutdown = () => {
    logger.info('Server wird heruntergefahren...');
    disconnectDB();
    process.exit(0);
};

// Destructuring
const { cloud, host, port } = serverConfig;
const printBanner = () => {
    const banner =
        '\n' +
        '       _                    _____   \n' +
        '      | |                  / ____|  \n' +
        '      | |   __ _   _ __   | |  __   \n' +
        '  _   | |  / _  | |  _ \\  | | |_ |  \n' +
        ' | |__| | | (_| | | | | | | |__| |  _ \n' +
        '  \\____/   \\__,_| |_| |_|  \\_____| (_)' +
        '\n';
    logger.info(banner);
    logger.info(`Node:           ${process.version}`);
    logger.info(`Betriebssystem: ${type()} ${release()}`);
    logger.info(`Rechnername:    ${host}`);
    logger.info(`IP-Adresse:     ${ip.address()}`);
    logger.info('');
    if (cloud === undefined) {
        logger.info(
            `https://${host}:${port} ist gestartet: Herunterfahren durch <Strg>C`,
        );
    } else {
        logger.info('Der Server ist gestartet: Herunterfahren durch <Strg>C');
    }
};

const startServer = () => {
    if (cloud === undefined) {
        const { cert, key } = serverConfig;
        // Shorthand Properties
        const options: SecureContextOptions = {
            key,
            cert,
            minVersion: 'TLSv1.3',
        };
        createServer(options, app as RequestListener).listen(port, printBanner);
    } else {
        app.listen(port, printBanner);
    }

    process.on('SIGINT', shutdown);

    process.once('SIGUSR2', disconnectDB);
};

// Kein "Toplevel await", weil Commonjs als Target verwendet wird
// Alternative: IIFE (= Immediately Invoked Function Expression)
// https://developer.mozilla.org/en-US/docs/Glossary/IIFE
populateDB()
    .then(connectDB)
    .then(startServer)
    .catch(err => {
        logger.error(`Fehler beim Start des Servers: ${JSON5.stringify(err)}`);
    });
