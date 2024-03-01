import { useEffect, useState } from "react"
import { callBackend } from "./api";
import { MovableModal } from "./MoveableModal";
import { queryObj,Error } from "./types";


interface TrParams {
    envelopes: queryObj[]|undefined,
    onLogout: ()=>void,
    setShowTr:(showTr:boolean)=>void,
    maxZ:number,
    setMaxZ:(maxZ:number)=>void
}

export const Transactions:React.FC<TrParams> = ({envelopes,onLogout,setShowTr,maxZ,setMaxZ}) => {

    const [transactions,setTransactions] = useState<queryObj[]|undefined>()
    const [trErrMessage, setTrError] = useState<string|undefined>()


    useEffect(() => {

		(async () => {
			try {
                setTransactions(await callBackend('users/transactioninfo','GET',
                {}))
			}
			catch (ex) {

                if((ex as Error).code===401){
                    onLogout()
                }
    
                else if ( ((ex as Error).details as queryObj)?.message){
                    setTrError(((ex as Error).details as queryObj).message)
                }
                else if ((ex as Error).message){
                    setTrError((ex as Error).message)
                }
                else{
                    setTrError('Error')
                }
                
            }       

		})()

	},[])

    let headerTextTr;
    let displayTransactions = false;
    if (!transactions){
        headerTextTr=trErrMessage
    }

    else if(transactions.length===0){
        headerTextTr = 'No transactions.'
    }

    else{
        displayTransactions=true
    }

    return(
        <MovableModal
            title={<h1>Transactions</h1>}
            setShowModal={setShowTr}
            maxZ={maxZ}
            setMaxZ={setMaxZ}
        >

            {headerTextTr && <h2>{headerTextTr}</h2>}

            {
                displayTransactions &&

                <table>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Description</th>
                    </tr>
                    {(transactions as queryObj[]).map((Tr)=>
                        <tr key={Tr.id}>
                            <td>{Tr.category}</td>
                            <td>${Tr.amount}</td>
                            <td id="dateText">{Tr.date.split('T')[0]}</td>
                            <td>{<p id="descText">{Tr.description}</p>}</td>
                        </tr>
                    )}
                </table>
            }

        </MovableModal>
    )
    
}