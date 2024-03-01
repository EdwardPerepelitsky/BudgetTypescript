import { SyntheticEvent, useState } from "react"
import { callBackend } from "./api";
import { MovableModal } from "./MoveableModal";
import {Error,queryObj} from './types'

interface TrParams {
    envelopes: queryObj[]|undefined,
    setEnvelopes:(envelopes:queryObj[]|undefined)=>void,
    accountInfo: queryObj|undefined,
    setAccountInfo: (accountInfo:queryObj|undefined)=> void,
    onLogout: ()=>void,
    setShowCrTr:(showTr:boolean)=>void,
    maxZ:number,
    setMaxZ:(maxZ:number)=>void
}

export const TrModal:React.FC<TrParams> = ({envelopes,setEnvelopes,accountInfo,
    setAccountInfo,onLogout,setShowCrTr,maxZ,setMaxZ}) =>{

    const [trCatIdx,setTrCatIdx] = useState<number>(-1);
    const [trAmount,setTrAmount] = useState<string>('')
    const [trDate,setTrDate] = useState<string>('')
    const[trDesc,setTrDesc] = useState<string>('')
    const [errorMessageTr, setErrorMessageTr] = useState<string|undefined>()



    const handleTr =  async (e:SyntheticEvent) => {
        e.preventDefault();
        if(isNaN(Number(trAmount))){
            setErrorMessageTr('Amount must be a number.')
            return
        }
        if(Number(trAmount)<=0){
            setErrorMessageTr('Amount must be positive.')
            return
        }
        
        if(Number(trCatIdx)===-1){
            setErrorMessageTr('Please choose a category.')
            return
        }

        if(trDate===''){
            setErrorMessageTr('Please choose a date.')
            return
        }

        

        const envIdx = Number(trCatIdx)
        const url = 'users/addtransaction'
        let body;
        const envId = (envelopes as queryObj[])[envIdx].id
        const envCategory = (envelopes as queryObj[])[envIdx].category
        const budget = (envelopes as queryObj[])[envIdx].budget
        const spent = (envelopes as queryObj[])[envIdx].spent
        if(envCategory==='deposit' || envCategory==='withdraw'){
            body = {eId:envId,amount:trAmount,typeTr:envCategory,
                date:trDate,description:trDesc}
        }
        else {
            
            body={eId:envId,amount:trAmount,budget:budget,spent:spent,
                date:trDate,description:trDesc}
        }
        try{
            const res = await callBackend(url,'POST',{},body)
            setTrAmount('')
            setTrCatIdx(-1)
            setTrDate('')
            setTrDesc('')
            setErrorMessageTr(undefined)
            res.userName = (accountInfo as queryObj).userName
            if(envCategory==='deposit' || envCategory==='withdraw'){
                setAccountInfo(res)
            }
            else {
                res.availableBalance = (accountInfo as queryObj).availableBalance
                setEnvelopes([...(envelopes as queryObj[]).slice(0,envIdx),
                {id:envId,category:envCategory,
                    budget:res['envBudget'],spent:res['envSpent']},
                ...(envelopes as queryObj[]).slice(envIdx+1)
                ])
                delete res['envBudget']
                delete res['envSpent']
                setAccountInfo(res)
            }
        }
        
        catch(ex){

            if((ex as Error).code===401){
                onLogout()
            }

            else if ( ((ex as Error).details as queryObj)?.message){
                setErrorMessageTr(((ex as Error).details as queryObj).message)
            }
            else if ((ex as Error).message){
                setErrorMessageTr((ex as Error).message)
            }
            else{
                setErrorMessageTr('Error')
            }
            
        }       
    }

    return(
        <MovableModal
            id = {"crTrW"}
            title = {<h2> Create Transaction </h2>}
            setShowModal={setShowCrTr}
            maxZ={maxZ}
            setMaxZ={setMaxZ}
        >
            <form onSubmit={handleTr} >
                <select 
                    value={trCatIdx} 
                    onChange={e => setTrCatIdx(((e.target.value as unknown) as number))}
                >
                    <option value={-1}>
                        Choose category
                    </option>
                    {
                        (envelopes as queryObj[]).map((e,indx)=>
                            <option 
                                key={e.id} 
                                value={indx}
                            >
                                {e.category}
                            </option>
                        )
                    }
                </select>
                <br/>
                <input 
                    type="text" 
                    placeholder="Amount" 
                    onChange={e => setTrAmount(e.target.value)} value={trAmount}
                />
                <br/>
                <input
                    type="date"
                    onChange={e => setTrDate(e.target.value)} value={trDate}
                />
                <br/>
                <textarea
                    placeholder="Description" 
                    onChange={e => setTrDesc(e.target.value)} 
                    value={trDesc}
                    rows={5}
                    cols = {50}
                    maxLength={1000}
                />
                <br/>
                <input type="submit" value="Add Transaction"/>
                {errorMessageTr && 
                <span className="formError">
                    {errorMessageTr} 
                </span>
                }
            </form>
  
        </MovableModal>
    )
        
}