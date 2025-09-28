import { useEffect, useState } from "react"
import { loadCart } from "../../utils/cartFunction"

export default function Cart(){
    const [cart,setCart] = useState([])
    useEffect(
        ()=>{
            setCart(loadCart())
        },[]
    )
    return(
        <div className="pt-[120px] w-full h-full overflow-y-scroll flex flex-wrap justify-center">
            {
                cart.map(
                    (item)=>{
                        return(
                                <span>{item.productId}x{item.qty}</span>
                        )
                    }
                )
            }
        </div>
    )
}