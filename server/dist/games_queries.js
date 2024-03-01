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
exports.createTransaction = exports.updateEnvelope = exports.destroyEnvelope = exports.createNewEnvelope = exports.updateAccountInfo = exports.getTransactionInfo = exports.getEnvelopeInfo = exports.getAccountInfo = exports.getAccountInfoUName = exports.createAccount = void 0;
const db = __importStar(require("./queries"));
async function createAccount(userName, password) {
    const userText = '(INSERT INTO users (user_name, password, balance, available_balance) ' +
        'VALUES ($1, $2, 0, 0) returning id)';
    const text = `with ids as ${userText} insert into envelopes` +
        ` (user_id, category, budget) select id,'deposit',0 from ids ` +
        `union select id,'withdraw',0 from ids`;
    const params = [userName, password];
    await db.query(text, params);
}
exports.createAccount = createAccount;
async function getAccountInfoUName(userName) {
    const text = 'SELECT id, user_name AS "userName", balance, ' +
        'available_balance AS "availableBalance", password ' +
        'FROM users WHERE user_name = $1';
    const params = [userName];
    const res = await db.query(text, params);
    return res.rows;
}
exports.getAccountInfoUName = getAccountInfoUName;
;
async function getAccountInfo(userId, withPassword) {
    let passwordText = '';
    if (withPassword) {
        passwordText = ', password ';
    }
    const text = 'SELECT user_name AS "userName", balance, ' +
        'available_balance AS "availableBalance" ' + passwordText +
        'FROM users WHERE id = $1';
    const params = [userId];
    const res = await db.query(text, params);
    return res.rows;
}
exports.getAccountInfo = getAccountInfo;
;
async function getEnvelopeInfo(userId) {
    const text = 'SELECT id, category,budget,spent ' +
        'FROM envelopes where user_id = $1 order by id';
    const params = [userId];
    const res = await db.query(text, params);
    return res.rows;
}
exports.getEnvelopeInfo = getEnvelopeInfo;
;
async function getTransactionInfo(userId, envelopeId) {
    let idText = ' inner join envelopes on transactions.envelope_id= ' +
        'envelopes.id where user_id=$1';
    let params = [userId];
    if (envelopeId) {
        idText = ' where envelope_id=$1';
        params = [envelopeId];
    }
    const text = 'SELECT transactions.id, category, amount,tr_date as date,' +
        'description FROM transactions' + idText +
        ' order by transactions.tr_date desc, id desc';
    const res = await db.query(text, params);
    return res.rows;
}
exports.getTransactionInfo = getTransactionInfo;
async function updateAccountInfo(userId, password, balance, availableBalance) {
    const text = 'UPDATE users SET password = COALESCE($2, password), ' +
        'balance = COALESCE($3, balance), ' +
        'available_balance = COALESCE($4, available_balance) ' +
        'WHERE id = $1';
    const params = [userId, password, balance, availableBalance];
    await db.query(text, params);
}
exports.updateAccountInfo = updateAccountInfo;
;
async function createNewEnvelope(userId, category, budget) {
    const envText = '(INSERT INTO envelopes (user_id, category, budget) ' +
        'VALUES($1, $2, $3) returning id)';
    const text = `with ids as ${envText} select id from ids`;
    const params = [userId, category, budget];
    const res = await db.query(text, params);
    return res.rows;
}
exports.createNewEnvelope = createNewEnvelope;
;
async function destroyEnvelope(envelopeId) {
    const text = 'DELETE FROM envelopes where id=$1';
    const params = [envelopeId];
    await db.query(text, params);
}
exports.destroyEnvelope = destroyEnvelope;
;
async function updateEnvelope(envelopeId, budget, spent) {
    const text = 'UPDATE envelopes SET budget = $2, spent = $3 ' +
        'WHERE id = $1;';
    const params = [envelopeId, budget, spent];
    await db.query(text, params);
}
exports.updateEnvelope = updateEnvelope;
;
async function createTransaction(envelopeId, amount, date, description) {
    const text = 'INSERT INTO transactions (envelope_id, amount,tr_date,description) ' +
        'VALUES($1, $2,$3,$4)';
    const params = [envelopeId, amount, date, description];
    await db.query(text, params);
}
exports.createTransaction = createTransaction;
;
//# sourceMappingURL=games_queries.js.map