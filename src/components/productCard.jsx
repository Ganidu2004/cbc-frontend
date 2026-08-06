import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { FiPlus, FiHeart, FiStar } from "react-icons/fi"
import { toggleWishlist, isInWishlist } from "../utils/wishlistFunction"
import toast from "react-hot-toast"

export default function ProductCard({ product, onQuickAdd }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [ratingScore, setRatingScore] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [soldCount, setSoldCount] = useState(0);

    useEffect(() => {
        const checkSaved = () => {
            setIsSaved(isInWishlist(product.productId));
        };
        checkSaved();
        window.addEventListener("aura_wishlist_updated", checkSaved);
        return () => window.removeEventListener("aura_wishlist_updated", checkSaved);
    }, [product]);

    useEffect(() => {
        const loadRealData = () => {
            // Load ONLY REAL submitted reviews across all product ID keys
            try {
                const keysToTry = [
                    product?.productId,
                    product?._id,
                    product?.id,
                    product?.productName
                ].filter(Boolean);

                let realReviews = [];
                for (const key of keysToTry) {
                    const storageKey = `aura_product_reviews_${key}`;
                    const saved = localStorage.getItem(storageKey);
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            realReviews = parsed;
                            break;
                        }
                    }
                }

                if (realReviews.length > 0) {
                    const avg = realReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / realReviews.length;
                    setRatingScore(avg);
                    setReviewCount(realReviews.length);
                } else if (product?.rating > 0) {
                    setRatingScore(Number(product.rating));
                    setReviewCount(Number(product.reviewCount || product.numReviews || (Array.isArray(product.reviews) ? product.reviews.length : 1)));
                } else {
                    setRatingScore(0);
                    setReviewCount(0);
                }
            } catch (e) {
                setRatingScore(0);
                setReviewCount(0);
            }

            // Calculate STRICT REAL Sold Count from Database Product + Real User Orders ONLY
            try {
                let totalSales = Number(product?.soldCount || product?.salesCount || product?.sold || 0);
                const savedOrders = localStorage.getItem("aura_user_orders");
                if (savedOrders) {
                    const orders = JSON.parse(savedOrders);
                    if (Array.isArray(orders)) {
                        orders.forEach(order => {
                            if (String(order.status).toLowerCase() !== 'cancelled') {
                                const items = order.orderItems || order.items || [];
                                items.forEach(item => {
                                    const itemPId = String(item.productId || item._id || item.id || '');
                                    const itemPName = String(item.name || item.productName || '').toLowerCase();
                                    const cardPId = String(product?.productId || product?._id || product?.id || '');
                                    const cardPName = String(product?.productName || '').toLowerCase();

                                    const isMatch = (
                                        (itemPId && cardPId && itemPId === cardPId) ||
                                        (itemPName && cardPName && itemPName === cardPName) ||
                                        (itemPName && cardPId && itemPName.includes(cardPId.toLowerCase())) ||
                                        (cardPName && itemPId && cardPName.includes(itemPId.toLowerCase()))
                                    );

                                    if (isMatch) {
                                        totalSales += Number(item.quentity || item.quantity || 1);
                                    }
                                });
                            }
                        });
                    }
                }
                setSoldCount(totalSales);
            } catch (e) {
                setSoldCount(Number(product?.soldCount || 0));
            }
        };

        loadRealData();
        window.addEventListener("aura_reviews_updated", loadRealData);
        window.addEventListener("aura_orders_updated", loadRealData);
        window.addEventListener("storage", loadRealData);

        return () => {
            window.removeEventListener("aura_reviews_updated", loadRealData);
            window.removeEventListener("aura_orders_updated", loadRealData);
            window.removeEventListener("storage", loadRealData);
        };
    }, [product]);

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleWishlist({
            productId: product.productId,
            name: product.productName,
            price: product.lastPrice || product.price,
            image: product.images?.[0]
        });
        if (added) {
            toast.success(`Saved "${product.productName}" to Wishlist!`);
        } else {
            toast.success(`Removed "${product.productName}" from Wishlist`);
        }
    };

    return (
        <div 
            className="w-full relative group flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/productInfo/${product.productId}`} className="relative aspect-[3/4] w-full overflow-hidden block bg-gray-50 dark:bg-gray-800 rounded-2xl">
                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
                    className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer ${
                        isSaved 
                            ? "bg-rose-500 text-white scale-110" 
                            : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-600 dark:text-gray-300 hover:bg-rose-500 hover:text-white"
                    }`}
                >
                    <FiHeart size={16} className={isSaved ? "fill-current" : ""} />
                </button>

                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered && product.hoverImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                        alt={product.productName}
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">No Image</div>
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
                        className="w-full bg-white dark:bg-gray-800 text-primary-dark dark:text-white font-medium py-3 shadow-lg hover:bg-black dark:hover:bg-accent hover:text-white flex items-center justify-center gap-2 transition-colors uppercase tracking-widest text-xs rounded-xl cursor-pointer"
                    >
                        <FiPlus size={14} /> Quick Add
                    </button>
                </div>
            </Link>

            <div className="py-4 flex flex-col gap-1 text-left">
                <h1 className="text-base font-serif text-primary-dark dark:text-white group-hover:text-accent transition-colors">
                    {product.productName}
                </h1>
                
                {/* DYNAMIC REAL RATING & STRICT DATABASE REAL SOLD COUNT DISPLAY */}
                <div className="flex items-center justify-between gap-2 text-xs my-0.5 min-h-[18px]">
                    <div className="flex items-center gap-1.5">
                        {reviewCount > 0 ? (
                            <>
                                <div className="flex text-amber-400 gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FiStar 
                                            key={star} 
                                            size={12} 
                                            className={star <= Math.round(ratingScore) ? "fill-current text-amber-400" : "text-gray-300 dark:text-gray-700"} 
                                        />
                                    ))}
                                </div>
                                <span className="font-bold text-xs text-primary-dark dark:text-white">{ratingScore.toFixed(1)}</span>
                                <span className="text-gray-400 dark:text-gray-500 text-[11px] font-medium">({reviewCount})</span>
                            </>
                        ) : (
                            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-[11px]">
                                <div className="flex text-gray-300 dark:text-gray-700 gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FiStar key={star} size={11} />
                                    ))}
                                </div>
                                <span>No reviews</span>
                            </div>
                        )}
                    </div>

                    {/* STRICT REAL DATABASE SOLD COUNT BADGE */}
                    {soldCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                            🔥 {soldCount} Sold
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full shrink-0">
                            New Arrival
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {product.lastPrice < product.price && (
                        <p className="text-sm font-light text-gray-400 dark:text-gray-500 line-through">
                            Rs. {product.price.toFixed(2)}
                        </p>
                    )}
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-200">
                        Rs. {product.lastPrice?.toFixed(2) || product.price?.toFixed(2) || '0.00'}
                    </p>
                </div>
            </div>
        </div>
    );
}
