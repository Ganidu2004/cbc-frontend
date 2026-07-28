import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import ProductCard from "../../components/common/ProductCard"
import QuickAddDrawer from "../../components/common/QuickAddDrawer"
import { motion } from "framer-motion"
import { FiSearch } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

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
        if(loadingStatus === "loading"){
            axios.get(import.meta.env.VITE_BACKEND_URL+'/api/product').then(
                (res) => {
                    if (res.data && res.data.length > 0) {
                        setProducts(res.data)
                    }
                    setLoadingStatus("loaded")
                }
            ).catch(() => {
                toast.error("Failed to fetch product");
                setLoadingStatus("loaded");
            })
        }
    }, [])

    const toggleFilter = (filter) => {
        if (activeFilters.includes(filter)) {
            setActiveFilters(activeFilters.filter(f => f !== filter))
        } else {
            setActiveFilters([...activeFilters, filter])
        }
    }

    const filteredProducts = products.filter(product => {
        // 1. Category Filter (Primary Tab)
        if (activeCategory !== "All" && product.category !== activeCategory) {
            return false;
        }

        // 2. Attribute Filters (Toggles)
        if (activeFilters.length > 0) {
            // Check if product matches ANY of the selected activeFilters
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
            
            {/* Hero Header for Shop */}
            <div className="relative w-full h-[50vh] md:h-[60vh] bg-primary-dark overflow-hidden flex items-center justify-center">
                <motion.img 
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 2 }}
                  src="https://images.unsplash.com/photo-1599305090598-fe179d501227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                  alt="Shop Hero" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
                
                <div className="relative z-10 text-center mt-16 px-4">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="flex items-center justify-center gap-4 mb-4"
                    >
                        <div className="h-px w-8 bg-accent"></div>
                        <span className="text-accent uppercase tracking-[0.3em] text-xs font-semibold">Shop The Look</span>
                        <div className="h-px w-8 bg-accent"></div>
                    </motion.div>
                    
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-5xl md:text-7xl font-serif text-primary-dark mb-4 drop-shadow-sm"
                    >
                        The Collection
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-gray-600 max-w-lg mx-auto font-light"
                    >
                        Curated essentials for a flawless, radiant complexion.
                    </motion.p>
                </div>
            </div>

            {/* Category Navigation (Sticky) */}
            <div className="sticky top-[80px] z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-center py-4 gap-4">
                    <div className="flex space-x-8 overflow-x-auto w-full md:w-auto">
                        {CATEGORIES.map(category => (
                            <button 
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`whitespace-nowrap text-sm font-semibold uppercase tracking-widest transition-colors ${activeCategory === category ? 'text-primary-dark border-b-2 border-primary-dark pb-1' : 'text-gray-400 hover:text-primary-dark pb-1 border-b-2 border-transparent'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64 shrink-0">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-dark focus:ring-1 focus:ring-primary-dark transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Sub-Filters Bar (Attributes) */}
            <div className="bg-primary/90 backdrop-blur-md py-6 px-4 md:px-12 mb-10">
                <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-center md:justify-start">
                    {Object.entries(FILTERS).map(([category, options]) => (
                        <div key={category} className="flex gap-2 items-center bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-gray-200">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 pl-4 pr-2 border-r border-gray-300">
                                {category.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            {options.map(opt => (
                                <button 
                                    key={opt}
                                    onClick={() => toggleFilter(opt)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilters.includes(opt) ? 'bg-primary-dark text-white' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    ))}
                    
                    {activeFilters.length > 0 && (
                        <button onClick={() => setActiveFilters([])} className="text-xs text-gray-500 hover:text-primary-dark underline underline-offset-4 font-medium ml-4">
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Product Grid */}
            <div className="w-full max-w-7xl mx-auto px-4 md:px-12">
                
                {filteredProducts.length === 0 && loadingStatus === "loaded" ? (
                    <div className="text-center py-20">
                        <p className="text-xl font-serif text-primary-dark mb-2">No products found</p>
                        <p className="text-gray-500">Try adjusting your filters, category selection, or search query.</p>
                        <button onClick={() => {setActiveCategory("All"); setActiveFilters([]); setSearchQuery("");}} className="mt-6 px-6 py-2 bg-primary-dark text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-black transition-colors">Clear All Filters</button>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16"
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
                                    setQuickAddProduct(product)
                                }} 
                            />
                        )}
                    </motion.div>
                )}
            </div>

            {/* Slide-over Drawer */}
            <QuickAddDrawer 
                isOpen={!!quickAddProduct} 
                onClose={() => setQuickAddProduct(null)} 
                product={quickAddProduct} 
            />
        </div>
    )
}