import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX } from 'react-icons/fi';

const ingredients = [
  { id: 1, name: 'Hyaluronic Acid', desc: 'Deeply hydrates and plumps the skin, reducing the appearance of fine lines.', x: '30%', y: '40%' },
  { id: 2, name: 'Niacinamide', desc: 'Improves skin texture, minimizes pores, and evens out skin tone.', x: '65%', y: '25%' },
  { id: 3, name: 'Squalane', desc: 'Locks in essential moisture without clogging pores for a radiant finish.', x: '50%', y: '70%' },
];

export default function IngredientExplorer() {
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="py-20 bg-primary">
      <div className="text-center mb-12">
        <h3 className="font-serif text-3xl md:text-4xl text-primary-dark mb-4">Inside the Formula</h3>
        <p className="text-gray-500 font-light">Hover or click to explore the active ingredients.</p>
      </div>

      <div className="relative w-full max-w-5xl mx-auto h-[400px] md:h-[600px] overflow-hidden rounded-2xl shadow-xl">
        {/* Macro Texture Image */}
        <img 
          src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
          alt="Texture Macro" 
          className="absolute inset-0 w-full h-full object-cover transform scale-110 hover:scale-105 transition-transform duration-1000"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Hotspots */}
        {ingredients.map((ing) => (
          <div key={ing.id} className="absolute z-10" style={{ top: ing.y, left: ing.x }}>
            <div className="relative group">
              <button 
                onClick={() => setActiveId(activeId === ing.id ? null : ing.id)}
                onMouseEnter={() => setActiveId(ing.id)}
                className="relative w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full border border-white/50 text-white hover:bg-white/40 transition-colors shadow-lg"
              >
                <FiPlus className={`transition-transform duration-300 ${activeId === ing.id ? 'rotate-45' : ''}`} />
              </button>

              <AnimatePresence>
                {activeId === ing.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute top-14 -left-32 w-64 bg-white/90 backdrop-blur p-4 rounded shadow-2xl border border-gray-100"
                  >
                    <h4 className="font-serif font-semibold text-primary-dark mb-1">{ing.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{ing.desc}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
