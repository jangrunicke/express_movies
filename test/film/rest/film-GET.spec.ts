/* globals describe, expect, test, beforeAll, afterAll */

// REST-Schnittstelle testen: Supertest oder (primitiver!) request

// import dotenv from 'dotenv';
// const result = dotenv.config();
// if (result.error !== undefined) {
//     throw result.error;
// }
// console.info(`.env: ${JSON.stringify(result.parsed)}`);
// const dev = result?.parsed?.NODE_ENV?.startsWith('dev') ?? false;

import { HttpStatus } from '../../../src/shared';
import { PATHS } from '../../../src/app';
// import type { FilmData } from '../../../src/film/entity/types';
import type { Server } from 'http';
import chai from 'chai';
import { createTestserver } from '../../createTestserver';
import request from 'supertest';
import { FilmData } from '../../../src/film/entity/film';

const { expect } = chai;

// startsWith(), endWith()
import('chai-string').then(chaiString => chai.use(chaiString.default));

// -----------------------------------------------------------------------------
// T e s t s e r v e r   m i t   H T T P   u n d   R a n d o m   P o r t
// -----------------------------------------------------------------------------
const path = PATHS.filme;
let server: Server;

// Test-Suite
describe('GET /filme', () => {
    beforeAll(async () => (server = await createTestserver()));

    afterAll(async () => {
        server.close();
        await new Promise(resolve => setTimeout(() => resolve(), 1000)); // eslint-disable-line @typescript-eslint/no-magic-numbers
    });

    test('Alle Filme', async () => {
        // when
        const response = await request(server).get(path).trustLocalhost();

        // then
        const { status, header, body } = response;
        expect(status).to.be.equal(HttpStatus.OK);
        expect(header['content-type']).to.match(/json/iu);
        // JSON-Array mit min. 1 JSON-Objekt
        expect(body).not.to.be.empty;
    });

    test('Filme mit einem Titel, der ein "e" enthaelt', async () => {
        // given
        const teilTitel = 'e';

        // when
        const response = await request(server)
            .get(`${path}?titel=${teilTitel}`)
            .trustLocalhost();
        
        // then
        const { status, header, body } = response;
        expect(status).to.be.equal(HttpStatus.OK);
        expect(header['content-type']).to.match(/json/iu);
        // response.body ist ein JSON-Array mit mind. 1 JSON-Objekt
        expect(body).not.to.be.empty;

        // Jeder Film hat einen Titel mit dem Teilstring 'e'
        body.map((film: FilmData) => film.titel).forEach((titel: string) =>
            expect(titel).to.have.string(teilTitel),
            );
    });

    test('Keine Filme mit einem Titel, der "XX" enthaelt', async () => {
        // given
        const teilTitel = 'XX';

        // when
        const response = await request(server)
            .get(`${path}?titel=${teilTitel}`)
            .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.NOT_FOUND);
        // Leeres Rumpf
        expect(Object.entries(body)).to.be.empty;
    });

    test('Mind. 1 Film mit dem Schlagwort "verbrechen"', async () => {
        // given
        const schlagwort = 'verbrechen';

        // when
        const response = await request(server)
            .get(`${path}?${schlagwort}=true`)
            .trustLocalhost();

        // then
        const { status, header, body } = response;
        expect(status).to.be.equal(HttpStatus.OK);
        expect(header['content-type']).to.match(/json/iu);
        // JSON-Array mit mind. 1 JSON-Objekt
        expect(body).not.to.be.empty;

        // Jeder Film hat im Array das Schlagwort "verbrechen"
        body.map(
            (film: FilmData) => film.schlagwoerter,
        ).forEach((s: Array<string>) =>
            expect(s).to.include(schlagwort.toUpperCase()),
        );
    });

    test('Keine Filme mit dem Schlagwort "tatort"', async () => {
        // given
        const schlagwort = 'tatort';

        // when
        const response =  await request(server)
            .get(`${path}?${schlagwort}=true`)
            .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.NOT_FOUND);
        // Leerer Rumpf
        expect(Object.entries(body)).to.be.empty;
    });
});