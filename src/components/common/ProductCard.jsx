import { Link } from "react-router-dom"
import { useState } from "react"
import { FiPlus } from "react-icons/fi"

export default function ProductCard({ product, onQuickAdd }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="w-full relative group flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/productInfo/${product.productId}`} className="relative aspect-[3/4] w-full overflow-hidden block bg-gray-50">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered && product.hoverImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                        alt={product.productName}
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                )}
                {product.hoverImage && (
                    <img
                        src={product.hoverImage}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                        alt={`${product.productName} swatch`}
                    />
                )}

                {/* Subtle gradient on hover to ensure button visibility */}
                <div className={`absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                {/* Quick Add Button (appears on hover) */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'}`}>
                    <button 
                        onClick={(e) => {
                            e.preventDefault(); // prevent Link navigation
                            onQuickAdd();
                        }}
                        className="w-full bg-white text-primary-dark font-medium py-3 shadow-lg hover:bg-black hover:text-white flex items-center justify-center gap-2 transition-colors uppercase tracking-widest text-xs"
                    >
                        <FiPlus size={14} /> Quick Add
                    </button>
                </div>
            </Link>

            <div className="py-5 flex flex-col gap-1 text-left">
                <h1 className="text-lg font-serif text-primary-dark group-hover:text-accent transition-colors">
                    {product.productName}
                </h1>
                
                <div className="flex items-center gap-3 mt-1">
                    {product.lastPrice < product.price && (
                        <p className="text-sm font-light text-gray-400 line-through">
                            Rs. {product.price.toFixed(2)}
                        </p>
                    )}
                    <p className="text-sm font-medium text-gray-600">
                        Rs. {product.lastPrice?.toFixed(2) || product.price?.toFixed(2) || '0.00'}
                    </p>
                </div>
            </div>
        </div>
    );
}
