"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const db = __importStar(require("./queries"));
async function createUsers() {
    const text = 'CREATE TABLE users (id serial primary key,user_name varchar(128) unique, password ' +
        'varchar(128) NOT NULL, balance numeric default 0, ' +
        'available_balance numeric default 0)';
    await db.query(text, []);
}
async function createEnvelopes() {
    const text = 'CREATE TABLE envelopes (id serial primary key,' +
        'user_id int REFERENCES users(id) on delete cascade, ' +
        'category varchar(32) , budget numeric default 0' +
        ', spent numeric default 0); ' +
        'Create unique index idx_envelopes_uid_cat on ' +
        'envelopes(user_id,category);';
    await db.query(text, []);
}
async function createTransactions() {
    const text = 'CREATE TABLE transactions (id serial PRIMARY KEY, ' +
        'envelope_id int REFERENCES envelopes(id) on delete cascade, ' +
        'amount numeric default 0, ' +
        'tr_date date not null default current_date, ' +
        'description varchar(1000)); ' +
        'Create index idx_transactions_eid on transactions(envelope_id)';
    await db.query(text, []);
}
async function createSession() {
    let text = 'CREATE TABLE session (sid varchar, sess json NOT NULL, ' +
        'expire timestamp(6) NOT NULL, PRIMARY KEY(sid))';
    await db.query(text, []);
    text = 'CREATE INDEX ON session(expire)';
    await db.query(text, []);
}
async function createTables() {
    await createUsers();
    await createEnvelopes();
    await createTransactions();
    await createSession();
}
createTables().catch(error => { console.log(error); });
//# sourceMappingURL=create_tables.js.map