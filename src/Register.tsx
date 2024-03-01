import {  useState,useRef, SyntheticEvent, RefObject } from "react"
import {Link} from 'react-router-dom'
import { callBackend } from "./api";
import { useHistory } from "react-router-dom";
import {Error,queryObj} from './types'

function validateEmail(email:string){
    const validRegex = /^([_-]?[a-zA-Z0-9]+)([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9-]+[a-zA-Z0-9]$/
    return(email.match(validRegex))
}

export const Register = () => {

    const history = useHistory();
    
    const [email,setEmail] = useState<string>('');
    const [password,setPassword] = useState<string>('');
    const [errorMessage, setError] = useState<string>()

    const handleSubmit = async (e:SyntheticEvent) => {
        e.preventDefault();

        if(!validateEmail(email)){
            setError('Please enter a valid email.')
            return
        }

        try{
            await callBackend('users/signup','POST',{},
            {user_name:email.toLowerCase(),password:password})

            history.push("/Login");
            
        
        }
        
        catch(ex){

            // setEmail('')
            // setPassword('')

            if ( ((ex as Error).details as queryObj)?.message){
                setError(((ex as Error).details as queryObj).message)
            }
            else if ((ex as Error).message){
                setError((ex as Error).message)
            }
            else{
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
            <h1>Register</h1>
            <form onSubmit={handleSubmit} >
                <input type="text" placeholder="Email" 
                onChange={e => setEmail(e.target.value)} value={email}/><br/>
                <input 
                    type="password" placeholder="Password" 
                    ref={((ref as unknown) as RefObject<HTMLInputElement>)}
                    onChange={e => setPassword(e.target.value)} value={password}
                    onCut={(e)=>{e.preventDefault();return false}}
                    onCopy={(e)=>{e.preventDefault();return false}}
                    onPaste={(e)=>{e.preventDefault();return false}} 
                />
                <input type="checkbox" 
                onClick={handleCheckbox}/>Show password<br/>
                <input type="submit" value="Register"/>
                {errorMessage && <span className="formError">
                    {errorMessage} </span>}
            </form>

            <Link to={"/Login"}>Back to Login.</Link>
            
        </div>
    )
}