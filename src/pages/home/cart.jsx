import { useEffect, useState } from "react";
import { loadCart } from "../../utils/cartFunction";
import CartCard from "../../components/common/CartCard";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiArrowRight, FiShoppingBag, FiTag, FiChevronRight, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [labeledTotal, setLabeledTotal] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddresses, setShowAddresses] = useState(false);

  useEffect(() => {
    const refreshCartData = () => {
      let currentCart = loadCart() || [];
      setCart(currentCart);

      if (currentCart.length === 0) {
        setTotal(0);
        setLabeledTotal(0);
        setShippingCharge(0);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
          calculateMockTotals(currentCart);
          return;
      }

      axios
        .post(
          import.meta.env.VITE_BACKEND_URL + "/api/orders/quote",
          {
            orderItems: currentCart,
          },
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        )
        .then((res) => {
          setTotal(res.data.total);
          setLabeledTotal(res.data.labeledTotal);
          setShippingCharge(res.data.shippingCharge || 0);
        })
        .catch((err) => {
          console.error("Quote fetch failed", err);
          calculateMockTotals(currentCart);
        });

      axios
        .get(import.meta.env.VITE_BACKEND_URL + "/api/users/profile", {
            headers: { Authorization: "Bearer " + token }
        })
        .then((res) => {
            if (res.data && res.data.addresses && res.data.addresses.length > 0) {
                setAddresses(res.data.addresses);
                const defaultAddr = res.data.addresses.find(a => a.isDefault) || res.data.addresses[0];
                setSelectedAddress(defaultAddr);
            }
        })
        .catch((err) => console.error("Profile fetch failed", err));
    };

    refreshCartData();
    window.addEventListener("aura_cart_updated", refreshCartData);
    return () => window.removeEventListener("aura_cart_updated", refreshCartData);
  }, [navigate]);

  const calculateMockTotals = async (currentCart) => {
      try {
          let tempTotal = 0;
          let tempLabeled = 0;
          
          for (const item of currentCart) {
              const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/product/" + item.productId);
              if(res.data) {
                  tempTotal += res.data.lastPrice * item.qty;
                  tempLabeled += res.data.price * item.qty;
              }
          }
          setTotal(tempTotal);
          setLabeledTotal(tempLabeled);
          // For guests, we can mock the standard 400 per item logic or just a flat rate.
          setShippingCharge(400 * currentCart.length);
      } catch (e) {
          console.error("Mock calc failed", e);
      }
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "WELCOME10") {
      setPromoApplied(true);
      toast.success("Promo code applied!");
      // Mock 10% discount for UI
      setTotal(prev => prev * 0.9);
    } else {
      toast.error("Invalid or expired promo code");
    }
  };

  // Safe parsing to prevent NaN crashes
  const safeTotal = isNaN(total) ? 0 : total;
  const safeLabeledTotal = isNaN(labeledTotal) ? 0 : labeledTotal;
  const safeShippingCharge = isNaN(shippingCharge) ? 0 : shippingCharge;

  return (
    <div className="w-full min-h-screen relative bg-primary overflow-hidden pt-24 pb-12 px-4 md:px-12">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-accent-light blur-[120px] opacity-40 animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-200/40 blur-[150px] opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] rounded-full bg-pink-200/30 blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto z-10 relative">
        <button 
          onClick={() => navigate('/product')}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-dark dark:hover:text-white bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all cursor-pointer group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Shop
        </button>

        <h1 className="text-4xl md:text-5xl font-serif text-primary-dark dark:text-white mb-2">Your Shopping Bag</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium tracking-widest uppercase text-sm mb-12">
          {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
        </p>

        {cart.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white/70 dark:bg-[#1a1a24]/90 backdrop-blur-xl border border-white dark:border-gray-800 rounded-3xl p-16 text-center shadow-2xl flex flex-col items-center justify-center min-h-[50vh]"
            >
              <div className="w-24 h-24 bg-accent/10 dark:bg-accent/20 text-accent rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FiShoppingBag size={40} />
              </div>
              <h2 className="text-3xl font-serif text-primary-dark dark:text-white mb-4">Your bag is empty</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your bag yet. Discover our latest beauty essentials.</p>
              <Link to="/product" className="bg-primary-dark dark:bg-accent text-white px-8 py-4 rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black dark:hover:bg-accent/80 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
                Continue Shopping
              </Link>
            </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Cart Items List */}
            <div className="flex-1">

              <div className="bg-white/70 dark:bg-[#1a1a24]/90 backdrop-blur-xl border border-white dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
                <div className="hidden md:grid grid-cols-12 text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
                
                <div className="flex flex-col gap-6">
                  {cart.map((item) => (
                    <CartCard key={item.productId} productId={item.productId} qty={item.qty} />
                  ))}
                </div>
              </div>


            </div>

            {/* Order Summary Sidebar */}
            <div className="w-full lg:w-[400px]">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1a1a1a] text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-28 relative overflow-hidden"
              >
                {/* Decorative glow inside summary */}
                <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full bg-accent blur-[100px] opacity-30 pointer-events-none"></div>

                <h2 className="font-serif text-2xl mb-6 border-b border-gray-800 pb-4 flex items-center justify-between">
                  <span>Order Summary</span>
                  <FiShoppingBag className="text-gray-500 opacity-50" />
                </h2>

                {/* Address Selector */}
                {addresses.length > 0 && (
                  <div className="mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">Deliver To</p>
                    {selectedAddress ? (
                      <div 
                        className="flex justify-between items-center cursor-pointer group"
                        onClick={() => setShowAddresses(!showAddresses)}
                      >
                        <div>
                          <p className="font-medium text-sm text-white mb-1 group-hover:text-accent transition-colors">{selectedAddress.label}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{selectedAddress.street}, {selectedAddress.city}</p>
                        </div>
                        <FiChevronRight className={`text-gray-500 transition-transform ${showAddresses ? 'rotate-90' : ''}`} />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No address selected</p>
                    )}

                    <AnimatePresence>
                      {showAddresses && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 pt-4 border-t border-gray-800 flex flex-col gap-2"
                        >
                          {addresses.map((addr) => (
                            <div 
                              key={addr._id || addr.label}
                              onClick={() => {
                                setSelectedAddress(addr);
                                setShowAddresses(false);
                              }}
                              className={`p-3 rounded-xl cursor-pointer border text-sm transition-all ${selectedAddress?._id === addr._id || selectedAddress?.label === addr.label ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'}`}
                            >
                              <p className="font-medium mb-1">{addr.label}</p>
                              <p className="text-xs opacity-70 truncate">{addr.street}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="space-y-4 text-sm mb-6 text-gray-300 font-medium">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="text-white">LKR {(labeledTotal ?? 0).toFixed(2)}</span>
                  </div>
                  
                  {((labeledTotal ?? 0) - (total ?? 0)) > 0 && (
                    <div className="flex justify-between items-center text-accent">
                      <span>Discount</span>
                      <span>- LKR {((labeledTotal ?? 0) - (total ?? 0)).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-800/50 mt-2">
                    {cart.map((item, idx) => (
                        <CartSummaryItem key={idx} productId={item.productId} qty={item.qty} />
                    ))}
                  </div>
                </div>

                {/* Promo Code Accordion */}
                <div className="mb-6 border-t border-gray-800 pt-6">
                  <button 
                    onClick={() => setShowPromoInput(!showPromoInput)}
                    className="flex justify-between items-center w-full text-sm font-medium text-white hover:text-accent transition-colors"
                  >
                    <span className="flex items-center gap-2"><FiTag className="text-gray-400" /> Add a Promo Code</span>
                    <FiChevronRight className={`text-gray-500 transition-transform duration-300 ${showPromoInput ? 'rotate-90' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showPromoInput && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4"
                      >
                        <form onSubmit={handleApplyPromo} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Enter Code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            disabled={promoApplied}
                            className="flex-1 bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-white outline-none focus:border-accent transition-all text-sm uppercase tracking-wider placeholder:text-gray-600"
                          />
                          <button 
                            type="submit"
                            disabled={promoApplied || !promoCode}
                            className="bg-accent text-white px-6 rounded-xl text-sm font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                          >
                            Apply
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t border-gray-800 pt-6 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-sm uppercase tracking-widest text-gray-400 font-semibold">Estimated Total</span>
                    <span className="text-3xl font-serif font-bold text-white">
                      LKR {(safeTotal).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">Taxes included if applicable</p>
                </div>

                <button
                  onClick={() => navigate('/checkout', { state: { selectedAddress } })}
                  className="w-full bg-primary-dark dark:bg-accent text-white py-4 rounded-2xl uppercase tracking-widest text-sm font-bold hover:bg-black dark:hover:bg-accent/80 transition-all flex justify-center items-center gap-3 mb-6 group shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  Proceed to Checkout <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex flex-col items-center gap-4 border-t border-gray-800 pt-6 mt-2">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium tracking-widest uppercase">
                        <FiLock className="text-gray-500" /> Safe & Secure Checkout
                    </div>
                    <div className="flex gap-2 opacity-40">
                        {/* Mock Payment Badges */}
                        <div className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold tracking-widest uppercase text-white">Visa</div>
                        <div className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold tracking-widest uppercase text-white">Mastercard</div>
                        <div className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold tracking-widest uppercase text-white">Amex</div>
                        <div className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold tracking-widest uppercase text-white">PayPal</div>
                    </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CartSummaryItem = ({ productId, qty }) => {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        axios.get(import.meta.env.VITE_BACKEND_URL + "/api/product/" + productId)
            .then((res) => {
                if (res.data) setProduct(res.data);
            })
            .catch(console.error);
    }, [productId]);

    if (!product) return null;

    return (
        <div className="flex justify-between items-center text-gray-400 text-xs py-1">
            <span className="truncate pr-4 flex-1">{qty}x {product.productName}</span>
            <span className="shrink-0">LKR {(product.lastPrice * qty).toFixed(2)}</span>
        </div>
    );
};