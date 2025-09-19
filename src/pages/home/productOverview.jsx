import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import ProductNotFound from "./productNotFound";
import ImgeSlider from "../../components/imgeSlider";

export default function ProductOverview(){

    const params = useParams()
    const ProductId = params.id;
    const [product,setProduct]= useState(null)
    const [status,setStatus] = useState("Loading")

    useEffect(
        ()=>{
            axios.get(import.meta.env.VITE_BACKEND_URL+"/api/product/"+ProductId)
            .then((res)=>{
                //if null
                if(res.data == null ){
                    setStatus("not found")
                }
                //if product found
                if(res.data != null){
                    setProduct(res.data)
                    setStatus("found")
                }

            }).catch((err) => {
                console.error(err);
                
            })
        }
    )



    return(
        <div className="w-full h-[calc(100vh-100px)]">
            {
                status == "Loading" && (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-gray-300 border-b-accent border-4"></div>
                    </div>
                )
            }
            {
                status == "not found" && (
                    <ProductNotFound/>
                )
            }
            {
                status == "found" && (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-[35%] h-full">
                            <ImgeSlider images={product.images}/>
                        </div>
                        <div className="w-[65%] h-full p-4">
                            <h1 className="text-3xl font-bold text-gray-800">{product.productName}</h1>
                            <h1 className="text-3xl font-bold text-gray-600">{product.altName.join(" | ")}</h1>
                            <p className="text-xl text-gray-600 font-bold">{
                                (product.price > product.lastPrice)&&
                                <span className="line-through text-red-600">LKR.{product.price}</span>
                            }<span>{"LKR."+product.lastPrice}</span></p>
                            <p className="text-lg text-gray-600">{product.description}</p>
                        </div>
                    </div>
                )
            }
        </div>
    )
}