import { connectDB, logger, populateDB, serverConfig } from '../src/shared';
import type { RequestListener } from 'http';
import type { SecureContextOptions } from 'tls';
import type { Server } from 'http';
import { app } from '../src/app';
import { createServer } from 'https';

// -----------------------------------------------------------------------------
// T e s t s e r v e r   m i t   H T T P S   u n d   R a n d o m   P o r t
// -----------------------------------------------------------------------------
const { host, dev } = serverConfig;
let server: Server;

export const createTestserver =  async () => {
    await populateDB(dev);
    await connectDB();

    const { cert, key } = serverConfig;
    // Shorthand Properties
    const options: SecureContextOptions = { key, cert, minVersion: 'TLSv1.3' };
    server = createServer(options, app as RequestListener)
        //random port
        .listen(() => {
            logger.info(`Node ${process.version}`);
            const address = server.address();
            if (address !== null && typeof address !== 'string') {
                logger.info(
                    `Testserver ist gestartet: https://${host}:${address.port}`,
                );
            }
            server.emit('testServerStarted');
        });
    return server;
};
