import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiX, FiCheck } from 'react-icons/fi';

export default function VirtualTryOn({ shades }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeShade, setActiveShade] = useState(shades?.[0] || 'Ruby Rush');
  const [isScanning, setIsScanning] = useState(true);

  const handleOpen = () => {
    setIsOpen(true);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000); // Simulate camera loading/face scan
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="w-full border border-primary-dark dark:border-gray-700 text-primary-dark dark:text-white font-medium py-3 hover:bg-primary-dark dark:hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm mt-4 rounded-md cursor-pointer"
      >
        <FiCamera /> Virtual Try-On
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent text-white">
                <h3 className="font-serif text-lg">Live Try-On</h3>
                <button onClick={() => setIsOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/40 backdrop-blur">
                  <FiX />
                </button>
              </div>

              {/* Camera Area (Mocked with an image) */}
              <div className="relative aspect-[3/4] bg-gray-900 w-full overflow-hidden">
                {isScanning ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full mb-4"
                    />
                    <p className="font-light tracking-widest text-sm uppercase">Detecting Face...</p>
                  </div>
                ) : (
                  <>
                    <img 
                      src="https://images.unsplash.com/photo-1512413914595-65487771761d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                      alt="Camera Feed" 
                      className="w-full h-full object-cover filter brightness-110"
                    />
                    
                    {/* Simulated AR Overlay effect (just a color tint overlay on the lips area for demo) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-12 w-16 h-8 rounded-full bg-red-500/20 mix-blend-multiply blur-sm" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-lg text-primary-dark font-medium text-sm border border-gray-200">
                      Wearing: {activeShade}
                    </div>
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="bg-white p-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">Select Shade</p>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {['Ruby Rush', 'Velvet Rose', 'Nude Whisper', 'Crimson Night'].map(shade => (
                    <button 
                      key={shade}
                      onClick={() => setActiveShade(shade)}
                      className={`relative flex-shrink-0 w-12 h-12 rounded-full border-2 transition-all ${activeShade === shade ? 'border-primary-dark scale-110' : 'border-transparent hover:scale-105'}`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden">
                         {/* Using a placeholder texture color based on shade name */}
                         <div className="w-full h-full" style={{ backgroundColor: shade.includes('Ruby') ? '#9b1b30' : shade.includes('Rose') ? '#d87093' : shade.includes('Nude') ? '#d2b48c' : '#800000' }} />
                      </div>
                      {activeShade === shade && (
                        <div className="absolute -top-1 -right-1 bg-primary-dark text-white rounded-full p-[2px]">
                          <FiCheck size={10} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
