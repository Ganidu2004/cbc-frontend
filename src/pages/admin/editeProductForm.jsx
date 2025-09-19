import axios from "axios";
import { useState } from "react"
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import uploadMediaToSupabase from "../../utils/mediaUpload";

export default function EditeProductForm() {

  const location = useLocation()

  const navigate = useNavigate()

  const product = location.state.product

  const altNames = product.altName.join(",")

  if(!product){
    navigate("/admin/products")
  }

  const [productId, setProductId] = useState(product.productId);
  const [productName, setProductName] = useState(product.productName);
  const [alternativeNames, setAlternativeNames] = useState(altNames);
  const [imageFiles, setImageFiles] = useState([]);
  const [price, setPrice] = useState(product.price);
  const [lastPrice, setLastPrice] = useState(product.lastPrice);
  const [stock, setStock] = useState(product.stock);
  const [description, setDescription] = useState(product.description);

  

  async function handelSubmit(){
    const altNames = alternativeNames.split(",");

    const promisesArray = []
    let imgUrls = product.images

    if(imageFiles.length > 0){

        for(let i=0; i<imageFiles.length; i++ ){
        promisesArray[i] = uploadMediaToSupabase(imageFiles[i])
        }

        imgUrls = await Promise.all(promisesArray)
    }

    const productData = {
        productId : productId,
        productName : productName,
        altName : altNames,
        images : imgUrls,
        price : price,
        lastPrice : lastPrice,
        stock : stock,
        description : description
    }

    const token = localStorage.getItem("token")

    try{
      //import.meta.env.VITE_BACKEND_URL get en file
        await axios.put(import.meta.env.VITE_BACKEND_URL + "/api/product/"+ product.productId, productData, {
            headers: {
                Authorization : "Bearer " + token
            }
        })
        navigate("/admin/products")
        toast.success("Product Updated Successfully")
    }catch(err){
        toast.error("Failed to update product")
    }
    
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Edite Product</h1>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 overflow-y-auto max-h-[90vh]">
        {/* Product ID */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Product ID</label>
          <input
            disabled
            type="text"
            placeholder="Enter product ID (e.g., P1001)"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
        </div>

        {/* Product Name */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Product Name</label>
          <input
            type="text"
            placeholder="Enter product name"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        {/* Alternative Names */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Alternative Names</label>
          <input
            type="text"
            placeholder="Enter alternative names (comma separated)"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={alternativeNames}
            onChange={(e) => setAlternativeNames(e.target.value)}
          />
        </div>

        {/* Image URLs */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">Upload Images</label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-200 border-gray-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a5 5 0 010 10h-1"></path>
                </svg>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG (multiple allowed)</p>
              </div>
            <input id="image-upload" type="file" className="hidden"
               multiple
              onChange={(e) => setImageFiles(e.target.files)}
            />
          </label>
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Price</label>
          <input
            type="number"
            placeholder="Enter current price"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Last Price */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Last Price</label>
          <input
            type="number"
            placeholder="Enter previous price"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={lastPrice}
            onChange={(e) => setLastPrice(e.target.value)}
          />
        </div>

        {/* Stock */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Stock</label>
          <input
            type="number"
            placeholder="Enter available stock"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Description</label>
          <textarea
            placeholder="Enter product description"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handelSubmit}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
        >
          Update Product
        </button>
      </div>
    </div>
  );
}
