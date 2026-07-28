import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleDrag = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="my-16 bg-white">
      <div className="text-center mb-10">
        <h3 className="font-serif text-3xl md:text-4xl text-primary-dark mb-4">Clinically Proven Results</h3>
        <p className="text-gray-500 font-light max-w-xl mx-auto">See the visible difference after just 4 weeks of consistent use.</p>
      </div>

      <div 
        className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[600px] overflow-hidden rounded-xl shadow-lg cursor-ew-resize"
        ref={containerRef}
        onMouseDown={(e) => {
          handleDrag(e);
          window.addEventListener('mousemove', handleDrag);
          window.addEventListener('mouseup', () => {
            window.removeEventListener('mousemove', handleDrag);
          });
        }}
        onTouchMove={handleDrag}
      >
        {/* Before Image (Background) */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Before" 
            className="w-full h-full object-cover grayscale-[30%] opacity-90"
          />
          <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur text-white px-4 py-1 rounded text-sm uppercase tracking-widest font-medium">
            Before
          </div>
        </div>

        {/* After Image (Foreground, clipped) */}
        <div 
          className="absolute inset-0 h-full overflow-hidden border-r-2 border-white"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="After" 
            className="absolute top-0 left-0 w-[400px] md:w-[900px] h-full object-cover max-w-none" 
            // We force max-w-none so the image doesn't shrink when clipped.
            // In a real app with exact images, we'd use fixed width or background-image.
            style={{ width: containerRef.current?.getBoundingClientRect().width || '100%' }}
          />
          <div className="absolute bottom-6 left-6 bg-accent text-white px-4 py-1 rounded text-sm uppercase tracking-widest font-medium shadow-md">
            After 4 Weeks
          </div>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center -ml-[2px]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center gap-1 border border-gray-200">
            <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-[6px] border-r-gray-400" />
            <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] border-l-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
