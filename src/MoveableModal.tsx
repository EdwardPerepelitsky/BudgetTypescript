import {useEffect, useRef,cloneElement,ReactElement,RefObject } from "react"

interface MovModelParamsNoC {
    id?:string,
    title:ReactElement<any>,
    setShowModal:(showModal:boolean)=>void,
    maxZ:number,
    setMaxZ:(maxZ:number)=>void
}   

type MovModelParams = React.PropsWithChildren<MovModelParamsNoC>

export const MovableModal:React.FC<MovModelParams> = ({children,id,title,setShowModal,maxZ,setMaxZ}) => {

    const dragElement = (e:DragEvent,element:HTMLDivElement) =>{
        
        element.style.setProperty('z-index', (maxZ+1).toString()) 
        setMaxZ(maxZ+1)
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const elementDrag = (e:MouseEvent) => {
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            if(element.offsetTop - pos2>=0){
                element.style.top = (element.offsetTop - pos2) + "px";
                element.style.left = (element.offsetLeft - pos1) + "px";
            }
            
        }

        const closeDragElement = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        }

        const dragMouseDown = (e:DragEvent) => {

            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement
            document.onmousemove = (e:MouseEvent)=>{elementDrag(e)}
        }

        dragMouseDown(e)

    }

    const ref = useRef()
    const refBtn = useRef()

    useEffect(()=>{
        if(ref.current){
            (ref.current as HTMLDivElement).style.setProperty('z-index', (maxZ+1).toString()) 
            setMaxZ(maxZ+1)
        }
    },[ref])

    return(
      
        <div className="trWindow" 
            ref={((ref as unknown) as RefObject<HTMLDivElement>)} 
            id={id}
            onClick = {()=>{
                ((ref.current as unknown) as HTMLDivElement).style.setProperty('z-index', (maxZ+1).toString()) 
                setMaxZ(maxZ+1)
            }}
            onScroll={()=>{

                ((refBtn.current as unknown) as HTMLButtonElement)
                .style.setProperty('top',((ref.current as unknown) as HTMLDivElement).scrollTop + "px") 
            }}    
        >
            {cloneElement(title,{
                onMouseDown:(e:DragEvent)=>ref.current && dragElement(e,ref.current),
                className:"trWindowHeader"
            })}

            {children}

            <button
                ref={((refBtn as unknown)as RefObject<HTMLButtonElement>)} 
                className="formClose" 
                onClick={()=>setShowModal(false)}
            >
                x
            </button>

        </div>

        
 
    )
}

