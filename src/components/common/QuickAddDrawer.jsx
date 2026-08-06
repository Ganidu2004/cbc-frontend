import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function QuickAddDrawer({ isOpen, onClose, product }) {
  const navigate = useNavigate();

  if (!product) return null;

  const handleViewBag = () => {
    if (onClose) onClose();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#181820] shadow-2xl z-50 flex flex-col border-l dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-serif text-xl text-primary-dark dark:text-white">Added to Bag</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400 cursor-pointer">
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              
              {/* Product Added */}
              <div className="flex gap-4">
                <img src={product.images?.[0] || product.image} alt={product.productName} className="w-24 h-32 object-cover bg-gray-100 dark:bg-gray-800 rounded-lg" />
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-medium text-primary-dark dark:text-white font-serif text-lg">{product.productName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.finish || 'Standard Size'}</p>
                  </div>
                  <div className="text-accent font-semibold">
                    Rs. {(product.lastPrice || product.price || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

              {/* Cross-Sell */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Pairs well with</h4>
                <div className="flex gap-4 p-4 border border-gray-100 dark:border-gray-800 bg-primary/30 dark:bg-gray-800/40 items-center rounded-xl">
                  <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Brush" className="w-16 h-20 object-cover rounded-md" />
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-primary-dark dark:text-white font-serif">Precision Complexion Brush</h5>
                    <p className="text-accent font-semibold text-sm mt-1">Rs. 28.00</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-accent transition-colors cursor-pointer">
                    <FiPlus size={14} className="text-primary-dark dark:text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#181820]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
                <span className="text-xl font-serif text-primary-dark dark:text-white">Rs. {(product.lastPrice || product.price || 0).toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-4">Shipping and taxes calculated at checkout.</p>
              <button 
                onClick={handleViewBag}
                className="w-full bg-primary-dark dark:bg-accent text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-black dark:hover:bg-accent/80 transition-colors flex items-center justify-center gap-2 cursor-pointer rounded-xl shadow-md"
              >
                <FiShoppingBag /> View Bag
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
