import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImgeSlider(props) {
    const images = props.images || [];
    const [activeImage, setActiveImage] = useState(0);

    if (images.length === 0) return null;

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Main Image Container */}
            <div className="relative w-full aspect-[4/5] md:aspect-square overflow-hidden rounded-2xl bg-gray-50 shadow-sm border border-gray-100">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeImage}
                        src={images[activeImage]}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt={`Product View ${activeImage + 1}`}
                    />
                </AnimatePresence>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="flex items-center gap-4 overflow-x-auto py-2 no-scrollbar">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveImage(index)}
                            className={`relative shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${
                                activeImage === index 
                                    ? "w-20 h-20 ring-2 ring-primary-dark ring-offset-2 opacity-100 shadow-md" 
                                    : "w-16 h-16 opacity-60 hover:opacity-100 hover:scale-105"
                            }`}
                        >
                            <img 
                                src={image} 
                                className="w-full h-full object-cover"
                                alt={`Thumbnail ${index + 1}`}
                            />
                            {/* Subtle overlay for inactive states */}
                            {activeImage !== index && (
                                <div className="absolute inset-0 bg-white/20 transition-opacity hover:opacity-0" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}