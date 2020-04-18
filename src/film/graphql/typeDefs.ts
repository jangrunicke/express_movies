export const typeDefs = `
    enum Art {
        DRAMA
        KOMOEDIE
        KINDERFILM
        DOCUMENTATION
    }
    
    tpye Film {
        _id: ID!
        titel: String!
        rating: Int
        art: Art
        datum: String
        schlagwoerter: [String]
        version: Int
    }
    
    type Query {
        filme(titel: String): [Film]
        film(id: ID!): Film
    }
    
    type Mutation {
        createFilm(titel: String!, rating: Int, art: String, datum: String
            schlagwoerter: [String]): Film
        updateFilm(_id: ID, titel: String!, rating: Int, art: String, datum: String
            schlagwoerter: [String], version: Int): Film
        deleteFilm(id: ID!): Boolean
    }
`;
