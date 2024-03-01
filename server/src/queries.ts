const {Pool} = require('pg');

export const pool = new Pool({
    // user: 'postgres',
    user: 'edward',
    // host: 'db',
    host: 'localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: '5432'
});


export async function query(text:string, params:any[]){
    return await pool.query(text, params);
}

export async function getClient(){
    const client = await pool.connect();
    return client;
};



