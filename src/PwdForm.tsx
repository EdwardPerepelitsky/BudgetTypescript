import { useEffect, useState, useRef, SyntheticEvent, RefObject } from "react"
import { callBackend } from "./api";
import { queryObj,Error } from "./types";

const isCloseTo = (e:MouseEvent, element:Element) => {

    const r = element.getBoundingClientRect();

    return (
      e.clientX - r.left > -20 &&
      e.clientX - r.right < 20 &&
      e.clientY - r.top > -20 &&
      e.clientY - r.bottom < 20
    );
};


const useOutsideClick = (callback:()=>void) => {
    const ref = useRef();
  
    useEffect(() => {
        const handleClick = (event:MouseEvent) => {

        if (ref.current && !isCloseTo(event,ref.current))
            {
                callback();
            }
        };

        document.addEventListener('click', handleClick,true);

        return () => {
          document.removeEventListener('click', handleClick,true);
        };
    }, [ref]);

    return ref;
};

interface pwdFormParams{
    id:string,
    setShowForm:(showForm:boolean)=>void
    onLogout: ()=>void
} 
    

export const PwdForm:React.FC<pwdFormParams> = ({id,setShowForm,onLogout}) => {

    const [oldPwd,setOldPwd] = useState<string>('')
    const [newPwd,setNewPwd] = useState<string>('')
    const [newPwdCon,setNewPwdCon] = useState<string>('')
    const [errorMessageChPwd,setErrorMessageChPwd] = useState<string|undefined>()

    const handleSubForm = async (e:SyntheticEvent) => {
        e.preventDefault();

        if(newPwd==='' || oldPwd===''){
            setErrorMessageChPwd('Password must be non-empty.')
            return
        }
        
        if(newPwd!==newPwdCon){
            setErrorMessageChPwd('Passwords do not match.')
            return
        }

        const url='users/password'
        const body = {
            password:oldPwd,
            newPassword:newPwd
        }

        try{
            await callBackend(url,'POST',{},body)
            setShowForm(false)
            setOldPwd('')
            setNewPwd('')
            setNewPwdCon('')
            setErrorMessageChPwd(undefined)
        }
        
        catch(ex){

            if((ex as Error).code===401){

                if (((ex as Error).details as queryObj)?.message.includes('Wrong password')){
                        setErrorMessageChPwd(((ex as Error).details as queryObj)?.message)
                    }
                else{
                    onLogout()
                }

            }

            else{

                if (((ex as Error).details as queryObj)?.message){
                    setErrorMessageChPwd(((ex as Error).details as queryObj).message)
                }
                else if ((ex as Error).message){
                    setErrorMessageChPwd((ex as Error).message)
                }
                else{
                    setErrorMessageChPwd('Error')
                }
            }
        }     
    }

    const handleClickOutside = () => {
        setShowForm(false);
    };

    const ref = useOutsideClick(handleClickOutside);

    const handleCheckbox = (ref:RefObject<HTMLInputElement>) => {

        if ((ref.current as HTMLInputElement).type==='password'){
            (ref.current as HTMLInputElement).type = 'text'
        }
        else{
            (ref.current as HTMLInputElement).type='password'
        }
    }

    const ref1 = useRef();
    const ref2 = useRef();
    const ref3 = useRef();

    return(
        
        <div id={id} ref={((ref as unknown) as RefObject<HTMLDivElement>)}>
            <div className="formContainer">
                <form onSubmit={handleSubForm} className="form">  
                    <input 
                        type="password" placeholder="Old password" 
                        ref={((ref1 as unknown) as RefObject<HTMLInputElement>)} 
                        onChange={e => setOldPwd(e.target.value)} value={oldPwd}
                        onCut={(e)=>{e.preventDefault();return false}}
                        onCopy={(e)=>{e.preventDefault();return false}}
                        onPaste={(e)=>{e.preventDefault();return false}}
                    />
                    <input type="checkbox" 
                    onClick={()=>{handleCheckbox(((ref1 as unknown) as RefObject<HTMLInputElement>))}}/>Show password<br/>
                    <input 
                        type="password" placeholder="New password" ref={((ref2 as unknown) as RefObject<HTMLInputElement>)}
                        onChange={e => setNewPwd(e.target.value)} value={newPwd}
                        onCut={(e)=>{e.preventDefault();return false}}
                        onCopy={(e)=>{e.preventDefault();return false}}
                        onPaste={(e)=>{e.preventDefault();return false}} 
                    />
                    <input type="checkbox" 
                    onClick={()=>{handleCheckbox(((ref2 as unknown) as RefObject<HTMLInputElement>))}}/>Show password<br/>
                    <input 
                        type="password" placeholder="Confirm new password" ref={((ref3 as unknown) as RefObject<HTMLInputElement>)}
                        onChange={e => setNewPwdCon(e.target.value)} value={newPwdCon}
                        onCut={(e)=>{e.preventDefault();return false}}
                        onCopy={(e)=>{e.preventDefault();return false}}
                        onPaste={(e)=>{e.preventDefault();return false}} 
                    />
                    <input type="checkbox" 
                    onClick={()=>{handleCheckbox(((ref3 as unknown) as RefObject<HTMLInputElement>))}}/>Show password<br/>
                    <input
                        className="submitBtn" 
                        type="submit" 
                        value="Change Password"
                    />
                    {errorMessageChPwd && <span className="formError">
                        {errorMessageChPwd} </span>}           
                </form>
                <button 
                    className="formClose" 
                    onClick={()=>setShowForm(false)}
                >
                    x
                </button>
            </div>
        </div>
      
    )
}