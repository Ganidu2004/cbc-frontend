import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import ProductCard from "../../components/common/ProductCard"
import QuickAddDrawer from "../../components/common/QuickAddDrawer"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiX, FiStar, FiShield, FiTruck, FiFilter } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { addToCart } from "../../utils/cartFunction"

const CATEGORIES = ["All", "Face", "Eyes", "Lips", "Skincare", "Body & Nails"];

const FILTERS = {
  skinType: ['Dry', 'Oily', 'Sensitive'],
  finish: ['Matte', 'Dewy', 'Satin']
}

export default function ProductPage(){
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [loadingStatus, setLoadingStatus] = useState("loading")
    const [activeCategory, setActiveCategory] = useState("All")
    const [activeFilters, setActiveFilters] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [quickAddProduct, setQuickAddProduct] = useState(null)

    useEffect(() => {
        axios.get(import.meta.env.VITE_BACKEND_URL + "/api/product")
        .then((res) => {
            if(res.data && res.data.length > 0){
                setProducts(res.data)
                setLoadingStatus("loaded")
            } else {
                setLoadingStatus("error")
            }
        })
        .catch((err) => {
            console.error("Failed to fetch products:", err)
            setLoadingStatus("error")
        })
    }, [])

    const toggleFilter = (filterName) => {
        setActiveFilters(prev => 
            prev.includes(filterName) 
                ? prev.filter(f => f !== filterName) 
                : [...prev, filterName]
        )
    }

    const filteredProducts = products.filter(product => {
        // 1. Category Filter (Primary Tab)
        if (activeCategory !== "All" && product.category !== activeCategory) {
            return false;
        }

        // 2. Attribute Filters (Toggles)
        if (activeFilters.length > 0) {
            const matchesFilter = activeFilters.some(filter => 
                product.skinType === filter || 
                product.finish === filter
            );
            if (!matchesFilter) return false;
        }

        // 3. Search Query
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
                product.productName?.toLowerCase().includes(query) ||
                product.altName?.some(name => name.toLowerCase().includes(query)) ||
                product.description?.toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }

        return true;
    });

    return(
        <div className="w-full min-h-screen bg-primary pb-24">
            
            {/* Luxury Creative Hero Header */}
            <div className="relative w-full h-[55vh] md:h-[65vh] bg-primary-dark dark:bg-[#0d0d14] overflow-hidden flex items-center justify-center">
                {/* Background Hero Image */}
                <motion.img 
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 2.5, ease: "easeOut" }}
                  src="https://images.unsplash.com/photo-1599305090598-fe179d501227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                  alt="Shop Hero" 
                  className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity"
                />
                
                {/* Glowing Ambient Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-rose-500/20 pointer-events-none" />
                
                <div className="relative z-10 text-center mt-16 px-4 max-w-3xl mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[11px] font-bold uppercase tracking-[0.25em] mb-4 shadow-lg backdrop-blur-md"
                    >
                        <FiStar size={14} className="text-amber-400 fill-current" /> Aura Luxury Collection 2026
                    </motion.div>
                    
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-4xl sm:text-6xl md:text-7xl font-serif text-primary-dark dark:text-white mb-4 drop-shadow-md tracking-tight"
                    >
                        The Master Collection
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto font-light text-sm md:text-base leading-relaxed"
                    >
                        Handcrafted formulas designed to nourish, protect, and reveal your skin's authentic inner luminosity.
                    </motion.p>

                    {/* Luxury Badges Strip */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-8 text-[11px] font-semibold tracking-wider text-gray-700 dark:text-gray-300 uppercase"
                    >
                        <span className="flex items-center gap-1.5"><FiShield className="text-emerald-500" size={15} /> 100% Authentic</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-accent hidden md:inline-block" />
                        <span className="flex items-center gap-1.5"><FiStar className="text-amber-400 fill-current" size={15} /> Dermatologist Approved</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-accent hidden md:inline-block" />
                        <span className="flex items-center gap-1.5"><FiTruck className="text-accent" size={15} /> Express Dispatch</span>
                    </motion.div>
                </div>
            </div>

            {/* Creative Glassmorphic Category Bar (Sticky) */}
            <div className="sticky top-[72px] md:top-[80px] z-40 bg-white/80 dark:bg-[#151520]/80 border-b border-gray-200/80 dark:border-gray-800/80 backdrop-blur-2xl shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-center py-3.5 gap-4">
                    
                    {/* Categories Tabs */}
                    <div className="flex space-x-2 md:space-x-3 overflow-x-auto w-full md:w-auto no-scrollbar scroll-smooth p-1">
                        {CATEGORIES.map(category => {
                            const isActive = activeCategory === category;
                            return (
                                <button 
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`relative px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-full flex items-center select-none whitespace-nowrap cursor-pointer ${
                                        isActive 
                                            ? "text-white" 
                                            : "text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-white"
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeCategoryPill"
                                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                                            className="absolute inset-0 bg-primary-dark dark:bg-accent rounded-full shadow-md shadow-accent/20 z-0"
                                        />
                                    )}
                                    <span className="relative z-10">{category}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72 shrink-0">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search formulation, shade..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 rounded-full text-xs text-primary-dark dark:text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                            >
                                <FiX size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sub-Filters Bar (Attributes) */}
            <div className="bg-white/40 dark:bg-[#121218]/40 border-b border-gray-100 dark:border-gray-800/50 py-4 px-4 md:px-12 mb-8 md:mb-10 overflow-x-auto no-scrollbar">
                <div className="max-w-7xl mx-auto flex flex-nowrap md:flex-wrap gap-3 md:gap-4 items-center min-w-max md:min-w-0 justify-start">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 mr-2">
                        <FiFilter size={14} className="text-accent" /> Filter By:
                    </div>

                    {Object.entries(FILTERS).map(([category, options]) => (
                        <div key={category} className="flex gap-1.5 items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-full border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-400 pl-3 pr-2 border-r border-gray-200 dark:border-gray-700">
                                {category.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            {options.map(opt => {
                                const isSelected = activeFilters.includes(opt);
                                return (
                                    <button 
                                        key={opt}
                                        onClick={() => toggleFilter(opt)}
                                        className={`px-3.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                                            isSelected 
                                                ? 'bg-accent text-white shadow-sm shadow-accent/25' 
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                    
                    {activeFilters.length > 0 && (
                        <button 
                            onClick={() => setActiveFilters([])} 
                            className="text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider ml-2 cursor-pointer transition-colors"
                        >
                            Reset Filters ({activeFilters.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Product Grid */}
            <div className="w-full max-w-7xl mx-auto px-4 md:px-12">
                
                {filteredProducts.length === 0 && loadingStatus === "loaded" ? (
                    <div className="text-center py-20 bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800 backdrop-blur-xl">
                        <p className="text-xl font-serif text-primary-dark dark:text-white mb-2 font-bold">No formulations match your search</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">Try adjusting your filters, selecting a different category, or searching another key ingredient.</p>
                        <button 
                            onClick={() => {setActiveCategory("All"); setActiveFilters([]); setSearchQuery("");}} 
                            className="px-6 py-3 bg-accent text-white text-xs uppercase tracking-widest font-bold rounded-2xl hover:bg-accent/80 transition-all shadow-lg shadow-accent/20 cursor-pointer"
                        >
                            Clear All Filters & Reset View
                        </button>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10"
                    >
                        {filteredProducts.map((product) =>
                            <ProductCard 
                                key={product.productId} 
                                product={product} 
                                onQuickAdd={() => {
                                    const token = localStorage.getItem("token");
                                    if (!token) {
                                        toast.error("Please register/sign in to receive an invoice.");
                                        navigate("/login");
                                        return;
                                    }
                                    const pId = product.productId || product._id || product.id;
                                    addToCart(pId, 1);
                                    setQuickAddProduct(product);
                                    toast.success(product.productName + " added to bag!");
                                }} 
                            />
                        )}
                    </motion.div>
                )}
            </div>

            {/* Slide-over Quick Add Drawer */}
            <QuickAddDrawer 
                isOpen={!!quickAddProduct} 
                onClose={() => setQuickAddProduct(null)} 
                product={quickAddProduct} 
            />
        </div>
    )
}