import axios from "axios"
import { useEffect, useState } from "react"

export default function AdminProduct(){

    const [products,setProducts] = useState([
    {
        "_id": "68b3078362262df9b7fd07ed",
        "productId": "B2001",
        "productName": "Hydrating Face Serum",
        "altName": [
            "Moisturizing Serum",
            "Skin Glow Serum"
        ],
        "images": [
            "https://example.com/images/serum1.jpg",
            "https://example.com/images/serum2.jpg"
        ],
        "price": 3200,
        "lastPrice": 4500,
        "stock": 120,
        "description": "A lightweight hydrating serum infused with hyaluronic acid and vitamin C. Helps to restore skin moisture, reduce dullness, and improve skin elasticity for a radiant glow.",
        "__v": 0
    },
    {
        "_id": "68b5b1832210948fc15df000",
        "productId": "B2002",
        "productName": "Laptop Dell Inspiron 15",
        "altName": [
            "Dell 15",
            "Inspiron Laptop"
        ],
        "images": [
            "https://example.com/images/laptop-front.jpg",
            "https://example.com/images/laptop-back.jpg"
        ],
        "price": 145000,
        "lastPrice": 150000,
        "stock": 25,
        "description": "Dell Inspiron 15 laptop with Intel i5 processor, 8GB RAM, 512GB SSD.",
        "__v": 0
    }
])
    useEffect(
        ()=>{
            axios.get("http://localhost:5000/api/product").then(
                (res)=>{
                console.log(res.data)
                setProducts(res.data)
                }
            )
        },[]
    )
    

    return(
        <div>           
            {
                products.map(
                    (product)=>{
                        return(
                            <div>
                                {product.productName}
                            </div>
                        )
                    }
                )
            }
        </div>
    )
}
