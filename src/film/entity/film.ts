export enum FilmArt {
    DRAMA = 'DRAMA',
    KOMOEDIE = 'KOMOEDIE',
    DOKUMENTATION = 'DOKUMENTATION',
    KINDERFILM = 'KINDERFILM',
}

// gemeinsames Basis-Interface fuer REST und GraphQL
export interface Film {
    _id?: string;
    __v?: number;
    titel: string;
    rating?: number;
    art?: FilmArt | '';
    regisseur: any;
    datum?: string | Date;
    schlagwoerter?: Array<string>;
}

export interface FilmData extends Film {
    createdAt?: number;
    updatedAt?: number;
    _links?: {
        self?: { href: string };
        list?: { href: string };
        add?: { href: string };
        update?: { href: string };
        remove?: { href: string };
    };
}
