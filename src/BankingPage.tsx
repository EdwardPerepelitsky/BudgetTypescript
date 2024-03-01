import { useEffect, useState,SyntheticEvent } from "react"
import { callBackend } from "./api";
import {queryObj,Error,genObj} from './types'
import { DialogModal } from "./DialogModal";
import { Dropdown } from "./Dropdown";
import { PwdForm } from "./PwdForm";
import { Transactions } from "./Transactions";
import { TrModal } from "./TrModal";
import { useHistory } from "react-router-dom"

interface onLogoutParams {
    onLogout: ()=>void
}

export const BankingPage:React.FC<onLogoutParams> = ({onLogout}) => {

    const history = useHistory()
    history.push('/BankingPage')

    const [accountInfo,setAccountInfo] = useState<queryObj|undefined>()
    const [accErrMessage, setAccError] = useState<string|undefined>()
    const [envelopes,setEnvelopes] = useState<queryObj[]|undefined>()
    const [envErrMessage, setEnvError] = useState<string|undefined>()
    const [catName,setCatName] = useState<string>('');
    const [budget,setBudget] = useState<string>('');
    const [errorMessageAddEnv, setErrorMessageAddEnv] = useState<string|undefined>()
    const [envAction,setEnvAction] = useState<string>('Choose action')
    const [envCategoryIdx,setEnvCategoryIdx] = useState<number>(-1)
    const [envAmount,setEnvAmount] = useState<string>('')
    const [errorMessageEnvChange,setErrorMessageEnvChange] = useState<string|undefined>()
    const [remEnvIdx, setRemEnvIdx] = useState<number>()
    const [showForm,setShowForm] = useState<boolean>(false)
    const [showTr,setShowTr] = useState<boolean>(false)
    const [showCrTr,setShowCrTr] = useState<boolean>(false)
    const [maxZ,setMaxZ] = useState<number>(10)
    

    useEffect(() => {

		(async () => {
			try {
                setEnvelopes(await callBackend('users/envelopeinfo','GET',
                {}))
			}
			catch (ex) {

                if((ex as Error).code===401){
                    onLogout()
                }

				else if (((ex as Error).details as queryObj)?.message){
                    setEnvError(((ex as Error).details as queryObj).message)
                }
                else if ((ex as Error).message){
                    setEnvError((ex as Error).message)
                }
                else{
                    setEnvError('Error')
                }
			}

            try {
                setAccountInfo(await callBackend('users/account','GET',{}))
            }
            catch (ex) {

                if((ex as Error).code===401){
                    onLogout()
                }

				else if (((ex as Error).details as queryObj)?.message){
                    setAccError(((ex as Error).details as queryObj).message)
                }
                else if ((ex as Error).message){
                    setAccError((ex as Error).message)
                }
                else{
                    setAccError('Error')
                }

            }

		})()

	},[])

    async function handleLogOut() {
        
        try{
            await callBackend('users/logout','GET',{})
            onLogout()
            
        }
        catch(ex){
            if (((ex as Error).details as queryObj)?.message==='You are already logged out.'){
                onLogout()
            }
            else{
                console.log(ex)
            }
        }
      }


    const handleAddEnv = async (e:SyntheticEvent) => {
        e.preventDefault();
        if(isNaN(Number(budget))){
            setErrorMessageAddEnv('Budget amount must be a number.')
            return
        }
        if(Number(budget)<0){
            setErrorMessageAddEnv('Amount must be positive.')
            return
        }
        if(['deposit','withdraw',''].includes(catName)){
            setErrorMessageAddEnv("Category name can't be 'deposit,'withdraw',or ''.")
            return
        }
        try{
            const res = await callBackend('users/addenvelope','POST',{},
            {category:catName,budget:budget})
            setBudget('')
            setCatName('')
            setErrorMessageAddEnv(undefined)
            setEnvelopes([...(envelopes as queryObj[]),{id:res.envId,category:catName,
                budget:budget===''?'0':budget,spent:'0'}])
            res.balance = (accountInfo as queryObj).balance
            res.userName = (accountInfo as queryObj).userName
            delete res['envId']
            setAccountInfo(res)
        }
        catch(ex){

            if((ex as Error).code===401){
                onLogout()
            }

            else if ((((ex as Error).details as genObj)?.message as queryObj)?.detail){
                if((((ex as Error).details as genObj).message as queryObj).detail
                .includes('Key (user_id, category)')){
                    setErrorMessageAddEnv('Envelope with this category already exists.')
                }
                else{
                    setErrorMessageAddEnv((ex as Error).message)
                }
            }

            else if (((ex as Error).details as queryObj)?.message){
                setErrorMessageAddEnv(((ex as Error).details as queryObj).message)
            }
            else if ((ex as Error).message){
                setErrorMessageAddEnv((ex as Error).message)
            }
            else{
                setErrorMessageAddEnv('Error')
            }
        }
           
    }

    const handleRemEnv = (index:number) => async (e:MouseEvent) => {
        
        e.preventDefault()

        const env = (envelopes as queryObj[])[index]
        const remId = env.id
        const remBud = env.budget
        const remSpent = env.spent

        try{
            const res = await callBackend('users/removeenvelope','POST',{},
            {eId:remId,budget:remBud,spent:remSpent})
            setRemEnvIdx(undefined)
            setEnvelopes((envelopes as queryObj[]).slice(0, index)
            .concat((envelopes as queryObj[]).slice(index+1)))
            res.userName = (accountInfo as queryObj).userName
            setAccountInfo(res)
        }
        catch(ex){

            if((ex as Error).code===401){
                onLogout()
            }

            else{
                console.log(ex)
            }
        }
    }

    const handleEnvChange = async (e:SyntheticEvent) => {
        e.preventDefault();
        if(isNaN(Number(envAmount))){
            setErrorMessageEnvChange('Amount must be a number.')
            return
        }
        if(Number(envAmount)<=0){
            setErrorMessageEnvChange('Amount must be positive.')
            return
        }

        if(envAction==='Choose action'){
            setErrorMessageEnvChange('Please choose an action.')
            return
        }

        if(Number(envCategoryIdx)===-1){
            setErrorMessageEnvChange('Please choose a category.')
            return
        }

        const envIdx = Number(envCategoryIdx)
        const url='users/updateenvelope';
        let body;
        const envId = (envelopes as queryObj[])[envIdx].id
        const envCategory = (envelopes as queryObj[])[envIdx].category
        const budget = (envelopes as queryObj[])[envIdx].budget
        const spent = (envelopes as queryObj[])[envIdx].spent
            
        if(envAction==='Add money'){
            body={eId:envId,deltaBudget:envAmount,budget:budget,spent:spent}
        }
        else{
            body={eId:envId,deltaBudget:`-${envAmount}`,budget:budget,spent:spent}
        }
            
        try{
            const res = await callBackend(url,'POST',{},body)
            setEnvAmount('')
            setEnvCategoryIdx(-1)
            setEnvAction('Choose action')
            setErrorMessageEnvChange(undefined)
            res.userName = (accountInfo as queryObj).userName
            res.balance = (accountInfo as queryObj).balance
            setEnvelopes([...(envelopes as queryObj[]).slice(0,envIdx),
            {id:envId,category:envCategory,
                budget:res['envBudget'],spent:res['envSpent']},
            ...(envelopes as queryObj[]).slice(envIdx+1)
            ])
            delete res['envBudget']
            delete res['envSpent']
            setAccountInfo(res)
        }
        
        catch(ex){

            if((ex as Error).code===401){
                onLogout()
            }

            else if (((ex as Error).details as queryObj)?.message){
                setErrorMessageEnvChange(((ex as Error).details as queryObj).message)
            }
            else if ((ex as Error).message){
                setErrorMessageEnvChange((ex as Error).message)
            }
            else{
                setErrorMessageEnvChange('Error')
            }

            

        }
            
    }

    let headerTextAcc;
    let displayAccount = false;
    if (!accountInfo){
        headerTextAcc=accErrMessage
    }
    else{
        displayAccount=true
    }
      
    let headerTextEnv;
    let displayEnvelopes = false;
    let displayEnvChangeForm = false;
    if (!envelopes){
        headerTextEnv=envErrMessage
    }
    else{
        displayEnvelopes=true
        if(envelopes.length>2){
            displayEnvChangeForm = true;
        }
    }

    const accountDict:queryObj = {
        userName:"Email: ",
        balance:"Balance: $",
        availableBalance:"Avaialable Balance: $"
    }

    
    return(
        <>  

            <h1>Account Info</h1>
            {headerTextAcc && <h2>{headerTextAcc}</h2>}

            {
                displayAccount && 
                <div 
                    id="AccContainer"
                    style={{visibility:showForm?"hidden":"visible"}}
                >
                    {
                        Object.keys(accountDict).map(
                            (a)=><h3 key={a}>
                                {accountDict[a]}{(accountInfo as queryObj)[a]}
                            </h3>
                        )
                    }
                    
                    <button onClick={()=>{setShowCrTr(true)}}> 
                        Add Transaction 
                    </button>

                </div>
            }

            
            <h1 >Envelopes</h1> 
            {headerTextEnv && <h2>{headerTextEnv}</h2>}
            {
                displayEnvChangeForm &&
                <form className="env_change_form" onSubmit={handleEnvChange} >
                    <select value={envAction} 
                    onChange={e => setEnvAction(e.target.value)}>
                        <option value={'Choose action'}>Choose action</option>
                        <option value={'Add money'}>Add money</option>
                        <option value={'Remove money'}>Remove money</option>
                    </select>
                    <select value={envCategoryIdx} 
                    onChange={e => setEnvCategoryIdx(((e.target.value as unknown) as number))}>
                        <option value={-1}>
                            Choose category
                        </option>
                        {
                            (envelopes as queryObj[]).slice(2).map((e,indx)=>
                                <option key={e.id} value={indx+2}>
                                    {e.category}
                                </option>
                            )
                        }
                    </select>
                    <input type="text" placeholder="Amount" 
                    onChange={e => setEnvAmount(e.target.value)} value={envAmount}/>
                    <input type="submit" value="Execute"/>
                    {errorMessageEnvChange && <span className="formError">
                        {errorMessageEnvChange} </span>}
                </form>
            }

            {
                displayEnvelopes && 
                <div id="envContainer">
                    {(envelopes as queryObj[]).slice(2).map(
                        (e,index)=>
                        <div className="env" key={e.id}>
                            <h3 className="env_header">Category: {e.category}</h3>
                            <h3 className="env_header">Budget: ${e.budget}</h3>
                            <h3 className="env_header">Spent: ${e.spent}</h3>
                            <button className="remEnv" onClick={()=>setRemEnvIdx(index+2)}>
                                x
                            </button>
                        </div>
                    )}
                    <div className="env">
                        <form onSubmit={handleAddEnv} >
                            <input type="text" placeholder="Category" 
                            onChange={e => setCatName(e.target.value)} value={catName}/><br/>
                            <input type="text" placeholder="Budget"
                            onChange={e => setBudget(e.target.value)} value={budget} /><br/>
                            <input type="submit" value="Add Envelope"/>
                            {errorMessageAddEnv && <span className="formError">
                                {errorMessageAddEnv} </span>}
                        </form>
                    </div>
                </div>
            }

            <Dropdown 
                id={"accountDropPos"}
                trigger = {<button>Account</button>}
                menu = {[
                    <button onClick={()=>{setShowTr(true)}}> See transactions </button>,
                    <button onClick={()=> setShowForm(true)}> Change password </button>,
                    <button onClick={handleLogOut}> Logout </button>
                ]}
                menuId = {"accountMenu"}
            />

            {
                showForm&& 
                <PwdForm
                    id = {"pwdForm"}
                    setShowForm={setShowForm}
                    onLogout={onLogout}
                />
            }

            {
                showCrTr&&
                <TrModal
                    envelopes = {envelopes}
                    setEnvelopes = {setEnvelopes}
                    accountInfo = {accountInfo}
                    setAccountInfo = {setAccountInfo}
                    onLogout = {onLogout}
                    setShowCrTr = {setShowCrTr}
                    maxZ={maxZ}
                    setMaxZ = {setMaxZ}
                />
            }

            {
                showTr&&
                <Transactions 
                    envelopes={envelopes}
                    onLogout={onLogout} 
                    setShowTr={setShowTr}
                    maxZ={maxZ}
                    setMaxZ={setMaxZ}
                />
            }

            {   
                remEnvIdx &&
                <DialogModal
                    onProceed={handleRemEnv(remEnvIdx)}
                    onClose={() => setRemEnvIdx(undefined)}
                >
                    <p>
                        Are you sure you would like to delete the envelope {<br/>} 
                        {<b>{(envelopes as queryObj[])[remEnvIdx].category}</b>} {' '} 
                        and all concomitant transactions?
                    </p>

                </DialogModal>
            }
                            
        </>
    )
}