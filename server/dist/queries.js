"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = exports.pool = void 0;
const { Pool } = require('pg');
exports.pool = new Pool({
    // user: 'postgres',
    user: 'edward',
    // host: 'db',
    host: 'localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: '5432'
});
async function query(text, params) {
    return await exports.pool.query(text, params);
}
exports.query = query;
async function getClient() {
    const client = await exports.pool.connect();
    return client;
}
exports.getClient = getClient;
;
//# sourceMappingURL=queries.js.map