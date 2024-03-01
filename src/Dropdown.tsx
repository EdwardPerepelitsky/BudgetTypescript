import { useEffect, useState, useRef,cloneElement,ReactElement,RefObject } from "react"

const useOutsideClick = (callback:()=>void) => {
    const ref1 = useRef();
    const ref2 = useRef();
  
    useEffect(() => {
        const handleClick = (event:MouseEvent) => {
          if (ref1.current && !(ref1.current as Element).contains(event.target as Node)
          && ref2.current && !(ref2.current as Element).contains(event.target as Node)) {
            callback();
          }
        };

        document.addEventListener('click', handleClick,true);

        return () => {
          document.removeEventListener('click', handleClick,true);
        };
      }, [ref1,ref2]);

      return [ref1,ref2];
};



interface DropdownParams {
    id:string,
    trigger:ReactElement<any,any>,
    menu:ReactElement<any,any>[],
    menuId:string
}

export const Dropdown:React.FC<DropdownParams> = ({id,trigger,menu,menuId}) => {

    const [showAccMenu,setShowAccMenu] = useState(false)
    const handleClickOutside = () => {
        setShowAccMenu(false);
    };
    let ref1,ref2
    [ref1,ref2] = useOutsideClick(handleClickOutside);

    const handleAccMenu = () => {
        setShowAccMenu(!showAccMenu);
    };

    return(
        <div id={id}>

            <div className="accountDrop">
                {
                    cloneElement(
                        trigger,
                        {
                            onClick:handleAccMenu,
                            ref:ref2
                        }
                    )
                }
        
                {
                    showAccMenu &&
                    <div id={menuId} ref={((ref1 as unknown) as RefObject<HTMLDivElement>) }>
                        {
                            menu.map((menuItem,index)=>(
                                menuItem.type==='button'?
                                cloneElement(menuItem,{
                                    onClick: (e:MouseEvent) =>{
                                        // e.preventDefault();
                                        menuItem.props.onClick();
                                        setShowAccMenu(false)
                                    },
                                    key:index
                                }):
                                cloneElement(menuItem,{
                                    key:index
                                })
                            ))
                        }
                    </div>
                }

            </div>

        </div>
    )

}