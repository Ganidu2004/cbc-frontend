import { motion } from "framer-motion";
import { FiMapPin, FiMail, FiPhone, FiArrowRight, FiUser } from "react-icons/fi";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  // Pre-fill form with authenticated user's data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const user = res.data;
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || ''
      }));
      setUserLoaded(true);
    })
    .catch(err => console.error("Failed to fetch profile", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Thank you! Your message has been sent.");
      setFormData(prev => ({ ...prev, message: '' }));
      setIsSubmitting(false);
    }, 1500);
  };


  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  return (
    <div className="w-full min-h-screen bg-primary">
      
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] flex items-center justify-center overflow-hidden bg-primary-dark">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80" 
          alt="Contact Us" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
        
        <div className="relative z-10 text-center px-4 mt-20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif text-primary-dark mb-4 drop-shadow-sm"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-gray-600 font-light tracking-wide max-w-lg mx-auto"
          >
            We're here to assist you with personalized recommendations, order inquiries, or anything else you may need.
          </motion.p>
        </div>
      </section>

      {/* Main Content Split */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto -mt-16 relative z-20">
        <div className="flex flex-col lg:flex-row gap-0 shadow-2xl rounded-sm overflow-hidden bg-white">
          
          {/* Left: Contact Info */}
          <div className="w-full lg:w-1/3 bg-primary-dark text-white p-12 md:p-16 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-serif mb-2">Our Boutiques</h2>
              <p className="text-white/60 font-light text-sm mb-12">Experience Aura Cosmetics in person.</p>
              
              <div className="space-y-8">
                <div className="flex gap-4 items-start">
                  <FiMapPin className="text-accent shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-serif text-lg mb-1">New York Flagship</h3>
                    <p className="text-white/60 font-light text-sm leading-relaxed">
                      125 5th Avenue, Suite 300<br />
                      New York, NY 10003
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <FiPhone className="text-accent shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-serif text-lg mb-1">Phone</h3>
                    <p className="text-white/60 font-light text-sm leading-relaxed">
                      +1 (555) 123-4567<br />
                      Mon-Fri, 9am - 6pm EST
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <FiMail className="text-accent shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-serif text-lg mb-1">Email</h3>
                    <p className="text-white/60 font-light text-sm leading-relaxed">
                      concierge@auracosmetics.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16">
              <div className="h-px w-full bg-white/20 mb-6"></div>
              <p className="text-white/40 text-xs tracking-widest uppercase font-semibold">Follow Us</p>
              <div className="flex gap-6 mt-4 text-white/60">
                <a href="#" className="hover:text-accent transition-colors text-sm uppercase tracking-wider">Instagram</a>
                <a href="#" className="hover:text-accent transition-colors text-sm uppercase tracking-wider">TikTok</a>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="w-full lg:w-2/3 p-12 md:p-16 bg-white">
            <h2 className="text-3xl font-serif text-primary-dark mb-2">Send a Message</h2>
            <div className="flex items-center justify-between mb-10">
              <p className="text-gray-500 font-light text-sm">Our beauty advisors typically respond within 24 hours.</p>
              {userLoaded && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                  <FiUser size={11} /> Auto-filled from your profile
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full bg-transparent border-b py-3 text-primary-dark focus:outline-none focus:border-primary-dark transition-colors ${userLoaded && formData.name ? 'border-green-400' : 'border-gray-300'}`}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full bg-transparent border-b py-3 text-primary-dark focus:outline-none focus:border-primary-dark transition-colors ${userLoaded && formData.email ? 'border-green-400' : 'border-gray-300'}`}
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Message</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="4"
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-primary-dark focus:outline-none focus:border-primary-dark transition-colors resize-none" 
                  placeholder="How can we help you today?"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-dark text-white px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'} <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}
