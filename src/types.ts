export type queryObj = {[field:string]:string}

export type bodyObj = {[field:string]:string|number}

export type genObj = {[field:string]:any}

export interface Error{
    code:number,
    message:string,
    details?:string|queryObj|genObj|null

}
