import type { User } from './user.service';

export const users: Array<User> = [
    {
        _id: '20000000-0000-0000-0000-000000000001',
        username: 'admin',
        password:
            '$2b$12$jC0vLwqFtvikW9hrKL4RZ.ZMeaW5r/jYrNkm.ub23bMWL/mE2O20O',
        email: 'admin@acme.com',
        roles: ['admin', 'mitarbeiter', 'abteilungsleiter', 'kunde'],
    },
    {
        _id: '20000000-0000-0000-0000-000000000002',
        username: 'adriana.alpha',
        password:
            '$2b$12$jC0vLwqFtvikW9hrKL4RZ.ZMeaW5r/jYrNkm.ub23bMWL/mE2O20O',
        email: 'adriana.alpha@acme.com',
        roles: ['admin', 'mitarbeiter', 'kunde'],
    },
    {
        _id: '20000000-0000-0000-0000-000000000003',
        username: 'alfred.alpha',
        password:
            '$2b$12$jC0vLwqFtvikW9hrKL4RZ.ZMeaW5r/jYrNkm.ub23bMWL/mE2O20O',
        email: 'alfred.alpha@acme.com',
        roles: ['mitarbeiter', 'kunde'],
    },
    {
        _id: '20000000-0000-0000-0000-000000000004',
        username: 'anton.alpha',
        password:
            '$2b$12$jC0vLwqFtvikW9hrKL4RZ.ZMeaW5r/jYrNkm.ub23bMWL/mE2O20O',
        email: 'anton.alpha@acme.com',
        roles: ['mitarbeiter', 'kunde'],
    },
    {
        _id: '20000000-0000-0000-0000-000000000005',
        username: 'dirk.delta',
        password:
            '$2b$12$jC0vLwqFtvikW9hrKL4RZ.ZMeaW5r/jYrNkm.ub23bMWL/mE2O20O',
        email: 'dirk.delta@acme.com',
        roles: ['kunde'],
    },
    {
        _id: '20000000-0000-0000-0000-000000000006',
        username: 'emil.epsilon',
        password:
            '$2b$12$jC0vLwqFtvikW9hrKL4RZ.ZMeaW5r/jYrNkm.ub23bMWL/mE2O20O',
        email: 'emil.epsilon@acme.com',
    },
];
