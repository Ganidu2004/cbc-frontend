import { motion } from "framer-motion";
import { FiHeart, FiGlobe, FiShield, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function About() {
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8 }
  };

  return (
    <div className="w-full bg-primary text-primary-dark">
      
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-black">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1512496015851-a1c825b27266?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80" 
          alt="Abstract Cosmetics" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-primary" />
        
        <div className="relative z-10 text-center px-4 mt-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-accent uppercase tracking-[0.4em] text-xs font-semibold mb-6"
          >
            Behind The Brand
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-6xl md:text-8xl font-serif text-white mb-6 drop-shadow-sm"
          >
            Redefining <br className="md:hidden" /> <span className="italic font-light">Beauty.</span>
          </motion.h1>
        </div>
      </section>

      {/* The Philosophy Section (Split Layout) */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <motion.div {...fadeInUp} className="w-full md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-serif mb-8">Our Philosophy</h2>
            <div className="w-16 h-px bg-accent mb-8"></div>
            <p className="text-gray-600 font-light text-lg leading-relaxed mb-6">
              At Aura Cosmetics, we believe that beauty is not about concealing who you are, but illuminating your natural essence. We merge cutting-edge science with the purest botanical extracts to create formulas that perform flawlessly while deeply nourishing your skin.
            </p>
            <p className="text-gray-600 font-light text-lg leading-relaxed">
              Every product is a testament to our commitment to luxury without compromise—textures that feel like silk, pigments that blend like a dream, and ingredients that respect both your skin and the earth.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-full md:w-1/2 relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-sm bg-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Formulation Process"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]"
              />
            </div>
            {/* Decorative block */}
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary border border-gray-200 -z-10 hidden md:block"></div>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-white px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-6">The Aura Standard</h2>
            <p className="text-gray-500 font-light max-w-2xl mx-auto">We don't believe in shortcuts. Our core values guide every decision, from formulation to packaging.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div {...fadeInUp} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-accent mb-6">
                <FiHeart size={24} />
              </div>
              <h3 className="text-xl font-serif mb-3">Cruelty-Free</h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed">We love animals. Our products and ingredients are never tested on animals, and we proudly carry the Leaping Bunny certification.</p>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2, duration: 0.8 }} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-accent mb-6">
                <FiGlobe size={24} />
              </div>
              <h3 className="text-xl font-serif mb-3">Sustainable</h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed">Our packaging uses 80% post-consumer recycled materials, and our shipping is 100% carbon neutral to protect the planet we share.</p>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4, duration: 0.8 }} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-accent mb-6">
                <FiShield size={24} />
              </div>
              <h3 className="text-xl font-serif mb-3">Clean Ingredients</h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed">Formulated without parabens, sulfates, phthalates, or synthetic fragrances. Only what your skin needs, nothing it doesn't.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <img 
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
              className="w-full h-full object-cover"
              alt="Background texture"
           />
        </div>
        <motion.div {...fadeInUp} className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">Experience the Difference.</h2>
          <p className="text-gray-400 font-light mb-10 text-lg">
            Ready to find your perfect shade and elevate your daily ritual?
          </p>
          <Link 
            to="/product" 
            className="inline-flex bg-white text-primary-dark px-8 py-4 uppercase tracking-widest text-sm font-medium hover:bg-accent hover:text-white transition-colors items-center justify-center gap-3 group"
          >
            Shop The Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
