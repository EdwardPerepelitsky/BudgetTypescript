import {  useState,useRef, SyntheticEvent,RefObject } from "react"
import {Link} from 'react-router-dom'
import { callBackend } from "./api";
import {queryObj,Error} from './types'
import { useHistory } from "react-router-dom";

interface onLoginParams {
    onLogin: ()=>void
}


export const LoginPage:React.FC<onLoginParams> = ({onLogin}) => {

    const history = useHistory()
    history.push('/Login')

    const [email,setEmail] = useState<string>('');
    const [password,setPassword] = useState<string>('');
    const [errorMessage, setError] = useState<string|undefined>()
    

    const handleSubmit = async (e:SyntheticEvent) => {
        e.preventDefault();
        try{
            await callBackend('users/login','POST',{},
            {user_name:email.toLowerCase(),password:password})
            onLogin()
            
        }
        
        catch(ex){

            if (((ex as Error).details as queryObj)?.message){
                setError(((ex as Error).details as queryObj).message)
            }
            else if ((ex as Error).message){
                setError((ex as Error).message)
            }
            else{
                setError('Error')
            }
        }

      }

      const ref=useRef()

      const handleCheckbox = () => {
        if (ref.current && (ref.current as HTMLInputElement).type==='password'){
            (ref.current as HTMLInputElement).type = 'text'
        }
        else if (ref.current){
            (ref.current as HTMLInputElement).type='password'
        }
      }

    return(
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit} >
                <input type="text" placeholder="Email" 
                onChange={e => setEmail(e.target.value)} value={email}/><br/>
                <input 
                    type="password" placeholder="Password" ref={((ref as unknown) as RefObject<HTMLInputElement>)}
                    onChange={e => setPassword(e.target.value)} value={password}
                    onCut={(e)=>{e.preventDefault();return false}}
                    onCopy={(e)=>{e.preventDefault();return false}}
                    onPaste={(e)=>{e.preventDefault();return false}} 
                />
                <input type="checkbox" 
                onClick={handleCheckbox}/>Show password<br/>
                <input type="submit" value="Login"/>
                {errorMessage && <span className="formError">
                    {errorMessage} </span>}
            </form>

            <Link to={"/Register"}>Don't have an account? Register here.</Link>
            
        </div>
    )
}