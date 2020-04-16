import { Schema, model } from 'mongoose';
import { autoIndex, optimistic } from '../../shared';

// Eine Collection in MongoDB besteht aus Dokumenten im BSON-Format

// Mongoose ist von Valeri Karpov, der auch den Begriff "MEAN-Stack" gepraegt hat:
// http://thecodebarbarian.com/2013/04/29//easy-web-prototyping-with-mongodb-and-nodejs
// Ein Schema in Mongoose definiert die Struktur und Methoden fuer die
// Dokumente in einer Collection.
// Ein Property im Schema definiert eine Property fuer jedes Dokument.
// Ein Schematyp (String, Number, Boolean, Date, Array, ObjectId) legt den Typ
// der Property fest.
// Objection.js ist ein alternatives Werkzeug für ORM:
// http://vincit.github.io/objection.js

export const filmSchema = new Schema(
    {
        // MongoDB erstellt implizit einen Index fuer _id
        _id: { type: String },
        titel: { type: String, required: true, unique: true },
        rating: { type: Number, min: 0, max: 5 },
        art: {
            type: String,
            enum: ['DRAMA', 'KOMÖDIE', 'DOKUMENTATION', 'KINDERFILM']
        },
        regisseur: Schema.Types.Mixed,
        datum: Date,
        schlagwoerter: { type: [String], sparse: true },
    },
    {
        toJSON: { getters: true, virtuals: false },
        timestamps: true,
        autoIndex,
    },
);

// Optimistische Synchronisation durch dsa Feld __v fuer die Versionsnummer
filmSchema.plugin(optimistic);

// Methoden zum Schema hinzufuegen, damit sie spaeter beim Model (s.u.)
// verfuegbar sind, was aber bei buch.check() zu eines TS-Syntaxfehler fuehrt:
// schema.methods.check = () => {...}
// schema.statics.findByTitel =
//     (titel: string, cb: Function) =>
//         return this.find({titel: titel}, cb)

// Ein Model ist ein uebersetztes Schema und stellt die CRUD-Operationen fuer
// die Dokumente bereit, d.h. das Pattern "Active Record" wird realisiert.
// Name des Models = Name der Collection
export const FilmModel = model('Film', filmSchema);
