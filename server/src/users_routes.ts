const express = require('express');
import * as gq from './games_queries'
import bcrypt from 'bcrypt'
import {  Response, NextFunction } from 'express'
import {ReqSess,Error,queryRes} from './types'


const router = express.Router();



router.post('/signup', async (req:ReqSess, res:Response, _next:NextFunction) => {
    if (req.session.userName){
        res.status(409).json({message: 'You are signed up and logged in.'});
        return;
    }
    const info = req.body;
    const userName = info['user_name'];
    const password = info.password;
    if(userName==='' || password===''){
        res.status(400).json({message: 'Email and password must be non-empty.'})
        return;
    }
    try{
        const hashedPass = await bcrypt.hash(password, 10);
        await gq.createAccount(userName, hashedPass);
    } catch(error) {
        
        if((error as Error).detail  && ((error as Error).detail as string).includes('Key (user_name)=')){
            res.status(409).json({message: 'Email already exists. Please pick a different email.'});
            return;
        }
        console.log(error)
        res.status(400).send();
        return;
    }
    res.status(201).json({'user_name': userName});
});

router.post('/login', async (req:ReqSess, res:Response, _next:NextFunction) => {


    if (req.session.userName){
        res.status(409).json({message: 'You are already logged in.'})
        return;
    }
    const data = req.body;
    const userName = data.user_name;
    const password = data.password;
    let info;
    try{
        info = await gq.getAccountInfoUName(userName);
    } catch(error) {
        res.status(400).send();
        return;
    }
    if (info.length === 0){
        res.status(404).json({message: 'Email not found.'})
        return;
    }
    info = info[0];
    const hashedPass = info.password;
    let comparison;
    try{
        comparison = await bcrypt.compare(password, hashedPass);
    } catch(error) {
        res.status(400).send();
        return;
    }
    if (comparison === false){
        res.status(401).json({message: 'Wrong password.'});
        return;
    }
    const id = Number(info.id)
    const balance = Number(info.balance);
    const availableBalance = Number(info.availableBalance);
    req.session.userId = id;
    req.session.balance = balance;
    req.session.availableBalance = availableBalance
    req.session.userName = userName;
    res.status(200).json({message: 'You are now logged in as ' + userName});    
});

router.get('/account', async (req:ReqSess, res:Response, _next:NextFunction) => {
    if (!req.session.userId){
        res.status(401).json({message: 'You must be logged in to view your account.'});
        return;
    };
    const userId = req.session.userId;
    const accountInfo = await gq.getAccountInfo(userId,false);
    res.status(200).json(accountInfo[0]);
});

router.get('/envelopeinfo', async (req:ReqSess, res:Response, _next:NextFunction) => {
    if (!req.session.userId){
        res.status(401).json({message: 'You must be logged in to get envelope info.'});
        return;
    };
    const userId = req.session.userId;
    const envelopeInfo = await gq.getEnvelopeInfo(userId);
    res.status(200).json(envelopeInfo);
});

router.get('/transactioninfo', async (req:ReqSess, res:Response, _next:NextFunction) => {
    if (!req.session.userId){
        res.status(401).json({message: 'You must be logged in to get transaction info.'});
        return;
    };
    const userId = req.session.userId;
    const envInfo = req.body;
    const eId = envInfo.eId
    const transactionInfo = await gq.getTransactionInfo(userId,eId);
    res.status(200).json(transactionInfo);
});

router.post('/password', async (req:ReqSess, res:Response, _next:NextFunction) => {
    
    if (!req.session.userId){
        res.status(401).json({message: 'You must be logged in to change your password.'});
        return;
    };
    const userId = req.session.userId
    const credentials = req.body;
    const password = credentials.password;
    const newPassword = credentials.newPassword;
    let info;
    try{
        info = await gq.getAccountInfo(userId,true);
    } catch(error) {
        res.status(400).send();
        return;
    }
    if (info.length === 0){
        res.status(404).json({message: 'Email not found.'})
        return;
    }
    info = info[0];
    const hashedPass = info.password;
    let comparison;
    try{
        comparison = await bcrypt.compare(password, hashedPass);
    } catch(error) {
        res.status(400).send();
        return;
    }
    if (comparison === false){
        res.status(401).json({message: 'Wrong password.'});
        return;
    }
    let hashedNewPass;
    try{
        hashedNewPass = await bcrypt.hash(newPassword, 10);
    } catch(error) {
        res.status(400).send();
        return;
    }
    await gq.updateAccountInfo(userId, hashedNewPass, null, null);
    res.status(200).json({message:'You have successfully changed your password.'});
});

router.post('/addenvelope', async (req:ReqSess, res:Response, _next:NextFunction) => {
    const userId = req.session.userId;
    if (!userId){
        res.status(401).json({message: 'You must be logged in to add an envelope.'})
        return;
    }

    const envParams = req.body;
    const category = envParams.category;
    const budget = Number(envParams.budget);

    let availableBalance = req.session.availableBalance

    if(!availableBalance){
        res.status(400).json({message: 'Cookie missing available balance.'})
        return;
    }

    if (budget > availableBalance){
        res.status(409).json({message: "You can't allocate more money than your available balance."})
        return;
    }

    availableBalance = availableBalance - budget

    let result:queryRes[]
    
    try{
            result = await Promise.all([gq.createNewEnvelope(userId, category, budget), 
            gq.updateAccountInfo(userId, null, null, availableBalance)])
    }

    catch(ex){
        res.status(500).json({message:ex})
        return;
    }
        
    const envId = result[0][0].id
    req.session.availableBalance = availableBalance

    res.status(201).json({
        availableBalance: availableBalance,
        envId : envId
    });
});


router.post('/removeenvelope', async (req:ReqSess, res:Response, _next:NextFunction) => {
    const userId = req.session.userId;
    if (!userId){
        res.status(401).json({message: 'You must be logged in to remove an envelope.'})
        return;
    }

    const envParams = req.body;
    const eId = envParams.eId;
    const budget = Number(envParams.budget)
    const spent = Number(envParams.spent)
    
    let availableBalance = req.session.availableBalance
    let balance = req.session.balance

    if(!availableBalance){
        res.status(400).json({message: 'Cookie missing available balance.'})
        return;
    }

    if(!balance){
        res.status(400).json({message: 'Cookie missing balance.'})
        return;
    }

    availableBalance = availableBalance + budget + spent
    balance = balance + spent
    
    try{
        await Promise.all([gq.destroyEnvelope(eId), 
            gq.updateAccountInfo(userId, null, balance ,availableBalance)])
    }

    catch(ex){
        res.status(500).json({message:ex})
        return;
    }
        

    req.session.availableBalance = availableBalance
    req.session.balance = balance

    res.status(201).json({
        availableBalance: availableBalance,
        balance: balance
    });
});




router.post('/updateenvelope', async (req:ReqSess, res:Response, _next:NextFunction) => {
    const userId = req.session.userId;
    if (!userId){
        res.status(401).json({message: 'You must be logged in to update an envelope.'})
        return;
    }

    const envParams = req.body;
    const eId = envParams.eId;
    const deltaBudget = Number(envParams.deltaBudget)
    let envBudget = Number(envParams.budget);
    const envSpent = Number(envParams.spent)
    let availableBalance = req.session.availableBalance;

    if(!availableBalance){
        res.status(400).json({message: 'Cookie missing available balance.'})
        return;
    }

    if (deltaBudget > availableBalance){
        res.status(409).json({message: "You can't allocate more money than your available balance."})
        return;
    }

    if (deltaBudget < - envBudget){
        res.status(409).json({message: "You can't lower envelope budget below 0."})
        return;
    }

    envBudget = envBudget + deltaBudget
    availableBalance = availableBalance - deltaBudget
    
    await Promise.all([gq.updateEnvelope(eId, envBudget,envSpent), 
        gq.updateAccountInfo(userId, null, null, availableBalance)])

    req.session.availableBalance = availableBalance

    res.status(201).json({
        availableBalance: availableBalance,
        envBudget: envBudget,
        envSpent: envSpent
    });
});



router.post('/addtransaction', async (req:ReqSess, res:Response, _next:NextFunction) => {
    const userId = req.session.userId;
    if (!userId){
        res.status(401).json({message: 'You must be logged in to add a transaction.'})
        return;
    }

    const trParams = req.body;
    const eId = trParams.eId;
    const typeTr = trParams.typeTr
    const amount = Number(trParams.amount);
    const date  = trParams.date
    const description = trParams.description

    let balance = req.session.balance;
    let availableBalance = req.session.availableBalance;

    if(typeof availableBalance ==='undefined'){
        res.status(400).json({message: 'Cookie missing available balance.'})
        return;
    }

    if(typeof balance ==='undefined'){
        res.status(400).json({message: 'Cookie missing balance.'})
        return;
    }

    if (typeTr==='deposit'){
        balance = balance + amount;
        availableBalance = availableBalance + amount;
        await Promise.all([gq.createTransaction(eId,amount,date,description), 
            gq.updateAccountInfo(userId, null, balance, availableBalance)]);
        req.session.balance = balance;
        req.session.availableBalance = availableBalance;
        res.status(201).json({
            balance: balance,
            availableBalance: availableBalance
        });
        return;
    }

    if (typeTr==='withdraw'){
        if (amount > availableBalance){
            res.status(409).json({message: "You can't withdraw more money than available."})
            return;
        }
        balance = balance - amount;
        availableBalance = availableBalance - amount;
        await Promise.all([gq.createTransaction(eId, amount,date,description), 
            gq.updateAccountInfo(userId, null, balance, availableBalance)]);
        req.session.balance = balance;
        req.session.availableBalance = availableBalance;
        res.status(201).json({
            balance: balance,
            availableBalance: availableBalance
        });
        return;
    }

    let envelopeBalance = Number(trParams.budget);
    let envelopeSpent = Number(trParams.spent)
    

    if (amount > envelopeBalance){
        res.status(409).json({message: "You can't spend more money than allocated for this category."})
        return;
    }

    envelopeBalance = envelopeBalance - amount
    envelopeSpent = envelopeSpent + amount
    balance = balance - amount
    

    await Promise.all([gq.createTransaction(eId, amount,date,description), 
        gq.updateEnvelope(eId,  envelopeBalance,envelopeSpent),
        gq.updateAccountInfo(userId, null, balance, null)])

    req.session.balance = balance

    res.status(201).json({
        envBudget: envelopeBalance,
        envSpent: envelopeSpent,
        balance: balance
    });
});


router.get('/logout', async (req:ReqSess, res:Response, _next:NextFunction) => {
    if (!req.session.userId){
        res.status(409).json({message: 'You are already logged out.'});
        return;
    }
    req.session.destroy(() => {res.status(200).json({message: 'You are now logged out'})});
});


export default router;



