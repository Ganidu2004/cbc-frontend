import React, { useRef } from 'react';
import { FiShoppingBag, FiPlay } from 'react-icons/fi';
import { motion } from 'framer-motion';

const reels = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1512496015851-a1c825b27266?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    user: '@skinglow',
    product: 'Dewy Finish Setting Spray',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    user: '@glamguru',
    product: 'Satin Lip Tint',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    user: '@beautyby_j',
    product: 'Luminous Foundation',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1542452255191-c85a98f2cb85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    user: '@makeup_art',
    product: 'Highlight & Contour Duo',
  }
];

const ReelCard = ({ reel }) => {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div 
      className="relative min-w-[220px] sm:min-w-[260px] md:min-w-[320px] h-[400px] sm:h-[450px] md:h-[550px] snap-center rounded-lg overflow-hidden group cursor-pointer bg-gray-900"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={reel.video}
        poster={reel.image}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-linear scale-100 group-hover:scale-110"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
      
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm p-2 rounded-full opacity-100 group-hover:bg-accent transition-colors">
        <FiPlay size={16} className="text-white" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3">
        <span className="text-sm font-medium text-white/90">{reel.user}</span>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white/10 backdrop-blur-md border border-white/30 p-3 rounded flex items-center justify-between hover:bg-white/20 transition-colors"
        >
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase tracking-wider text-accent-light">Shop</span>
            <span className="text-sm font-semibold">{reel.product}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white text-primary-dark flex items-center justify-center">
            <FiShoppingBag size={14} />
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default function ShoppableReel() {
  const scrollRef = useRef(null);

  // In a real app, we would handle intersection observers to auto-play only the visible videos.
  // For UI reliability, we are using high-quality images with a slow zoom to simulate the 'reel' feel.
  
  return (
    <div className="py-24 bg-primary-dark text-white">
      <div className="px-4 md:px-12 mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl md:text-5xl font-serif mb-2">Shop The Look</h2>
          <p className="text-gray-400 font-light">Real results from our community.</p>
        </div>
        <button className="hidden md:block underline text-sm tracking-widest uppercase hover:text-accent transition-colors">
          View Gallery
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-12 pb-8 snap-x snap-mandatory no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </div>
  );
}
