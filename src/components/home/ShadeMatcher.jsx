import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tones = [
  { id: 'fair', label: 'Fair', hex: '#FAD5C5' },
  { id: 'light', label: 'Light', hex: '#F0C3AB' },
  { id: 'medium', label: 'Medium', hex: '#D29C77' },
  { id: 'deep', label: 'Deep', hex: '#9E6441' },
  { id: 'rich', label: 'Rich', hex: '#633A22' },
];

const undertones = [
  { id: 'cool', label: 'Cool', desc: 'Pink or bluish hues' },
  { id: 'neutral', label: 'Neutral', desc: 'No obvious pink or yellow' },
  { id: 'warm', label: 'Warm', desc: 'Yellow, peachy, or golden hues' },
];

export default function ShadeMatcher() {
  const [step, setStep] = useState(1);
  const [selectedTone, setSelectedTone] = useState(null);
  const [selectedUndertone, setSelectedUndertone] = useState(null);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const reset = () => {
    setStep(1);
    setSelectedTone(null);
    setSelectedUndertone(null);
  };

  return (
    <div className="py-24 bg-white px-4 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-serif mb-4 text-primary-dark">Find Your Perfect Match</h2>
        <p className="text-gray-500 mb-12 font-light">Discover the ideal shade for your unique complexion in just three steps.</p>

        <div className="bg-primary/30 p-8 md:p-12 border border-secondary/20 shadow-sm relative overflow-hidden min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col items-center"
              >
                <h3 className="text-xl font-medium mb-8">Step 1: Select Your Skin Tone</h3>
                <div className="flex flex-wrap justify-center gap-6">
                  {tones.map(tone => (
                    <button
                      key={tone.id}
                      onClick={() => { setSelectedTone(tone); handleNext(); }}
                      className="group flex flex-col items-center gap-3 transition-transform hover:scale-105"
                    >
                      <div 
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-inner border-2 border-transparent group-hover:border-accent transition-colors"
                        style={{ backgroundColor: tone.hex }}
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary-dark">{tone.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col items-center"
              >
                <h3 className="text-xl font-medium mb-8">Step 2: Identify Your Undertone</h3>
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
                  {undertones.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setSelectedUndertone(u); handleNext(); }}
                      className="flex-1 p-6 border border-gray-200 hover:border-accent hover:bg-accent/5 transition-all text-left group"
                    >
                      <h4 className="font-serif text-lg mb-2 text-primary-dark">{u.label}</h4>
                      <p className="text-sm text-gray-500 font-light group-hover:text-gray-700">{u.desc}</p>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="mt-8 text-sm text-gray-400 hover:text-gray-800 underline">Back</button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <h3 className="text-2xl font-serif mb-2">Your Perfect Match</h3>
                <p className="text-gray-500 mb-8 font-light">Based on your {selectedTone?.label.toLowerCase()} skin and {selectedUndertone?.label.toLowerCase()} undertone.</p>
                
                <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-6 border border-gray-100 shadow-lg max-w-2xl w-full">
                  <div className="w-32 h-40 bg-gray-100 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                      alt="Foundation" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-xs uppercase tracking-widest text-accent font-semibold mb-2 block">Luminous Foundation</span>
                    <h4 className="text-xl text-primary-dark font-medium mb-1">Shade {selectedTone?.label} {selectedUndertone?.label}</h4>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">A flawless, natural finish foundation that perfectly matches your complexion while hydrating the skin.</p>
                    <div className="flex gap-4">
                      <button className="px-6 py-2 bg-primary-dark text-white text-sm uppercase tracking-wide hover:bg-opacity-90">Add to Cart</button>
                      <button onClick={reset} className="px-6 py-2 border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Retake</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Progress Indicators */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className={`h-1 transition-all duration-300 ${step >= i ? 'w-8 bg-primary-dark' : 'w-4 bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
