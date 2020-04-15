import type { Request } from 'express';
import { serverConfig } from './config';

export const getBaseUri = (req: Request) => {
    const { protocol, hostname, baseUrl } = req;
    return serverConfig.cloud === undefined
        ? `${protocol}://${hostname}:${serverConfig.port}${baseUrl}`
        : `${protocol}://${hostname}${baseUrl}`;
};
