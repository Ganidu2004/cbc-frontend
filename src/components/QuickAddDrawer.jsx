import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiShoppingBag } from 'react-icons/fi';

export default function QuickAddDrawer({ isOpen, onClose, product }) {
  if (!product) return null;

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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-serif text-xl text-primary-dark">Added to Bag</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              
              {/* Product Added */}
              <div className="flex gap-4">
                <img src={product.images?.[0]} alt={product.productName} className="w-24 h-32 object-cover bg-gray-100" />
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-medium text-primary-dark font-serif text-lg">{product.productName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{product.finish || 'Standard Size'}</p>
                  </div>
                  <div className="text-accent font-semibold">
                    Rs. {product.lastPrice?.toFixed(2) || product.price?.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              {/* Cross-Sell */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Pairs well with</h4>
                <div className="flex gap-4 p-4 border border-gray-100 bg-primary/30 items-center">
                  <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Brush" className="w-16 h-20 object-cover" />
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-primary-dark">Precision Complexion Brush</h5>
                    <p className="text-accent font-semibold text-sm mt-1">Rs. 28.00</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-accent transition-colors">
                    <FiPlus size={14} className="text-primary-dark" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-xl font-serif text-primary-dark">Rs. {product.lastPrice?.toFixed(2) || product.price?.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 text-center mb-4">Shipping and taxes calculated at checkout.</p>
              <button className="w-full bg-primary-dark text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2">
                <FiShoppingBag /> View Bag
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Add FiPlus since it was used in cross-sell but missing from import
function FiPlus(props) {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
