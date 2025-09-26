import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import ProductCard from "../../components/productCard"

export default function ProductPage(){

    const [products,setProducts] = useState([])
    const [loadingStatus,setLoadingStatus] = useState("loading")

    useEffect(
        ()=>{
            if(loadingStatus === "loading"){
                axios.get(import.meta.env.VITE_BACKEND_URL+'/api/product').then(

                (res)=>{console.log(res.data)
                setProducts(res.data)
                setLoadingStatus("loaded")
                }
            ).catch(() => {
                toast.error("Failed to fetch product");
                setLoadingStatus("error");
                })
            }
        },[]
    )
    return(
        <div className="pt-[120px] w-full h-full flex flex-wrap justify-center">
            {
                products.map(
                    (product)=>
                        <ProductCard product={product}/>
                )
            }
        </div>
    )
}