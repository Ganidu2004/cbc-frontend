import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function HeroBanner() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-primary-dark">
      {/* Background Image with slow scale (parallax-like feel) */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80" 
          alt="Luxury Skincare"
          className="w-full h-full object-cover"
        />
        {/* Gradients to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-transparent to-black/30" />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-32">
        <div className="max-w-2xl mt-12 md:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-px w-12 bg-accent"></div>
            <span className="text-accent uppercase tracking-[0.3em] text-sm font-semibold">New Collection</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight mb-6"
          >
            Aura of <br />
            <span className="italic font-light text-primary">Elegance.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-gray-300 text-lg md:text-xl font-light mb-10 max-w-lg leading-relaxed"
          >
            Discover the spring collection, featuring luminous textures and deeply hydrating formulas designed to awaken your natural radiance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <button 
              onClick={() => navigate('/product')}
              className="bg-white text-primary-dark px-8 py-4 uppercase tracking-widest text-sm font-medium hover:bg-accent hover:text-white transition-colors flex items-center justify-center gap-3 group"
            >
              Explore Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="border border-white/30 text-white px-8 py-4 uppercase tracking-widest text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              Our Story
            </button>
          </motion.div>
        </div>
      </div>

      {/* Decorative vertical text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-6 rotate-90 origin-right"
      >
        <span className="text-white/50 text-xs uppercase tracking-[0.4em]">Est. 2026</span>
        <div className="w-16 h-px bg-white/30"></div>
        <span className="text-white/50 text-xs uppercase tracking-[0.4em]">Cruelty Free</span>
      </motion.div>
    </div>
  );
}
