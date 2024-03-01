import * as db from './queries'


export async function createAccount(userName:string, password:string){
    const userText = '(INSERT INTO users (user_name, password, balance, available_balance) ' +
                 'VALUES ($1, $2, 0, 0) returning id)';
    const text = `with ids as ${userText} insert into envelopes` + 
    ` (user_id, category, budget) select id,'deposit',0 from ids ` +
    `union select id,'withdraw',0 from ids`
    const params = [userName, password];
    await db.query(text, params);
}

export async function getAccountInfoUName(userName:string){
    const text = 'SELECT id, user_name AS "userName", balance, ' + 
                 'available_balance AS "availableBalance", password ' +
                 'FROM users WHERE user_name = $1';
    const params = [userName];
    const res = await db.query(text, params);
    return res.rows;
};

export async function getAccountInfo(userId:number,withPassword:boolean){
    let passwordText='';
    if (withPassword){
        passwordText = ', password '
    }
    const text = 'SELECT user_name AS "userName", balance, ' + 
                 'available_balance AS "availableBalance" ' + passwordText + 
                 'FROM users WHERE id = $1';
    const params = [userId];
    const res = await db.query(text, params);
    return res.rows;
};

export async function getEnvelopeInfo(userId:number){
    const text = 'SELECT id, category,budget,spent ' + 
                 'FROM envelopes where user_id = $1 order by id';
    const params = [userId]
    const res = await db.query(text, params);
    return res.rows;
};

export async function getTransactionInfo(userId:number,envelopeId?:number|null){
    let idText = ' inner join envelopes on transactions.envelope_id= ' + 
    'envelopes.id where user_id=$1'
    let params = [userId]
    if (envelopeId){
        idText = ' where envelope_id=$1'
        params = [envelopeId];
    }
    const text = 'SELECT transactions.id, category, amount,tr_date as date,' + 
                'description FROM transactions' + idText + 
                ' order by transactions.tr_date desc, id desc';
    
    const res = await db.query(text,params);
    return res.rows;
}

export async function updateAccountInfo(userId:number, password?:string|null, 
    balance?:number|null, availableBalance?:number|null){
    const text = 'UPDATE users SET password = COALESCE($2, password), ' + 
                 'balance = COALESCE($3, balance), ' + 
                 'available_balance = COALESCE($4, available_balance) ' +
                 'WHERE id = $1';
    const params = [userId, password, balance, availableBalance];
    await db.query(text, params);
};


export async function createNewEnvelope(userId:number, category:string,
     budget:number){
    const envText = '(INSERT INTO envelopes (user_id, category, budget) ' +
                 'VALUES($1, $2, $3) returning id)';
    const text = `with ids as ${envText} select id from ids`
    const params = [userId, category, budget];
    const res = await db.query(text, params);
    return res.rows
};

export async function destroyEnvelope(envelopeId:number){
    const text = 'DELETE FROM envelopes where id=$1' 
    const params = [envelopeId];
    await db.query(text, params);
};


export async function updateEnvelope(envelopeId:number, budget:number
    ,spent:number){
    const text = 'UPDATE envelopes SET budget = $2, spent = $3 ' + 
                 'WHERE id = $1;';
    const params = [envelopeId, budget,spent];
    await db.query(text, params);
};

export async function createTransaction(envelopeId:number, amount:number,
    date:number,description:string){
    const text = 'INSERT INTO transactions (envelope_id, amount,tr_date,description) ' +
                 'VALUES($1, $2,$3,$4)';
    const params = [envelopeId, amount,date,description];
    await db.query(text, params);
};































