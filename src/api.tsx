import {queryObj,bodyObj,Error} from './types'

const urlBase = 'https://dummy/'

export async function callBackend(url:string,method:string,
    params:queryObj,body?:bodyObj){


    const urlFull = urlBase + url

    let globalHeaders:queryObj  = {}

    if (body) {
        globalHeaders['Content-Type'] = 'application/json'
    }

    let urlObj = new URL(urlFull)

    if (params) {
        Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key]))
    }

    const response = await fetch(`/${url}`, {
        method: method,
        headers: globalHeaders,
        credentials:'include',
        body: body && JSON.stringify(body),
    })

    if (response.status >= 400) {
        const returnError:Error = {
            code:response.status,
            message:response.statusText,
            details : await response.json().catch(ex => null)

        }
        
        throw returnError
    }

    try {
        const json = await response.json()
        return json
    }
    catch (ex) {
        
        console.error(ex)
        throw ex
    }   

}