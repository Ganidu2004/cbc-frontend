import { useEffect, useState } from "react"
import { loadCart } from "../../utils/cartFunction"
import CartCade from "../../components/cartCade"
import axios from "axios"

export default function Cart(){
    const [cart,setCart] = useState([])
    const [total,setTotal] =useState(0)
    const [labeledTotal,setLabeledTotal] = useState(0)
    
    useEffect(
        ()=>{
            setCart(loadCart())
            const token = localStorage.getItem("token")
            axios.post(import.meta.env.VITE_BACKEND_URL+"/api/orders/quote",{
                orderItems : loadCart()
            },{
                headers: {
                    Authorization : "Bearer " + token
                }
            }).then(
                (res)=>{
                    setTotal(res.data.total)
                    setLabeledTotal(res.data.labeledTotal)
                }
            )
        },[]
    )

    function onOrderCheckOutClick(){
        const token = localStorage.getItem("token")
        if(token == null){
            return
        }
    }

    return(
        <div className=" w-full h-full flex flex-col items-end">
            <table className="w-full">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Product Id</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
            {
                cart.map(
                    (item)=>{
                        return(
                                <CartCade key={item.productId} productId={item.productId} qty={item.qty}/>
                        )
                    }
                )
            }
            </table>
            <h1 className="text-3xl font-bold text-accent">
                Total: LKR.{(labeledTotal ?? 0).toFixed(2)}
            </h1>
            <h1 className="text-3xl font-bold text-accent">
                Discount: LKR.{((labeledTotal ?? 0) - (total ?? 0)).toFixed(2)}
            </h1>
            <h1 className="text-3xl font-bold text-accent">
                Grand Total: LKR.{(total ?? 0).toFixed(2)}
            </h1>
            <button onClick={onOrderCheckOutClick} className="bg-accent text-white p-2 rounded w-[300px] cursor-pointer hover:bg-accent-light">CheckOut</button>
        </div>
    )
}