/* globals describe, expect, test, beforeAll, afterAll */

import { FilmArt } from '../../../src/film/entity';
import type { Film } from '../../../src/film/entity/types';
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
const neuerFilm: Film = {
    titel: 'Test',
    rating: 1,
    art: FilmArt.DRAMA,
    datum: '2016-02-28',
    schlagwoerter: ['KINDERFILM'],
    regisseur: { nachname: 'Test', vorname: 'Theo' },
};

const neuesFilmInvalid: object = {
    titel: 'Blabla',
    rating: -1,
    art: 'KOMOEDIE',
    datum: '2016-02-01',
    regisseur: { nachname: 'Test', vorname: 'Theo' },
    schlagwoerter: [],
};

const neuerFilmTitelExistiert: Film = {
    titel: 'Sieben',
    rating: 1,
    art: FilmArt.DRAMA,
    datum: '2016-02-28',
    regisseur: { nachname: 'Test', vorname: 'Theo' },
    schlagwoerter: ['DISNEY'],
};

const loginDaten: object = {
    username: 'admin',
    password: 'p',
};

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
const path = PATHS.filme;
const loginPath = PATHS.login;
let server: Server;

// Test-Suite
describe('POST /filme', () => {
    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => (server = await createTestserver()));

    afterAll(async () => {
        server.close();
        // "open handle error (TCPSERVERWRAP)" bei Supertest mit Jest vermeiden
        // https://github.com/visionmedia/supertest/issues/520
        await new Promise(resolve => setTimeout(() => resolve(), 1000)); // eslint-disable-line @typescript-eslint/no-magic-numbers
    });

    test('Neuer Film', async () => {
        // given: neuesBuch
        let response = await request(server)
            .post(`${loginPath}`)
            .set('Content-type', 'application/x-www-form-urlencoded')
            .send(loginDaten)
            .trustLocalhost();
        const { token } = response.body;

        // when
        response = await request(server)
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(neuerFilm)
            .trustLocalhost();
        
        // then
        const { status, header } = response;
        expect(status).to.be.equal(HttpStatus.CREATED);

        const { location } = header;
        expect(location).to.exist;
        expect(typeof location === 'string').to.be.true;
        expect(location).not.to.be.empty;

        // UUID: Muster von HEX-Ziffern
        const indexLastSlash: number = location.lastIndexOf('/');
        const idStr = location.slice(indexLastSlash + 1);

        expect(idStr).to.match(
            // eslint-disable-next-line max-len
            /[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-[\dA-Fa-f]{12}/u,
        );
    });

    test('Neuer Film mit ungueltigen Daten', async () => {
        // given: neuerFilmInvalid
        let response = await request(server)
            .post(`${loginPath}`)
            .set('Content-type', 'application/x-www-form-urlencoded')
            .send(loginDaten)
            .trustLocalhost();
        const { token } = response.body;

        // when
        response = await request(server)
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(neuesFilmInvalid)
            .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.BAD_REQUEST);
        const { rating } = body;

        expect(rating).to.endWith('eine gueltige Bewertung.');      
    });

    test('Neuer Film, aber der Titel existiert bereits', async () => {
        // given: neuerFilmTitelExistiert
        let response = await request(server)
            .post(`${loginPath}`)
            .set('Content-type', 'application/x-www-form-urlencoded')
            .send(loginDaten)
            .trustLocalhost();
        const { token } = response.body;

        // when
        response = await request(server)
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(neuerFilmTitelExistiert)
            .trustLocalhost();

        // then
        const { status, text } = response;
        expect(status).to.be.equal(HttpStatus.BAD_REQUEST);
        expect(text).has.string('Titel');
    });

    test('Neuer Film, aber mit falschem Token', async () =>  {
        // given: neuerFilm
        const falscherToken = 'x';

        // when
        const response = await request(server)
            .post(path)
            .set('Authorization', `Bearer ${falscherToken}`)
            .send(neuerFilm)
            .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.UNAUTHORIZED);
        expect(Object.entries(body)).to.be.empty;
    });

    test.todo('Test mit abgelaufenem Token');
});
