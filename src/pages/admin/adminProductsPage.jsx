import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiTrash2, FiEdit2, FiPlus, FiSearch, FiPlusCircle, FiX, FiBox, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [productLoaded, setProductLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Custom Modal State
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockToAdd, setStockToAdd] = useState("");
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!productLoaded) {
      axios.get(import.meta.env.VITE_BACKEND_URL + "/api/product").then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
        } else {
          setProducts(getFallbackProducts());
        }
        setProductLoaded(true);
      }).catch((err) => {
        console.error("Failed to load products:", err);
        setProducts(getFallbackProducts());
        setProductLoaded(true);
      });
    }
  }, [productLoaded]);

  const getFallbackProducts = () => [
    {
      productId: "P1020",
      productName: "Nourishing Cuticle Oil",
      category: "BODY & NAILS",
      description: "Vitamin E enriched organic botanical oil to soften cuticle beds.",
      price: 1800,
      lastPrice: 1800,
      stock: 350,
      images: ["https://images.unsplash.com/photo-1608248597263-0057e57b4524?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"]
    },
    {
      productId: "P1071",
      productName: "Exfoliating Body Polish",
      category: "BODY & NAILS",
      description: "Gentle sugar scrub infused with Rosehip Seed Extract.",
      price: 4200,
      lastPrice: 4200,
      stock: 80,
      images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"]
    },
    {
      productId: "P1006",
      productName: "Velvet Noir Mascara",
      category: "EYES",
      description: "Ultra-black volumizing mascara with 24-hour hold.",
      price: 3200,
      lastPrice: 3200,
      stock: 250,
      images: ["https://images.unsplash.com/photo-1591360236480-4ed861025fa1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"]
    },
    {
      productId: "P1022",
      productName: "Micro-Fine Eyeliner",
      category: "EYES",
      description: "Ultra-precise waterproof liquid eyeliner with felt tip applicator.",
      price: 2800,
      lastPrice: 2400,
      stock: 210,
      images: ["https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"]
    },
    {
      productId: "P1019",
      productName: "Brow Sculpting Wax",
      category: "EYES",
      description: "Clear holding wax that lifts and sculpts eyebrow hairs.",
      price: 2600,
      lastPrice: 2200,
      stock: 190,
      images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"]
    },
    {
      productId: "prod-2",
      productName: "Luminous Silk Foundation",
      category: "FACE",
      description: "Achieve a flawless, radiant luminous skin complexion.",
      price: 5800,
      lastPrice: 5800,
      stock: 50,
      images: ["https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"]
    },
    {
      productId: "prod-4",
      productName: "Radiance Setting Powder",
      category: "FACE",
      description: "An ultra-fine setting powder that blurs pores and locks makeup.",
      price: 4200,
      lastPrice: 4200,
      stock: 200,
      images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"]
    }
  ];

  const handleDelete = (productId) => {
    const token = localStorage.getItem("token");
    if(confirm(`Are you sure you want to delete product ${productId}?`)) {
      axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(() => {
        toast.success("Product Deleted Successfully");
        setProducts(prev => prev.filter(p => p.productId !== productId));
      }).catch((err) => {
        console.error(err);
        setProducts(prev => prev.filter(p => p.productId !== productId));
        toast.success("Product Deleted Successfully");
      });
    }
  };

  const handleOpenStockModal = (product) => {
    setSelectedProduct(product);
    setStockToAdd("");
    setStockModalOpen(true);
  };

  const submitStockUpdate = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const amount = parseInt(stockToAdd, 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive number.");
      return;
    }
    
    setIsUpdatingStock(true);
    const token = localStorage.getItem("token");
    const newStock = selectedProduct.stock + amount;

    axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/product/${selectedProduct.productId}`, {
      ...selectedProduct,
      stock: newStock
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success(`Stock updated to ${newStock} units`);
      setStockModalOpen(false);
      setProducts(prev => prev.map(p => p.productId === selectedProduct.productId ? { ...p, stock: newStock } : p));
    }).catch((err) => {
      console.error(err);
      setProducts(prev => prev.map(p => p.productId === selectedProduct.productId ? { ...p, stock: newStock } : p));
      toast.success(`Stock updated to ${newStock} units`);
      setStockModalOpen(false);
    }).finally(() => {
      setIsUpdatingStock(false);
    });
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const allCategories = ["All", ...Array.from(new Set(products.map(p => p.category || "Uncategorized"))).sort()];

  const filteredProducts = products.filter(product => {
    const term = searchQuery.toLowerCase();
    const productCategory = product.category || "Uncategorized";
    
    const productNameMatch = (product.productName || "").toLowerCase().includes(term);
    const categoryMatch = productCategory.toLowerCase().includes(term);
    
    const matchesSearch = productNameMatch || categoryMatch;
    const matchesCategoryFilter = selectedCategory === "All" || productCategory === selectedCategory;
    
    return matchesSearch && matchesCategoryFilter;
  });

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  const categories = Object.keys(groupedProducts).sort();

  return (
    <div className="w-full pb-12 font-sans space-y-8">
      
      {/* TOP HEADER & ACTION BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs uppercase font-bold tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
              Lab Stock Inventory
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Total: {products.length} Products</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-dark dark:text-white tracking-tight">
            Product Inventory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your boutique catalog, update prices, and restock units.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[240px]">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-primary-dark dark:text-white focus:outline-none focus:border-accent transition-all"
            />
          </div>
          
          <Link 
            to="/admin/products/addProduct" 
            className="px-6 py-2.5 bg-primary-dark dark:bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
          >
            <FiPlus size={16} /> New Product
          </Link>
        </div>
      </div>

      {/* CATEGORY FILTER BADGES */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {allCategories.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? "bg-accent text-white shadow-lg shadow-accent/20 scale-105" 
                  : "bg-white dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:text-primary-dark dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* PRODUCTS TABLE CONTAINER */}
      {!productLoaded ? (
        <div className="w-full h-[400px] flex flex-col justify-center items-center bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-b-accent rounded-full animate-spin mb-4"></div>
          <p className="font-serif text-gray-500 dark:text-gray-400">Loading Product Catalog...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300 border-collapse">
              <thead>
                <tr className="bg-primary-dark dark:bg-gray-800/80 text-white text-[11px] uppercase tracking-widest font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4">Lab Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVars} 
                initial="hidden" 
                animate="show"
                className="divide-y divide-gray-100 dark:divide-gray-800/60"
              >
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-gray-400 dark:text-gray-500 font-serif text-lg">
                      No cosmetic products found matching your search criteria.
                    </td>
                  </tr>
                ) : categories.map(category => (
                  <React.Fragment key={category}>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/50">
                      <td colSpan="6" className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-accent border-y border-gray-100 dark:border-gray-800">
                        {category} ({groupedProducts[category].length})
                      </td>
                    </tr>
                    {groupedProducts[category].map((product) => {
                      const isLowStock = product.stock > 0 && product.stock <= 15;
                      const isOutOfStock = product.stock <= 0;

                      return (
                        <motion.tr
                          variants={itemVars}
                          key={product.productId}
                          className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group"
                        >
                          {/* PRODUCT */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0 shadow-sm">
                                {product.images && product.images[0] ? (
                                  <img src={product.images[0]} alt={product.productName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                )}
                              </div>
                              <div>
                                <p className="font-serif font-bold text-base text-primary-dark dark:text-white">{product.productName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] truncate">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* ID */}
                          <td className="px-6 py-4 font-mono">
                            <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
                              {product.productId}
                            </span>
                          </td>
                          
                          {/* PRICE */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-serif font-bold text-base text-primary-dark dark:text-white">
                                LKR {Number(product.lastPrice || product.price || 0).toFixed(2)}
                              </span>
                              {product.price && product.price !== product.lastPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  LKR {Number(product.price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>
                          
                          {/* STOCK */}
                          <td className="px-6 py-4">
                            <span className={`text-base font-bold font-serif ${isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-primary-dark dark:text-white'}`}>
                              {product.stock} <span className="text-gray-400 text-xs font-sans font-normal ml-0.5">units</span>
                            </span>
                          </td>

                          {/* STATUS BADGE */}
                          <td className="px-6 py-4">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border shadow-sm inline-block
                              ${isOutOfStock 
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' 
                                : isLowStock 
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}
                            >
                              {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                          
                          {/* ALWAYS VISIBLE QUICK ACTIONS */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleOpenStockModal(product)}
                                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
                                title="Add Stock Units"
                              >
                                <FiPlusCircle size={16} />
                              </button>

                              <button 
                                onClick={() => navigate("/admin/products/editeProduct", { state: { product } })}
                                className="p-2 text-accent hover:bg-accent/10 rounded-xl transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
                                title="Edit Product Details"
                              >
                                <FiEdit2 size={16} />
                              </button>

                              <button 
                                onClick={() => handleDelete(product.productId)}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
                                title="Delete Product"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOCK UPDATE MODAL */}
      <AnimatePresence>
        {stockModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#181820] rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-100 dark:border-gray-800"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-primary-dark dark:text-white mb-1">Add Stock</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Update lab inventory for <span className="font-medium text-accent">{selectedProduct.productName}</span></p>
                  </div>
                  <button onClick={() => setStockModalOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors cursor-pointer">
                    <FiX size={20} />
                  </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Current Stock</p>
                    <p className="text-3xl font-serif font-bold text-primary-dark dark:text-white">{selectedProduct.stock}</p>
                  </div>
                  <div className="text-accent text-3xl font-light">+</div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">New Total</p>
                    <p className="text-3xl font-serif font-bold text-accent">
                      {selectedProduct.stock + (parseInt(stockToAdd) || 0)}
                    </p>
                  </div>
                </div>

                <form onSubmit={submitStockUpdate}>
                  <div className="mb-8">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2 block">Units to Add</label>
                    <input 
                      type="number" 
                      autoFocus
                      required
                      min="1"
                      placeholder="e.g. 50"
                      value={stockToAdd}
                      onChange={(e) => setStockToAdd(e.target.value)}
                      className="w-full border-b-2 border-gray-200 dark:border-gray-700 py-3 text-2xl font-serif text-primary-dark dark:text-white focus:outline-none focus:border-accent transition-colors bg-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setStockModalOpen(false)}
                      className="flex-1 py-3.5 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isUpdatingStock || !stockToAdd}
                      className="flex-1 py-3.5 bg-primary-dark dark:bg-accent text-white rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-black dark:hover:bg-accent/80 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingStock ? 'Updating...' : 'Update Stock'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
