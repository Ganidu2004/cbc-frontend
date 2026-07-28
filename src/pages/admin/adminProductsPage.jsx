import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiTrash2, FiEdit2, FiPlus, FiSearch, FiPlusCircle, FiX } from "react-icons/fi";
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
        setProducts(res.data);
        setProductLoaded(true);
      }).catch((err) => {
        console.error("Failed to load products:", err);
        toast.error("Failed to load products");
        setProductLoaded(true); // Stop loading spinner so we can see what happens
      });
    }
  }, [productLoaded]);

  const handleDelete = (productId) => {
    const token = localStorage.getItem("token");
    if(confirm("Are you sure you want to delete this product?")) {
      axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(() => {
        toast.success("Product Deleted Successfully");
        setProductLoaded(false);
      }).catch((err) => {
        toast.error("Failed to delete product");
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
    const updatedProductData = {
      ...selectedProduct,
      stock: selectedProduct.stock + amount
    };

    axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/product/${selectedProduct.productId}`, updatedProductData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success("Stock updated successfully");
      setStockModalOpen(false);
      setProductLoaded(false); // Reload products
    }).catch((err) => {
      console.error(err);
      toast.error("Failed to update stock");
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

  // Get all unique categories for the filter buttons
  const allCategories = ["All", ...Array.from(new Set(products.map(p => p.category || "Uncategorized"))).sort()];

  // Filter products based on search query and selected category
  const filteredProducts = products.filter(product => {
    const term = searchQuery.toLowerCase();
    const productCategory = product.category || "Uncategorized";
    
    const productNameMatch = product.productName?.toLowerCase().includes(term);
    const categoryMatch = productCategory.toLowerCase().includes(term);
    
    const matchesSearch = productNameMatch || categoryMatch;
    const matchesCategoryFilter = selectedCategory === "All" || productCategory === selectedCategory;
    
    return matchesSearch && matchesCategoryFilter;
  });

  // Group products by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  const categories = Object.keys(groupedProducts).sort();

  return (
    <div className="w-full min-h-full pb-10 text-primary-dark">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-1">Product Inventory</h1>
          <p className="text-gray-500 text-sm font-light">Manage your catalog, update pricing, and monitor stock levels.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-dark transition-colors bg-white shadow-sm"
            />
          </div>
          <Link 
            to="/admin/products/addProduct" 
            className="bg-primary-dark text-white px-6 py-2.5 text-sm uppercase tracking-widest font-medium hover:bg-black transition-colors rounded-sm shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <FiPlus size={18} /> New Product
          </Link>
        </div>
      </div>

      {/* Content Section */}
      {!productLoaded ? (
        <div className="w-full h-[400px] flex justify-center items-center">
          <div className="w-[40px] h-[40px] border-[3px] border-gray-200 border-b-primary-dark rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Category Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? "bg-primary-dark text-white shadow-sm" 
                    : "bg-white text-gray-500 border border-gray-200 hover:border-primary-dark hover:text-primary-dark"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-8 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVars} initial="hidden" animate="show"
              >
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400">No products match your search criteria.</td>
                  </tr>
                ) : categories.map(category => (
                  <React.Fragment key={category}>
                    <tr className="bg-primary/5">
                      <td colSpan="6" className="px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-dark border-b border-gray-100">
                        {category}
                      </td>
                    </tr>
                    {groupedProducts[category].map((product) => (
                      <motion.tr
                        variants={itemVars}
                        key={product.productId}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-8 py-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                            )}
                          </div>
                          <div>
                            <p className="font-serif text-base text-primary-dark">{product.productName}</p>
                            <p className="text-xs text-gray-400 max-w-[200px] truncate">{product.description}</p>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">{product.productId}</span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-primary-dark">Rs. {product.lastPrice?.toFixed(2)}</span>
                            {product.price !== product.lastPrice && (
                              <span className="text-xs text-gray-400 line-through">Rs. {product.price?.toFixed(2)}</span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${product.stock < 10 ? 'text-red-500' : 'text-primary-dark'}`}>
                            {product.stock} <span className="text-gray-400 font-normal text-xs ml-1">units</span>
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full
                            ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                          >
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenStockModal(product)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                              title="Add Stock"
                            >
                              <FiPlusCircle size={16} />
                            </button>
                            <button 
                              onClick={() => navigate("/admin/products/editeProduct", { state: { product } })}
                              className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-full transition-colors"
                              title="Edit Product"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.productId)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete Product"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </React.Fragment>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* Luxurious Stock Update Modal */}
      <AnimatePresence>
        {stockModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-100"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-serif text-primary-dark mb-1">Add Stock</h2>
                    <p className="text-gray-500 text-sm font-light">Update inventory for <span className="font-medium text-primary-dark">{selectedProduct.productName}</span></p>
                  </div>
                  <button onClick={() => setStockModalOpen(false)} className="p-2 text-gray-400 hover:text-primary-dark hover:bg-gray-100 rounded-full transition-colors">
                    <FiX size={20} />
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 flex justify-between items-center shadow-inner">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-2">Current Stock</p>
                    <p className="text-3xl font-serif text-primary-dark">{selectedProduct.stock}</p>
                  </div>
                  <div className="text-gray-300 text-3xl font-light">+</div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-2">New Total</p>
                    <p className="text-3xl font-serif text-accent">
                      {selectedProduct.stock + (parseInt(stockToAdd) || 0)}
                    </p>
                  </div>
                </div>

                <form onSubmit={submitStockUpdate}>
                  <div className="mb-10 relative group">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-3 block group-hover:text-primary-dark transition-colors">Units to Add</label>
                    <input 
                      type="number" 
                      autoFocus
                      required
                      min="1"
                      placeholder="e.g. 50"
                      value={stockToAdd}
                      onChange={(e) => setStockToAdd(e.target.value)}
                      className="w-full border-b border-gray-200 py-2 text-xl text-primary-dark focus:outline-none focus:border-primary-dark transition-colors bg-transparent placeholder-gray-200"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setStockModalOpen(false)}
                      className="flex-1 py-4 text-gray-500 font-semibold text-xs uppercase tracking-widest hover:text-primary-dark transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isUpdatingStock || !stockToAdd}
                      className="flex-1 py-4 bg-primary-dark text-white rounded-2xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-black hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 shadow-xl shadow-primary-dark/20 flex items-center justify-center gap-2"
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
