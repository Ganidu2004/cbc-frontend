import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"
import ProductNotFound from "./productNotFound";
import ImageSlider from "../../components/common/ImageSlider";
import { addToCart } from "../../utils/cartFunction";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FiMinus, FiPlus, FiChevronDown, FiChevronUp, FiCheckCircle, FiShield } from "react-icons/fi";

// PDP New Components
import VirtualTryOn from "../../components/pdp/VirtualTryOn";
import BeforeAfterSlider from "../../components/pdp/BeforeAfterSlider";
import IngredientExplorer from "../../components/pdp/IngredientExplorer";
import CommunityGallery from "../../components/pdp/CommunityGallery";

const MOCK_PRODUCT = {
    productId: 'mock-1',
    productName: 'Luminous Silk Foundation',
    altName: ['Liquid Foundation', 'Medium Coverage'],
    price: 69.00,
    lastPrice: 69.00,
    description: 'A lightweight, luminous foundation that delivers a flawless, natural finish with up to 24 hours of hydration and buildable medium coverage.',
    images: [
        'https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
};

export default function ProductOverview(){
    const params = useParams()
    const navigate = useNavigate()
    const ProductId = params.id;
    const [product, setProduct] = useState(null)
    const [status, setStatus] = useState("Loading")
    const [quantity, setQuantity] = useState(1);
    const [activeAccordion, setActiveAccordion] = useState('description');

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/${ProductId}`)
        .then((res) => {
            if(res.data == null ){
                // Fallback to mock for UI blueprint showcase if not found
                setProduct(MOCK_PRODUCT);
                setStatus("found");
            } else {
                setProduct(res.data)
                setStatus("found")
            }
        }).catch((err) => {
            console.error(err);
            // Fallback to mock on error
            setProduct(MOCK_PRODUCT);
            setStatus("found");
        })
    }, [ProductId])

    function onAddToCartClick(){
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please register/sign in to receive an invoice.");
            navigate("/login");
            return;
        }
        addToCart(product.productId, quantity)
        toast.success(product.productName + " Added to cart")
    }

    if (status === "Loading") {
        return (
            <div className="w-full h-[calc(100vh-100px)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-2 border-gray-200 border-b-primary-dark"></div>
            </div>
        );
    }

    if (status === "not found") {
        return <ProductNotFound />;
    }

    return(
        <div className="w-full min-h-screen bg-primary pt-28 pb-20">
            {/* Top Section: Product Details & Slider */}
            <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 p-4 md:p-12">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-1/2 h-auto sticky top-28"
                >
                    <ImageSlider images={product.images}/>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-1/2 flex flex-col justify-center"
                >
                    <div className="mb-3 text-xs uppercase tracking-widest text-accent font-bold">
                        {product.altName?.join(" • ") || "Foundation"}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-primary-dark dark:text-white font-medium mb-4 leading-tight">
                        {product.productName}
                    </h1>
                    
                    <div className="flex items-center gap-4 mb-6">
                        {product.price > product.lastPrice && (
                            <span className="text-xl line-through text-gray-400 dark:text-gray-500">LKR.{product.price}</span>
                        )}
                        <span className="text-3xl font-semibold text-primary-dark dark:text-white">LKR.{product.lastPrice}</span>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-transparent dark:border-green-800/50 px-3 py-1.5 rounded-full text-xs font-medium">
                            <FiCheckCircle /> Vegan
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-transparent dark:border-blue-800/50 px-3 py-1.5 rounded-full text-xs font-medium">
                            <FiShield /> Cruelty Free
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden h-12 w-32 bg-white dark:bg-gray-800">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200 transition-colors outline-none cursor-pointer"
                                >
                                    <FiMinus />
                                </button>
                                <div className="flex-1 h-full flex items-center justify-center font-medium text-primary-dark dark:text-white border-x border-gray-300 dark:border-gray-700">
                                    {quantity}
                                </div>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200 transition-colors outline-none cursor-pointer"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            
                            <button 
                                onClick={onAddToCartClick} 
                                className="flex-1 bg-primary-dark dark:bg-accent text-white h-12 uppercase tracking-widest text-sm font-bold hover:bg-black dark:hover:bg-accent/80 transition-all shadow-lg hover:shadow-xl rounded-md cursor-pointer flex items-center justify-center gap-2"
                            >
                                Add to Cart
                            </button>
                        </div>
                        <VirtualTryOn shades={['Shade 1', 'Shade 2', 'Shade 3', 'Shade 4']} />
                    </div>

                    {/* Accordion Section */}
                    <div className="border-t border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 mt-auto">
                        {/* Description */}
                        <div className="py-4">
                            <button 
                                onClick={() => setActiveAccordion(activeAccordion === 'description' ? '' : 'description')}
                                className="flex justify-between items-center w-full text-left font-serif text-lg text-primary-dark dark:text-white outline-none cursor-pointer"
                            >
                                <span>Description</span>
                                {activeAccordion === 'description' ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                            <AnimatePresence>
                                {activeAccordion === 'description' && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-4 font-light text-sm">
                                            {product.description}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* How to Use */}
                        <div className="py-4">
                            <button 
                                onClick={() => setActiveAccordion(activeAccordion === 'howtouse' ? '' : 'howtouse')}
                                className="flex justify-between items-center w-full text-left font-serif text-lg text-primary-dark dark:text-white outline-none cursor-pointer"
                            >
                                <span>How to Use</span>
                                {activeAccordion === 'howtouse' ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                            <AnimatePresence>
                                {activeAccordion === 'howtouse' && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-4 font-light text-sm">
                                            Apply a small amount to the back of your hand. Use a brush or sponge to blend into the skin, starting from the center of the face and working outwards. Build coverage as desired.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Ingredients */}
                        <div className="py-4">
                            <button 
                                onClick={() => setActiveAccordion(activeAccordion === 'ingredients' ? '' : 'ingredients')}
                                className="flex justify-between items-center w-full text-left font-serif text-lg text-primary-dark dark:text-white outline-none cursor-pointer"
                            >
                                <span>Ingredients</span>
                                {activeAccordion === 'ingredients' ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                            <AnimatePresence>
                                {activeAccordion === 'ingredients' && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-4 font-light text-sm">
                                            Aqua / Water, Cyclopentasiloxane, Glycerin, Isododecane, Alcohol Denat., Polyglyceryl-4 Isostearate, Cetyl Peg/Ppg-10/1 Dimethicone, Hexyl Laurate, Aluminum Starch Octenylsuccinate, Disteardimonium Hectorite, Phenoxyethanol.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Middle Section: Before/After */}
            <BeforeAfterSlider />

            {/* Texture/Ingredient Section */}
            <IngredientExplorer />

            {/* Bottom Section: Community Reviews */}
            <CommunityGallery productId={ProductId} />
        </div>
    )
}