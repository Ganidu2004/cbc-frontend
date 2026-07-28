import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift, FiX } from 'react-icons/fi';

export default function GamifiedRewards() {
  const [isOpen, setIsOpen] = useState(false);
  const [itemsInCart, setItemsInCart] = useState(1); // Mock cart items
  const maxItems = 3;

  // Auto-open after a delay to grab attention (gamification)
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
          >
            <FiGift size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="w-80 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="bg-primary-dark p-4 flex justify-between items-center text-white">
              <h4 className="font-serif font-medium flex items-center gap-2"><FiGift /> Build Your Bundle</h4>
              <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
                <FiX />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Add <span className="font-semibold text-accent">{maxItems - itemsInCart}</span> more full-size item{maxItems - itemsInCart > 1 ? 's' : ''} to unlock a <span className="font-semibold text-primary-dark">FREE deluxe mini</span>!
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(itemsInCart / maxItems) * 100}%` }}
                  className="bg-accent h-full rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400 font-medium tracking-wider">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span className="text-accent">Gift!</span>
              </div>

              <div className="mt-6 flex justify-center">
                <button 
                  onClick={() => setItemsInCart(Math.min(itemsInCart + 1, maxItems))}
                  className="text-xs uppercase tracking-widest text-primary-dark border border-primary-dark px-4 py-2 hover:bg-primary-dark hover:text-white transition-colors"
                >
                  {itemsInCart < maxItems ? 'Simulate Add Item' : 'Claim Gift!'}
                </button>
              </div>
              
              {itemsInCart >= maxItems && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium rounded"
                >
                  Gift Unlocked! 🎁
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
