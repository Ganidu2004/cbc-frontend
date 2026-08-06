import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiZap, FiStar, FiCheckCircle, FiShoppingBag, FiArrowRight, FiRotateCcw, FiLayers, FiShield, FiHeart } from "react-icons/fi";
import { addToCart } from "../../utils/cartFunction";
import toast from "react-hot-toast";

export default function RoutineBuilderModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [skinType, setSkinType] = useState("Combination");
  const [concern, setConcern] = useState("Brightening & Glow");
  const [texture, setTexture] = useState("Serum Concentrate");
  const [finish, setFinish] = useState("Radiant Dewy");

  if (!isOpen) return null;

  const skinTypes = [
    { id: "Oily", title: "Oily Skin", desc: "Excess sebum & shine" },
    { id: "Dry", title: "Dry Skin", desc: "Tightness & flakiness" },
    { id: "Combination", title: "Combination", desc: "T-zone shine & dry cheeks" },
    { id: "Sensitive", title: "Sensitive", desc: "Redness & reactivity" },
  ];

  const concerns = [
    { id: "Brightening & Glow", title: "Radiance & Vitamin C", desc: "Even skin tone & luminous glow" },
    { id: "Acne Control", title: "Blemish & Pore Control", desc: "Clear pores & soothing balance" },
    { id: "Anti-Aging", title: "Youth Collagen & Elasticity", desc: "Firming & fine-line reduction" },
    { id: "Deep Hydration", title: "Barrier Moisture Lock", desc: "24H deep cellular hydration" },
  ];

  const textures = [
    { id: "Lightweight Gel", title: "Water Gel", desc: "Fast-absorbing & zero weight" },
    { id: "Serum Concentrate", title: "Silky Serum", desc: "High potency active elixir" },
    { id: "Rich Cream", title: "Nourishing Velvet", desc: "Rich barrier recovery cream" },
  ];

  // Generated recommendations based on choices
  const getRoutineProducts = () => {
    let cleanser = { productId: "PROD-101", name: "Botanical Purifying Gentle Cleanser", price: 3400, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" };
    let serum = { productId: "PROD-102", name: "Vitamin C & Niacinamide Radiant Elixir", price: 5800, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" };
    let cream = { productId: "PROD-103", name: "Cellular Peptide Barrier Cream", price: 4600, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" };

    if (concern === "Acne Control") {
      serum = { productId: "PROD-104", name: "Salicylic & Tea Tree Blemish Serum", price: 4900, image: "https://images.unsplash.com/photo-1608248597263-00079e96447c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" };
    } else if (concern === "Anti-Aging") {
      serum = { productId: "PROD-105", name: "Retinol Bakuchiol Youth Recovery Complex", price: 6500, image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" };
    } else if (concern === "Deep Hydration") {
      serum = { productId: "PROD-106", name: "Triple Hyaluronic Acid Bio-Serum", price: 5200, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" };
    }

    return [cleanser, serum, cream];
  };

  const routineItems = getRoutineProducts();
  const rawTotal = routineItems.reduce((acc, item) => acc + item.price, 0);
  const bundleDiscount = Math.round(rawTotal * 0.15);
  const bundleTotal = rawTotal - bundleDiscount;

  const handleAddBundleToCart = () => {
    routineItems.forEach(item => {
      addToCart(item.productId, 1);
    });
    toast.success(`✨ Customized 3-Step Routine added to Cart! Saved LKR ${bundleDiscount.toLocaleString()}`);
    onClose();
  };

  const handleReset = () => {
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#161622] rounded-3xl max-w-2xl w-full border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden relative"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-primary-dark via-black to-primary-dark dark:from-[#1e1e2d] dark:to-[#12121c] p-6 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shadow-inner">
              <FiZap size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent block">AI Beauty Concierge</span>
              <h2 className="font-serif text-xl font-bold">Personalized Routine Builder</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Quiz Steps Body */}
        <div className="p-6 md:p-8 space-y-6">
          {step <= 3 && (
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium pb-2 border-b border-gray-100 dark:border-gray-800">
              <span>Step {step} of 3</span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? "w-8 bg-accent" : "w-2 bg-gray-200 dark:bg-gray-800"}`} />
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary-dark dark:text-white">What is your primary Skin Type?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skinTypes.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSkinType(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                      skinType === item.id 
                        ? "bg-accent/10 border-accent text-accent font-bold shadow-sm" 
                        : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-accent/40"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">{item.desc}</p>
                    </div>
                    {skinType === item.id && <FiCheckCircle className="text-accent shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary-dark dark:text-white">What skincare goal do you want to target?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {concerns.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setConcern(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                      concern === item.id 
                        ? "bg-accent/10 border-accent text-accent font-bold shadow-sm" 
                        : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-accent/40"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">{item.desc}</p>
                    </div>
                    {concern === item.id && <FiCheckCircle className="text-accent shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary-dark dark:text-white">Select your preferred formula texture:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {textures.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTexture(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                      texture === item.id 
                        ? "bg-accent/10 border-accent text-accent font-bold shadow-sm" 
                        : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-accent/40"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">{item.desc}</p>
                    </div>
                    {texture === item.id && <FiCheckCircle className="text-accent shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Screen */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-accent/10 via-amber-500/10 to-rose-500/10 p-5 rounded-2xl border border-accent/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-accent block">Customized Prescription</span>
                  <h4 className="font-serif font-bold text-lg text-primary-dark dark:text-white">3-Step Routine for {skinType} Skin</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Targeting: <strong>{concern}</strong></p>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    15% Bundle Savings
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {routineItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-primary-dark dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Step {idx + 1} • Daily Essential</p>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-sm text-accent">LKR {item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-sm">
                <div>
                  <span className="text-xs text-gray-400 block line-through">LKR {rawTotal.toLocaleString()}</span>
                  <span className="font-serif font-bold text-xl text-primary-dark dark:text-white">Bundle Total: LKR {bundleTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleAddBundleToCart}
                  className="px-6 py-3 bg-primary-dark dark:bg-accent text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <FiShoppingBag /> Add Routine to Cart
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 dark:bg-gray-900/60 p-4 px-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="text-gray-500 dark:text-gray-400 hover:text-primary-dark dark:hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <span className="text-gray-400 text-[11px]">Designed by Aura Dermatological Labs</span>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="px-5 py-2.5 bg-primary-dark dark:bg-accent text-white rounded-xl font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              Next <FiArrowRight />
            </button>
          ) : step === 3 ? (
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 bg-accent text-white rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-md"
            >
              Generate My Routine <FiZap />
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-accent font-medium flex items-center gap-1 cursor-pointer"
            >
              <FiRotateCcw /> Retake Quiz
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
