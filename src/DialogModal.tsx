import {useEffect, useRef,ReactElement } from "react";

const isClickInsideRectangle = (e:MouseEvent, 
    element:Element) => {

    const r = element.getBoundingClientRect();
  
    return (
      e.clientX > r.left &&
      e.clientX < r.right &&
      e.clientY > r.top &&
      e.clientY < r.bottom
    );
};

type modelProps = {};

interface modalParams {
    onProceed: (e:MouseEvent)=>Promise<void>,
    onClose: (idx:number|undefined)=> void
    children:ReactElement<modelProps>
}

export const DialogModal:React.FC<modalParams> = ({onProceed,onClose,children}) =>{
    const ref = useRef(null);

    useEffect(() => {
        ((ref.current as unknown) as HTMLDialogElement)?.showModal();
        }, [ref]);

    // useEffect(()=>{
    //     document.querySelector("dialog").showModal()
    // },[])
    
    

    return(
        <dialog
            ref={ref}
            onCancel={()=>{onClose(undefined)}}
            onClick={(e) =>
                ref.current && !isClickInsideRectangle(((e as unknown) as MouseEvent), ref.current) && onClose(undefined)
            }
        >
            {children}

            <div className="diButtons">
                <button onClick={(e)=>{onProceed(((e as unknown) as MouseEvent))}}>Yes</button>
                <button onClick={()=>onClose(undefined)}>Cancel</button>
            </div>
                
       
        </dialog>
    )    
}