import path from 'path'
import express from 'express'
import {  Response, NextFunction } from 'express'
import {ReqSess} from './types'
import * as db from './queries'
import cors from 'cors'
import usersRouter from './users_routes'
import https from 'https'
import session from 'express-session'
import crypto from 'crypto'
import pgSess from 'connect-pg-simple'
const pgSession = pgSess(session);
import fs from 'fs'



const app = express();

app.use(express.static(path.join(__dirname, "../..", "build")));
app.use(express.static("public"));

app.use((_req:ReqSess, res:Response, next:NextFunction) => {
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST');
    next();
});


app.use(cors({
    origin: true,
    credentials: true,
}));


app.use(express.urlencoded({extended: true}));
app.use(express.json());

let secret = crypto.randomBytes(128).toString('hex');
let name =  crypto.randomBytes(128).toString('hex');


app.use(session({
    secret: secret,
    name: name,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 600000
    },
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new pgSession({
        pool: db.pool,
        tableName: 'session'
    })
}));


app.use('/users', usersRouter);

app.use('/checkLogin',(req:ReqSess, res:Response, _next:NextFunction) => {
    
    if (req.session.userName){
        res.status(200).json({message:'Logged in'})
    }
    else{
        res.status(200).json({message:'Logged out'})
    }
});

app.use((_req:ReqSess, res:Response, _next:NextFunction) => {
    res.sendFile(path.join(__dirname, "../..", "build", "index.html"));
  });

  

const options = {
    key: fs.readFileSync(path.join(__dirname, "../src/certs", "localhost-key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../src/certs", "localhost.pem"))
};

const server = https.createServer(options, app);



const PORT =  4324;
server.listen(PORT, () => {console.log('Server is listening on port ' + PORT)})
//app.listen(PORT, () => {console.log('Server is listening on port ' + PORT)})
