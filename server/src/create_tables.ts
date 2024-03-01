import * as db from './queries'

async function createUsers(){
    const text = 'CREATE TABLE users (id serial primary key,user_name varchar(128) unique, password '+
                 'varchar(128) NOT NULL, balance numeric default 0, ' +
                 'available_balance numeric default 0)';
    await db.query(text, []);
}


async function createEnvelopes(){
    const text = 'CREATE TABLE envelopes (id serial primary key,' + 
                 'user_id int REFERENCES users(id) on delete cascade, ' +
                 'category varchar(32) , budget numeric default 0'+
                 ', spent numeric default 0); ' + 
                 'Create unique index idx_envelopes_uid_cat on ' + 
                 'envelopes(user_id,category);'
                 
    await db.query(text, []);
}


async function createTransactions(){
    const text = 'CREATE TABLE transactions (id serial PRIMARY KEY, ' + 
                 'envelope_id int REFERENCES envelopes(id) on delete cascade, ' + 
                 'amount numeric default 0, ' + 
                 'tr_date date not null default current_date, ' + 
                 'description varchar(1000)); ' + 
                 'Create index idx_transactions_eid on transactions(envelope_id)'

    await db.query(text, []);
}

async function createSession(){
    let text = 'CREATE TABLE session (sid varchar, sess json NOT NULL, ' +
               'expire timestamp(6) NOT NULL, PRIMARY KEY(sid))'
    await db.query(text, []);
    text = 'CREATE INDEX ON session(expire)';
    await db.query(text, []);
}

async function createTables(){
    await createUsers();
    await createEnvelopes();
    await createTransactions();
    await createSession();
}

createTables().catch(error => {console.log(error);});