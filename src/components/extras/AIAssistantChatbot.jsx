import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiUser, FiCamera } from 'react-icons/fi';

export default function AIAssistantChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const renderContent = () => {
    switch (step) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                  <FiUser size={14} />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none text-sm text-gray-700">
                  Hi there! I'm Aura, your AI Beauty Assistant. Ready to find your perfect skincare routine?
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <button onClick={() => setStep(1)} className="w-full bg-primary-dark text-white text-sm py-2 rounded shadow hover:bg-black transition-colors">
                Yes, let's go!
              </button>
              <button className="w-full bg-white border border-gray-200 text-gray-600 text-sm py-2 rounded shadow-sm flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors">
                <FiCamera /> Snap a Selfie for Analysis
              </button>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none text-sm text-gray-700 w-3/4">
                What is your primary skin concern?
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {['Dryness', 'Acne / Blemishes', 'Anti-Aging', 'Dullness'].map(concern => (
                <button key={concern} onClick={() => setStep(2)} className="w-full border border-gray-200 p-2 text-sm text-left hover:border-accent hover:text-accent transition-colors rounded">
                  {concern}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full">
            <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none text-sm text-gray-700 mb-4">
              Based on your selection, here is your customized 3-step routine:
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
              {/* Product 1 */}
              <div className="flex items-center gap-3 border border-gray-100 p-2 rounded">
                <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&w=100&q=80" className="w-12 h-12 object-cover bg-gray-50" />
                <div>
                  <div className="text-xs text-accent uppercase font-semibold">Step 1: Prep</div>
                  <div className="text-sm font-medium text-primary-dark">Hydrating Toner</div>
                </div>
              </div>
              {/* Product 2 */}
              <div className="flex items-center gap-3 border border-gray-100 p-2 rounded">
                <img src="https://images.unsplash.com/photo-1629198688000-71f23e745b6e?ixlib=rb-4.0.3&w=100&q=80" className="w-12 h-12 object-cover bg-gray-50" />
                <div>
                  <div className="text-xs text-accent uppercase font-semibold">Step 2: Treat</div>
                  <div className="text-sm font-medium text-primary-dark">Glow Serum</div>
                </div>
              </div>
            </div>
            <button className="mt-4 w-full bg-accent text-white text-sm py-2 font-medium tracking-wide uppercase hover:bg-opacity-90 transition-all rounded">
              Add Routine to Cart
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[320px] h-[450px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-primary-dark p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2 h-2 bg-green-400 rounded-full absolute -bottom-1 -right-1 border border-primary-dark" />
                  <FiUser size={18} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-medium">Aura Assistant</h4>
                  <p className="text-[10px] text-gray-300">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
                <FiX />
              </button>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 p-4 bg-white overflow-hidden">
              {renderContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary-dark text-white rounded-full shadow-xl flex items-center justify-center hover:bg-black transition-colors"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </motion.button>
    </div>
  );
}
