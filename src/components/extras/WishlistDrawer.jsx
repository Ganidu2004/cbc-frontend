import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiHeart, FiShoppingBag, FiTrash2, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { loadWishlist, removeFromWishlist } from "../../utils/wishlistFunction";
import { addToCart } from "../../utils/cartFunction";
import toast from "react-hot-toast";

export default function WishlistDrawer({ isOpen, onClose }) {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const refreshWishlist = () => {
      setWishlistItems(loadWishlist());
    };

    refreshWishlist();
    window.addEventListener("aura_wishlist_updated", refreshWishlist);
    return () => window.removeEventListener("aura_wishlist_updated", refreshWishlist);
  }, []);

  if (!isOpen) return null;

  const handleMoveToCart = (item) => {
    const prodId = typeof item === 'object' ? (item.productId || item._id || item.id) : item;
    addToCart(prodId, 1);
    removeFromWishlist(prodId);
    toast.success("✨ Item moved from Wishlist to Cart!");
  };

  const handleRemove = (item) => {
    const prodId = typeof item === 'object' ? (item.productId || item._id || item.id) : item;
    removeFromWishlist(prodId);
    toast.success("Item removed from Wishlist");
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white dark:bg-[#161622] h-full shadow-2xl flex flex-col border-l border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <FiHeart size={18} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-primary-dark dark:text-white">Your Saved Wishlist</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{wishlistItems.length} Saved Favorites</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <FiHeart size={32} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-primary-dark dark:text-white">Your Wishlist is empty</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                  Click the heart icon on any product to save items for later or move them to cart anytime.
                </p>
              </div>
            </div>
          ) : (
            wishlistItems.map((item, idx) => {
              const name = item.name || item.title || "Luxury Beauty Product";
              const price = Number(item.price || 4800);
              const image = item.image || item.productImage || "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

              return (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 group hover:border-accent/40 transition-all">
                  <img src={image} alt={name} className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-primary-dark dark:text-white truncate">{name}</h4>
                    <p className="font-serif font-bold text-sm text-accent mt-0.5">LKR {price.toLocaleString()}</p>
                    
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="text-[11px] font-bold uppercase tracking-wider text-accent hover:text-primary-dark dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <FiShoppingBag /> Add to Cart
                      </button>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <button
                        onClick={() => handleRemove(item)}
                        className="text-[11px] font-medium text-gray-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {wishlistItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
            <button
              onClick={() => {
                wishlistItems.forEach(item => {
                  const prodId = typeof item === 'object' ? (item.productId || item._id || item.id) : item;
                  addToCart(prodId, 1);
                  removeFromWishlist(prodId);
                });
                toast.success("✨ All saved items moved to Cart!");
                onClose();
              }}
              className="w-full py-3.5 bg-primary-dark dark:bg-accent text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiShoppingBag /> Move All to Cart
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
