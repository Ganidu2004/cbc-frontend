import axios from "axios";
import { useEffect, useState } from "react";
import { deleteItem, addToCart } from "../utils/cartFunction";
import { motion } from "framer-motion";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

const MOCK_PRODUCT = {
  productId: 'mock-1',
  productName: 'Luminous Silk Foundation',
  lastPrice: 69.00,
  images: ['https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80']
};

export default function CartCade(props) {
  const productId = props.productId;
  const qty = props.qty;

  const [product, setProduct] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!loaded) {
      axios
        .get(import.meta.env.VITE_BACKEND_URL + "/api/product/" + productId)
        .then((response) => {
          if (response.data != null) {
            setProduct(response.data);
            setLoaded(true);
          } else {
            setProduct({ ...MOCK_PRODUCT, productId });
            setLoaded(true);
          }
        })
        .catch((err) => {
          console.log(err);
          setProduct({ ...MOCK_PRODUCT, productId });
          setLoaded(true);
        });
    }
  }, [productId, loaded]);

  const handleRemove = () => {
    setIsRemoving(true);
    deleteItem(productId);
    toast.success("Item removed from bag");
    setTimeout(() => {
        window.location.reload(); 
    }, 800);
  };

  const handleQuantityChange = (change) => {
      setIsRemoving(true);
      addToCart(productId, change);
      setTimeout(() => {
          window.location.reload(); 
      }, 300);
  };

  if (!loaded || !product) {
    return (
      <div className="flex items-center gap-6 p-6 mb-4 border border-gray-100 rounded-2xl bg-white/50 animate-pulse">
        <div className="w-24 h-32 bg-gray-200 rounded-xl"></div>
        <div className="flex-1 space-y-4">
          <div className="h-5 bg-gray-200 w-1/3 rounded"></div>
          <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isRemoving ? 0 : 1, x: isRemoving ? -50 : 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl hover:bg-gray-50/50 transition-colors group relative"
    >
      <div className="w-full sm:w-28 h-36 bg-gray-50 rounded-xl overflow-hidden relative shadow-inner">
        <img
          src={product?.images?.[0] || 'https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={product?.productName || "Product"}
        />
      </div>

      <div className="flex-1 flex flex-col justify-between w-full h-full py-2">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="font-serif text-xl font-medium text-primary-dark mb-1 group-hover:text-accent transition-colors">{product.productName}</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Ref: {productId.substring(0, 8)}</p>
            </div>
            <button 
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-gray-300 hover:text-red-500 transition-colors p-2 bg-white hover:bg-red-50 rounded-full shadow-sm hover:shadow"
              title="Remove Item"
            >
              <FiTrash2 size={16} /> 
            </button>
        </div>
        
        <div className="flex items-end justify-between mt-auto">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <button 
                  onClick={() => handleQuantityChange(-1)} 
                  disabled={isRemoving}
                  className="px-3 py-2 hover:bg-gray-50 text-gray-400 hover:text-primary-dark transition-colors disabled:opacity-50"
                >
                    <FiMinus size={14} />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-primary-dark border-x border-gray-100">{qty}</span>
                <button 
                  onClick={() => handleQuantityChange(1)} 
                  disabled={isRemoving}
                  className="px-3 py-2 hover:bg-gray-50 text-gray-400 hover:text-primary-dark transition-colors disabled:opacity-50"
                >
                    <FiPlus size={14} />
                </button>
            </div>

            <div className="text-right">
                <p className="text-xl font-medium text-primary-dark">LKR {((product?.lastPrice || 0) * qty).toFixed(2)}</p>
                {qty > 1 && (
                    <p className="text-xs text-gray-400">LKR {(product?.lastPrice || 0).toFixed(2)} each</p>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
}