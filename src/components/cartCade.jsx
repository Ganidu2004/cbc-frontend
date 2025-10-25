import axios from "axios"
import { useEffect, useState } from "react"
import { deleteItem } from "../utils/cartFunction"

export default function CartCade(props){

    const productId = props.productId
    const qty = props.qty

    const [product,setProduct] = useState(null)
    const [loaded,setLoaded] = useState(false)

    useEffect(
        ()=>{
            if(!loaded){
                axios.get(import.meta.env.VITE_BACKEND_URL+"/api/product/"+productId).then(
                    (response)=>{
                        if(response.data != null){
                            setProduct(response.data)
                            console.log(response.data)
                            setLoaded(true)
                        }else{
                            deleteItem(productId)
                        }
                        
                    }
                ).catch(
                    (err)=>{
                        console.log(err)
                    }
                )
            }
        }
    ),[]

    return(
        <tbody>
            <tr className="hover:bg-accent hover:text-white cursor-pointer">
                <td><img src={product?.images[0]} className="w-[100px] h-[100px] object-cover mx-auto"/></td>
                <td className="text-center">{product?.productName}</td>
                <td className="text-center">{productId}</td>
                <td className="text-center">{qty}</td>
                <td className="text-center">LKR.{product?.lastPrice.toFixed(2)}</td>
                <td className="text-center">LKR.{(product?.lastPrice*qty).toFixed(2)}</td>
            </tr>
        </tbody>
    )
}