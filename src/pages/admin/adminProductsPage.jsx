import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { FaPlus, FaTrash } from "react-icons/fa"
import { FaPencil } from "react-icons/fa6"
import { Link } from "react-router-dom"

export default function AdminProduct() {
  const [products, setProducts] = useState([])
  const [productLoaded, setProductLoaded] = useState(false);

  useEffect(() => {
    if(!productLoaded){
            axios.get(import.meta.env.VITE_BACKEND_URL+"/api/product").then((res) => {
            setProducts(res.data)
            setProductLoaded(true)
        })
    }
    
  }, [productLoaded]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 ">Admin Products</h1>

      {
        productLoaded?<div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200 ">
        <Link to={"/admin/products/addProduct"} className="absolute right-[25px] bottom-[25px] text-[25px] text-white bg-[#3d82f6] p-4 rounded-xl hover:bg-blue-300 "><FaPlus/></Link>
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-800 text-sm uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3">Product ID</th>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Last Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium">{product.productId}</td>
                <td className="px-6 py-4">{product.productName}</td>
                <td className="px-6 py-4 line-through text-gray-500">
                  Rs. {product.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-green-600 font-semibold">
                  Rs. {product.lastPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4 max-w-xs truncate">
                  {product.description}
                </td>
                <td className="px-6 py-4 flex items-center justify-center gap-3">
                  <button className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                   onClick={()=>{
                    const token = localStorage.getItem("token");
                    axios.delete(`import.meta.env.VITE_BACKEND_URL/api/product/${product.productId}`,{
                        headers: {
                             Authorization: `Bearer ${token}`
                        },
                    }).then(()=>{
                        toast.success("Product Deleted Successfully");
                    })
                    setProductLoaded(false);
                  }}>
                    <FaTrash />
                  </button>
                  <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition">
                    <FaPencil />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>:<div className="w-full h-full flex justify-center items-center">
        <div className="w-[60px] h-[60px] border-[4px] border-gray-200 border-b-[#3d82f6] rounded-full animate-spin"></div>
      </div>
      }

      
    </div>
  )
}
