import {Request} from 'express'

export interface ReqSess extends Request{
    session:Request['session'] & {
        userName?:string,
        userId?:number,
        balance?:number,
        availableBalance?:number,
        
    }
}

export interface Error{
    detail?:string
}

export type queryRes = {[field:string]:string}[]

