import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate, Link } from "react-router-dom";
import uploadMediaToSupabase from "../../utils/mediaUpload";
import { motion } from "framer-motion";
import { FiUploadCloud, FiArrowLeft, FiCheck, FiBox, FiTag, FiDollarSign, FiLayers, FiAlignLeft } from "react-icons/fi";

export default function EditProductForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product;

  if(!product){
    navigate("/admin/products");
    return null;
  }

  const initialAltNames = product.altName ? product.altName.join(",") : "";

  const [productId, setProductId] = useState(product.productId);
  const [productName, setProductName] = useState(product.productName);
  const [alternativeNames, setAlternativeNames] = useState(initialAltNames);
  const [imageFiles, setImageFiles] = useState([]);
  const [price, setPrice] = useState(product.price);
  const [lastPrice, setLastPrice] = useState(product.lastPrice);
  const [stock, setStock] = useState(product.stock);
  const [description, setDescription] = useState(product.description);
  const [skinType, setSkinType] = useState(product.skinType || "All");
  const [finish, setFinish] = useState(product.finish || "Matte");
  const [category, setCategory] = useState(product.category || "Face");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  async function handelSubmit(e){
    e.preventDefault();
    setIsSubmitting(true);
    const altNames = alternativeNames.split(",");

    try {
      let imgUrls = product.images || [];

      if(imageFiles.length > 0){
        const promisesArray = [];
        for(let i=0; i<imageFiles.length; i++ ){
          promisesArray.push(uploadMediaToSupabase(imageFiles[i]));
        }
        imgUrls = await Promise.all(promisesArray);
      }

      const productData = {
          productId,
          productName,
          altName: altNames,
          images: imgUrls,
          hoverImage: imgUrls.length > 1 ? imgUrls[1] : imgUrls[0],
          price: Number(price),
          lastPrice: Number(lastPrice),
          stock: Number(stock),
          description,
          skinType,
          finish,
          category
      };

      const token = localStorage.getItem("token");

      await axios.put(import.meta.env.VITE_BACKEND_URL + "/api/product/"+ product.productId, productData, {
          headers: { Authorization : "Bearer " + token }
      });
      
      toast.success("Product Updated Successfully");
      navigate("/admin/products");
    } catch(err) {
      toast.error("Failed to update product");
      setIsSubmitting(false);
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const InputField = ({ label, icon: Icon, type, value, onChange, placeholder, id, disabled = false }) => (
    <div className="relative group">
      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-1 block group-hover:text-primary-dark transition-colors">
        {label} {disabled && <span className="lowercase font-normal opacity-50">(Locked)</span>}
      </label>
      <div className={`relative flex items-center border-b ${focusedField === id ? 'border-primary-dark' : 'border-gray-200'} transition-colors duration-300 pb-2`}>
        {Icon && <Icon className={`absolute left-0 transition-colors duration-300 ${focusedField === id ? 'text-primary-dark' : 'text-gray-400'}`} size={16} />}
        <input 
          type={type} 
          disabled={disabled}
          required={!disabled}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField("")}
          className={`w-full bg-transparent focus:outline-none text-sm text-primary-dark placeholder-gray-300 ${disabled ? 'cursor-not-allowed text-gray-400' : ''} ${Icon ? 'pl-8' : ''}`}
          placeholder={placeholder}
          value={value} 
          onChange={onChange} 
        />
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-full pb-10 text-primary-dark font-sans">
      
      {/* Luxurious Header */}
      <div className="relative mb-10 p-10 rounded-3xl overflow-hidden bg-primary-dark text-white shadow-xl shadow-primary-dark/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/90 to-transparent"></div>
        <div className="relative z-10 flex items-center gap-8">
          <Link to="/admin/products" className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary-dark transition-all duration-300 group shadow-lg">
            <FiArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-4xl font-serif mb-2 leading-tight">Edit Product</h1>
            <p className="text-white/70 text-sm font-light tracking-wide max-w-md">Update the details for {productName} in your catalog.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handelSubmit} className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <motion.div variants={fadeIn} initial="hidden" animate="show" className="lg:col-span-2 space-y-8">
            
            {/* Basic Info Section */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <FiBox size={16} />
                </div>
                <h2 className="text-xl font-serif">Basic Information</h2>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="Product Name" id="pname" icon={FiTag} type="text" placeholder="Luminous Silk Foundation" value={productName} onChange={(e) => setProductName(e.target.value)} />
                  <InputField label="Product ID" id="pid" icon={FiLayers} type="text" placeholder="e.g. P1001" value={productId} onChange={(e) => setProductId(e.target.value)} disabled={true} />
                </div>

                <InputField label="Alternative Names (SEO)" id="altname" icon={FiAlignLeft} type="text" placeholder="Foundation, Silk, Liquid (Comma separated)" value={alternativeNames} onChange={(e) => setAlternativeNames(e.target.value)} />

                <div className="relative group pt-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-3 block group-hover:text-primary-dark transition-colors">Description</label>
                  <textarea 
                    required rows="4" 
                    onFocus={() => setFocusedField("desc")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Enter a captivating description for this product..." 
                    value={description} onChange={(e) => setDescription(e.target.value)} 
                    className={`w-full border ${focusedField === "desc" ? 'border-primary-dark bg-white' : 'border-gray-200 bg-gray-50/50'} rounded-xl p-4 text-sm text-primary-dark focus:outline-none transition-all duration-300 resize-none`} 
                  />
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <FiUploadCloud size={16} />
                </div>
                <h2 className="text-xl font-serif">Product Media</h2>
              </div>
              
              <div className="flex flex-col space-y-2 mt-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-primary/5 hover:border-primary-dark transition-all duration-300 relative overflow-hidden group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10 transition-transform group-hover:-translate-y-2">
                      <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:shadow-md group-hover:text-primary-dark text-gray-400 transition-all duration-300">
                        <FiUploadCloud size={24} />
                      </div>
                      <p className="text-sm text-gray-500"><span className="font-semibold text-primary-dark">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-2 tracking-wide uppercase">Leave empty to keep existing images.</p>
                    </div>
                    {imageFiles.length > 0 && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3">
                            <FiCheck size={32} />
                          </div>
                          <p className="text-primary-dark font-serif text-lg">{imageFiles.length} new file(s) selected</p>
                        </div>
                      </div>
                    )}
                    <input id="image-upload" type="file" className="hidden" multiple onChange={(e) => setImageFiles(e.target.files)} />
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Column */}
          <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-8">
            
            {/* Pricing Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-lg font-serif mb-6 border-b border-gray-100 pb-4">Pricing & Inventory</h2>
              
              <div className="space-y-8">
                <InputField label="Current Price (Rs.)" id="price" icon={FiDollarSign} type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                <InputField label="Previous Price (Rs.)" id="lprice" icon={FiDollarSign} type="number" placeholder="0.00" value={lastPrice} onChange={(e) => setLastPrice(e.target.value)} />
                <InputField label="Available Stock" id="stock" icon={FiBox} type="number" placeholder="100" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
            </div>

            {/* Categorization Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-lg font-serif mb-6 border-b border-gray-100 pb-4">Categorization</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold block">Category</label>
                  <div className="relative">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-primary-dark focus:outline-none focus:border-primary-dark transition-colors bg-gray-50/50 hover:bg-white cursor-pointer">
                      <option value="Face">Face</option>
                      <option value="Eyes">Eyes</option>
                      <option value="Lips">Lips</option>
                      <option value="Skincare">Skincare</option>
                      <option value="Body & Nails">Body & Nails</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold block">Skin Type</label>
                  <div className="relative">
                    <select value={skinType} onChange={(e) => setSkinType(e.target.value)} className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-primary-dark focus:outline-none focus:border-primary-dark transition-colors bg-gray-50/50 hover:bg-white cursor-pointer">
                      <option value="All">All Skin Types</option>
                      <option value="Dry">Dry</option>
                      <option value="Oily">Oily</option>
                      <option value="Sensitive">Sensitive</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold block">Finish</label>
                  <div className="relative">
                    <select value={finish} onChange={(e) => setFinish(e.target.value)} className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-primary-dark focus:outline-none focus:border-primary-dark transition-colors bg-gray-50/50 hover:bg-white cursor-pointer">
                      <option value="Matte">Matte</option>
                      <option value="Dewy">Dewy</option>
                      <option value="Satin">Satin</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-primary-dark text-white rounded-2xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-black hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary-dark/20 flex items-center justify-center gap-3"
            >
              {isSubmitting ? 'Updating Product...' : 'Save Changes'}
            </button>

          </motion.div>

        </div>
      </form>
    </div>
  );
}
