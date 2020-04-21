/* globals describe, expect, test, beforeAll, afterAll */

import { FilmArt } from '../../../src/film/entity';
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
const geanderterFilm: object = {
    titel: 'Geaendert',
    rating: 1,
    art: FilmArt.DOKUMENTATION,
    datum: '2020-01-03',
    regisseur: { nachname: 'Hans', vorname: 'Peter'},
    schlagwoerter: ['UMWELT'],
};
const idVorhanden = '00000000-0000-0000-0000-000000000003';

const geaenderterFilmIdNichtVorhanden: object = {
    titel: 'Nichtvorhanden',
    rating: 1,
    art: FilmArt.KOMOEDIE,
    datum: '2020-01-01',
    regisseur: { nachname: 'Nicht', vorname: 'Gibts' },
    schlagwoerter: ['DISNEY'],
}
const idNichtVorhanden = '00000000-0000-0000-0000-000000000999';

const geaenderterFilmInvalid: object = {
    titel: 'Alpha',
    rating: -1,
    art: 'UNSICHTBAR',
    datum: '2016-02-01',
    regisseur: { nachname: 'Hans', vorname: 'Peter'},
    schlagwoerter: [],
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
describe('PUT /filme:id', () => {
    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => (server = await createTestserver()));

    afterAll(async () => {
        server.close();
        // "open handle error (TCPSERVERWRAP)" bei Supertest mit Jest vermeiden
        // https://github.com/visionmedia/supertest/issues/520
        await new Promise(resolve => setTimeout(() => resolve(), 1000)); // eslint-disable-line @typescript-eslint/no-magic-numbers
    });

    test('Vorhandenen Film aendern', async () => {
        // given: geanderter Film
        let response = await request(server)
            .post(`${loginPath}`)
            .set('Content-type', 'application/x-www-form-urlencoded')
            .send(loginDaten)
            .trustLocalhost();
        const { token } = response.body;

        // when
        response = await request(server)
            .put(`${path}/${idVorhanden}`)
            .set('Authorization', `Bearer ${token}`)
            .set('If-Match', '"0"')
            .send(geanderterFilm)
            .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.NO_CONTENT);
        expect(Object.entries(body)).to.be.empty;
    });

    test('Nicht-vorhandener Film aendern', async () => {
        // given: geanderterFilmIdNichtVorhanden
            // given: geaendertesBuchIdNichtVorhanden
        let response = await request(server)
            .post(`${loginPath}`)
            .set('Content-type', 'application/x-www-form-urlencoded')
            .send(loginDaten)
            .trustLocalhost();
        const { token } = response.body;
    
        // when
        response = await request(server)
            .put(`${path}/${idNichtVorhanden}`)
            .set('Authorization', `Bearer ${token}`)
            .set('If-Match', '"0"')
            .send(geaenderterFilmIdNichtVorhanden)
            .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.PRECONDITION_FAILED);
        expect(Object.entries(body)).to.be.empty;
        });

    test('Vorhandenen Film aender, aber mit ungueltigen Daten', async () => {
        // given: geaenderterFilmInvalid
        let response = await request(server)
            .post(`${loginPath}`)
            .set('Content-type', 'application/x-www-form-urlencoded')
            .send(loginDaten)
            .trustLocalhost();
        const { token } = response.body;

        // when
        response = await request(server)
            .put(`${path}/${idVorhanden}`)
            .set('Authorization', `Bearer ${token}`)
            .set('If-Match', '"0"')
            .send(geaenderterFilmInvalid)
            .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.BAD_REQUEST);
        const { art, rating,} = body;

        expect(art).to.be.equal(
            'Die Art des Films ist nicht bekannt.',
        );
        expect(rating).to.endWith('eine gueltige Bewertung.');
    });

    test('Vorhandener Film aender, aber ohne Versionsnummer', async () => {
        // given: geaenderterFilmInvalid
        let response = await request(server)
            .post(`${loginPath}`)
            .set('Content-type', 'application/x-www-form-urlencoded')
            .send(loginDaten)
            .trustLocalhost();
        const { token } = response.body;

        // when
        response = await request(server)
            .put(`${path}/${idVorhanden}`)
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'text/plain')
            .send(geanderterFilm)
            .trustLocalhost();
        
        // then
        const { status, text } = response;
        expect(status).to.be.equal(HttpStatus.PRECONDITION_REQUIRED);
        expect(text).to.be.equal('Versionsnummer fehlt');
    });

    test('Vorhandenen Film aendern, aber mit alter Versionsnumer', async () => {
        // given: geaenderterFilmInvalid
        let response = await request(server)
            .post(`${loginPath}`)
            .set('Content-type', 'application/x-www-form-urlencoded')
            .send(loginDaten)
            .trustLocalhost();
        const { token } = response.body;

        // when
        response = await request(server)
            .put(`${path}/${idVorhanden}`)
            .set('Authorization', `Bearer ${token}`)
            .set('If-Match', '"-1"')
            .set('Accept', 'text/plain')
            .send(geanderterFilm)
            .trustLocalhost();

        // then
        const { status, text } = response;
        expect(status).to.be.equal(HttpStatus.PRECONDITION_FAILED);
        expect(text).to.have.string('Die Versionsnummer');
    });

    test('Vorhandener Film aendern, aber ohne Token', async () => {
        // given: geaenderterFilm

        // when
        const response = await request(server)
            .put(`${path}/${idVorhanden}`)
            .set('If-Match', '"0"')
            .send(geanderterFilm)
            .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.UNAUTHORIZED);
        expect(Object.entries(body)).to.be.empty;
    });

    test('Vorhandenen Film aendern, aber mit falschem Token', async () => {
        // given: geaenderterFilm
        const falscherToken = 'x';

        // when
        const response = await request(server)
            .put(`${path}/${idVorhanden}`)
            .set('Authorization', `Bearer ${falscherToken}`)
            .set('If-Match', '"0"')
            .send(geanderterFilm)
            .trustLocalhost();

        // then
        const { status, body } = response;
        expect(status).to.be.equal(HttpStatus.UNAUTHORIZED);
        expect(Object.entries(body)).to.be.empty;
    });
});
