/* globals describe, expect, test, beforeAll, afterAll */

// REST-Schnittstelle testen: Supertest oder (primitiver!) request

import { HttpStatus } from '../../../src/shared';
import { PATHS } from '../../../src/app';
import type { Server } from 'http';
import chai from 'chai';
import { createTestserver } from '../../createTestserver';
import request from 'supertest';

const { expect } = chai;

// startWith(), endWith()
import('chai-string').then(chaiString => chai.use(chaiString.default));

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idVorhanden = '00000000-0000-0000-0000-000000000001';
const idNichtVorhanden = '00000000-0000-0000-0000-000000000999';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
const path = PATHS.filme;
let server: Server;

// Test-Suite
describe('GET /filme/:id', () => {
    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => (server = await createTestserver()));

    afterAll(async () => {
        server.close();
        // "open handle error (TCPSERVERWRAP)" bei Supertest mit Jest vermeiden
        // https://github.com/visionmedia/supertest/issues/520
        await new Promise(resolve => setTimeout(() => resolve(), 1000)); // eslint-disable-line @typescript-eslint/no-magic-numbers
    });

    test('Film zu vorhandener ID', async () => {
        // when
        const response = await request(server)
            .get(`${path}/${idVorhanden}`)
            .trustLocalhost();

        // then
        const { status, header, body } = response;
        expect(status).to.be.equal(HttpStatus.OK);
        expect(header['content-type']).to.match(/json/iu);
        // response.body enthaelt ein JSON-Objekt mit Atom-Links
        expect(body._links.self.href).to.endWith(`/${idVorhanden}`);
    });

    test('Kein Film zu nicht-vorhandener ID', async () => {
        // when
        const response = await request(server)
            .get(`${path}/${idNichtVorhanden}`)
            .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.NOT_FOUND);
        // Leerer Rumpf
        // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
        expect(Object.entries(body)).to.be.empty;
    });

    test('Film zu vorhandener ID mit ETag', async () => {
        // when
        const response = await request(server)
        .get(`${path}/${idVorhanden}`)
        .set('If-None-Match', '"0"')
        .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.NOT_MODIFIED);
        expect(Object.entries(body)).to.be.empty;
    });
});

