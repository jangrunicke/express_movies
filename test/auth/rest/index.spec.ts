/* globals describe, expect, test, beforeAll, afterAll */

import { HttpStatus } from '../../../src/shared';
import { PATHS } from '../../../src/app';
import type { Server } from 'http';
import { createTestserver } from '../../createTestserver';
import { expect } from 'chai';
import request from 'supertest';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const passwordKorrekt: object = {
    username: 'admin',
    password: 'p',
};

// const passwordFalsch: object = {
//     username: 'admin',
//     password: 'FALSCH',
// };

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------

let server: Server;
const loginPath = PATHS.login;

// Test-Suite
describe('REST-Schnittstellen /login', () => {
    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => (server = await createTestserver()));

    afterAll(async () => {
        server.close();
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // eslint-disable-line @typescript-eslint/no-magic-numbers
    });

    test('Login mit korrektem Passwort', async() => {
        const response = await request(server)
            .post(`${loginPath}`)
            .set('Content-type', 'application/x-www-form-urlencoded')
            .send(passwordKorrekt)
            .trustLocalhost();

        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.OK);
        expect(body.token as string).to.match(/.+\..+\..+/u);
    });
});
