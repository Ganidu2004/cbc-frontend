import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { FiCheckCircle, FiCreditCard, FiTruck, FiMapPin, FiChevronRight, FiLock, FiArrowLeft } from "react-icons/fi";
import { loadCart, clearCart } from "../../utils/cartFunction";
import axios from "axios";
import toast from "react-hot-toast";

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [labeledTotal, setLabeledTotal] = useState(0);
    
    // User data / Address info
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [phone, setPhone] = useState("");

    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("new");
    
    const [shippingMethod, setShippingMethod] = useState("standard");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [cardType, setCardType] = useState("visa");
    const [isProcessing, setIsProcessing] = useState(false);
    
    useEffect(() => {
        const currentCart = loadCart() || [];
        if (currentCart.length === 0) {
            navigate("/cart");
            return;
        }
        setCart(currentCart);
        
        const token = localStorage.getItem("token");
        
        // Fetch cart totals
        if (token) {
            axios.post(
                import.meta.env.VITE_BACKEND_URL + "/api/orders/quote",
                { orderItems: currentCart },
                { headers: { Authorization: "Bearer " + token } }
            )
            .then((res) => {
                setTotal(res.data.total);
                setLabeledTotal(res.data.labeledTotal);
            }).catch(() => {
                // mock totals for guest
                calculateMockTotals(currentCart);
            });
            
            // Fetch User Profile to autofill
            axios.get(import.meta.env.VITE_BACKEND_URL + "/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` }
            }).then((res) => {
                const user = res.data;
                setEmail(user.email || "");
                setFirstName(user.firstName || "");
                setLastName(user.lastName || "");
                if (user.addresses && user.addresses.length > 0) {
                    setUserAddresses(user.addresses);
                    
                    if (location.state?.selectedAddress) {
                        const matched = user.addresses.find(a => a._id === location.state.selectedAddress._id || a.label === location.state.selectedAddress.label);
                        if (matched) {
                            setSelectedAddressId(matched._id || matched.label);
                            setAddress(matched.street || "");
                            setCity(matched.city || "");
                            if (matched.zipCode) setZipCode(matched.zipCode);
                            if (matched.phone) setPhone(matched.phone);
                        } else {
                            setSelectedAddressId("new");
                        }
                    } else {
                        const defaultAddress = user.addresses.find(a => a.isDefault) || user.addresses[0];
                        setSelectedAddressId(defaultAddress._id || defaultAddress.label);
                        setAddress(defaultAddress.street || "");
                        setCity(defaultAddress.city || "");
                        if (defaultAddress.zipCode) setZipCode(defaultAddress.zipCode);
                        if (defaultAddress.phone) setPhone(defaultAddress.phone);
                    }
                }
            }).catch(console.error);
        } else {
            calculateMockTotals(currentCart);
        }
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
        } catch (e) {
            console.error("Mock calc failed", e);
        }
    };
    
    const handleSelectAddress = (addr) => {
        setSelectedAddressId(addr._id || addr.label);
        setAddress(addr.street || "");
        setCity(addr.city || "");
        if(addr.zipCode) setZipCode(addr.zipCode); else setZipCode("");
        if(addr.phone) setPhone(addr.phone);
    };

    const handleSelectNewAddress = () => {
        setSelectedAddressId("new");
        setAddress("");
        setCity("");
        setZipCode("");
        setPhone("");
    };

    const shippingCharge = shippingMethod === "standard" ? 400 : 800;
    const finalTotal = total + shippingCharge;
    
    const handleSubmitStep1 = (e) => {
        e.preventDefault();
        if(!email || !firstName || !address || !phone) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setStep(2);
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        const token = localStorage.getItem("token");
        
        try {
            if (token) {
                // Real DB order creation
                const orderData = {
                    name: `${firstName} ${lastName}`,
                    email: email,
                    address: `${address}, ${city}${zipCode ? ' - ' + zipCode : ''}`,
                    phone: parseInt(phone.replace(/\D/g,'')),
                    orderItems: cart,
                    notes: `Shipping: ${shippingMethod} | Payment: ${paymentMethod}${paymentMethod === 'card' ? ' (' + cardType + ')' : ''}`
                };
                
                const response = await axios.post(
                    import.meta.env.VITE_BACKEND_URL + "/api/orders",
                    orderData,
                    { headers: { Authorization: "Bearer " + token } }
                );
                
                clearCart();
                toast.success("Order Placed Successfully!");
                navigate(`/invoice/${response.data.order.orderId}`);
            } else {
                // Guest Checkout Simulation
                await new Promise(resolve => setTimeout(resolve, 1500)); // fake delay
                clearCart();
                toast.success("Order Placed Successfully!");
                navigate(`/invoice/mock-${Math.floor(Math.random() * 10000)}`);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to place order.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-[#121212] pt-24 pb-12 px-4 md:px-12 font-sans">
            <div className="max-w-7xl mx-auto">
                <button 
                    onClick={() => {
                        if (step === 1) navigate('/cart');
                        else setStep(step - 1);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-dark dark:hover:text-white bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all cursor-pointer group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                    {step === 1 ? 'Back to Cart' : step === 2 ? 'Back to Information' : 'Back to Shipping'}
                </button>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                
                {/* Left Form Area */}
                <div className="flex-1">
                    
                    {/* Express Checkout Options */}
                    {step === 1 && (
                        <div className="mb-10 text-center">
                            <h2 className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-4">Express Checkout</h2>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition-colors cursor-pointer">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                                    Pay with Facebook
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-black dark:text-white py-3 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12c0-6.627 5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24c0 11.045 8.955 20 20 20c11.045 0 20-8.955 20-20C44 22.659 43.862 21.35 43.611 20.083z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24C44 22.659 43.862 21.35 43.611 20.083z"/></svg>
                                    Google Pay
                                </button>
                            </div>
                            <div className="flex items-center my-8 text-gray-400 dark:text-gray-600">
                                <div className="flex-1 border-b border-gray-200 dark:border-gray-800"></div>
                                <span className="px-4 text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">Or pay with card</span>
                                <div className="flex-1 border-b border-gray-200 dark:border-gray-800"></div>
                            </div>
                        </div>
                    )}

                    {/* Step Indicators */}
                    <div className="flex gap-4 mb-8">
                        {['Information', 'Shipping', 'Payment'].map((name, i) => (
                            <div key={i} className={`flex items-center gap-2 text-sm font-medium ${step >= i + 1 ? 'text-primary-dark dark:text-accent font-bold' : 'text-gray-400 dark:text-gray-600'}`}>
                                <span>{name}</span>
                                {i < 2 && <FiChevronRight />}
                            </div>
                        ))}
                    </div>

                    {/* STEP 1: INFORMATION */}
                    {step === 1 && (
                        <motion.form 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleSubmitStep1}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-serif text-primary-dark dark:text-white mb-6 flex items-center gap-2">
                                    <FiMapPin /> Contact & Delivery Info
                                </h2>
                                
                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Email</label>
                                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent transition-all" placeholder="Email Address"/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">First Name</label>
                                            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent transition-all" placeholder="First Name"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Last Name</label>
                                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent transition-all" placeholder="Last Name"/>
                                        </div>
                                    </div>
                                </div>

                                {userAddresses.length > 0 && (
                                    <div className="mb-6">
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Delivery Address</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            {userAddresses.map((addr, idx) => {
                                                const addrId = addr._id || addr.label;
                                                const isSelected = selectedAddressId === addrId;
                                                return (
                                                    <div 
                                                        key={idx}
                                                        onClick={() => handleSelectAddress(addr)}
                                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-primary-dark dark:border-accent bg-gray-50 dark:bg-accent/10 ring-1 ring-primary-dark dark:ring-accent shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/60'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-semibold text-primary-dark dark:text-white text-sm">{addr.label}</span>
                                                            {isSelected && <FiCheckCircle className="text-primary-dark dark:text-accent" />}
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{addr.street}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{addr.city}{addr.zipCode ? `, ${addr.zipCode}` : ''}</p>
                                                        {addr.phone && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{addr.phone}</p>}
                                                    </div>
                                                )
                                            })}
                                            <div 
                                                onClick={handleSelectNewAddress}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center min-h-[100px] ${selectedAddressId === 'new' ? 'border-primary-dark dark:border-accent bg-gray-50 dark:bg-accent/10 ring-1 ring-primary-dark dark:ring-accent' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 border-dashed bg-white dark:bg-gray-800/40'}`}
                                            >
                                                <span className="font-medium text-sm text-gray-600 dark:text-gray-300">+ Use a New Address</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <AnimatePresence>
                                    {(selectedAddressId === 'new' || userAddresses.length === 0) && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden pt-2">
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Street Address</label>
                                                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent" placeholder="123 Main St, Apt 4B"/>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">City / District</label>
                                                    <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent" placeholder="Colombo"/>
                                                </div>
                                                <div>
                                                    <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Postal / ZIP Code</label>
                                                    <input type="text" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent" placeholder="00100"/>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                                                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent" placeholder="0771234567"/>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            <div className="flex justify-end">
                                <button type="submit" className="bg-primary-dark dark:bg-accent text-white px-8 py-4 rounded-xl uppercase tracking-widest text-sm font-bold shadow-lg hover:shadow-xl hover:bg-black dark:hover:bg-accent/80 transition-all cursor-pointer">
                                    Continue to Shipping
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {/* STEP 2: SHIPPING METHOD */}
                    {step === 2 && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-serif text-primary-dark dark:text-white mb-6 flex items-center gap-2">
                                    <FiTruck /> Shipping Method
                                </h2>
                                
                                <div className="space-y-4">
                                    <label className={`block border ${shippingMethod === 'standard' ? 'border-primary-dark dark:border-accent bg-gray-50 dark:bg-accent/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60'} rounded-xl p-4 cursor-pointer hover:border-primary-dark dark:hover:border-accent transition-colors`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="w-4 h-4 accent-primary-dark dark:accent-accent"/>
                                                <div>
                                                    <p className="font-medium text-primary-dark dark:text-white">Standard Delivery</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3-5 Business Days</p>
                                                </div>
                                            </div>
                                            <span className="font-medium text-primary-dark dark:text-white">LKR 400.00</span>
                                        </div>
                                    </label>
                                    
                                    <label className={`block border ${shippingMethod === 'express' ? 'border-primary-dark dark:border-accent bg-gray-50 dark:bg-accent/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60'} rounded-xl p-4 cursor-pointer hover:border-primary-dark dark:hover:border-accent transition-colors`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <input type="radio" name="shipping" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="w-4 h-4 accent-primary-dark dark:accent-accent"/>
                                                <div>
                                                    <p className="font-medium text-primary-dark dark:text-white">Express Delivery</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1-2 Business Days</p>
                                                </div>
                                            </div>
                                            <span className="font-medium text-primary-dark dark:text-white">LKR 800.00</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="flex justify-between">
                                <button onClick={() => setStep(1)} className="text-gray-500 dark:text-gray-400 hover:text-primary-dark dark:hover:text-white font-medium transition-colors cursor-pointer">
                                    &larr; Return to Information
                                </button>
                                <button onClick={() => setStep(3)} className="bg-primary-dark dark:bg-accent text-white px-8 py-4 rounded-xl uppercase tracking-widest text-sm font-bold shadow-lg hover:shadow-xl hover:bg-black dark:hover:bg-accent/80 transition-all cursor-pointer">
                                    Continue to Payment
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: PAYMENT */}
                    {step === 3 && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-serif text-primary-dark dark:text-white mb-6 flex items-center gap-2">
                                    <FiCreditCard /> Payment
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">All transactions are secure and encrypted.</p>
                                
                                <div className="space-y-4">
                                    <div 
                                        onClick={() => setPaymentMethod('card')}
                                        className={`block border ${paymentMethod === 'card' ? 'border-primary-dark dark:border-accent bg-gray-50 dark:bg-accent/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60'} rounded-xl p-4 cursor-pointer hover:border-primary-dark dark:hover:border-accent transition-colors`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <input type="radio" name="payment" checked={paymentMethod === 'card'} readOnly className="w-4 h-4 accent-primary-dark dark:accent-accent"/>
                                            <span className="font-medium text-primary-dark dark:text-white">Credit / Debit Card</span>
                                        </div>
                                        <AnimatePresence>
                                            {paymentMethod === 'card' && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 overflow-hidden pl-7 pr-4">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Select Card Type</p>
                                                    <div className="flex gap-3">
                                                        <div 
                                                            onClick={(e) => { e.stopPropagation(); setCardType('visa'); }} 
                                                            className={`flex-1 py-3 px-3 border rounded-xl text-center text-sm font-semibold transition-all shadow-sm cursor-pointer ${cardType === 'visa' ? 'border-primary-dark dark:border-accent bg-primary-dark dark:bg-accent text-white ring-1 ring-primary-dark dark:ring-accent' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                                        >
                                                            Visa
                                                        </div>
                                                        <div 
                                                            onClick={(e) => { e.stopPropagation(); setCardType('mastercard'); }} 
                                                            className={`flex-1 py-3 px-3 border rounded-xl text-center text-sm font-semibold transition-all shadow-sm cursor-pointer ${cardType === 'mastercard' ? 'border-primary-dark dark:border-accent bg-primary-dark dark:bg-accent text-white ring-1 ring-primary-dark dark:ring-accent' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                                        >
                                                            MasterCard
                                                        </div>
                                                        <div 
                                                            onClick={(e) => { e.stopPropagation(); setCardType('amex'); }} 
                                                            className={`flex-1 py-3 px-3 border rounded-xl text-center text-sm font-semibold transition-all shadow-sm cursor-pointer ${cardType === 'amex' ? 'border-primary-dark dark:border-accent bg-primary-dark dark:bg-accent text-white ring-1 ring-primary-dark dark:ring-accent' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                                        >
                                                            AmEx
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    
                                    <div 
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`block border ${paymentMethod === 'cod' ? 'border-primary-dark dark:border-accent bg-gray-50 dark:bg-accent/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60'} rounded-xl p-4 cursor-pointer hover:border-primary-dark dark:hover:border-accent transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="payment" checked={paymentMethod === 'cod'} readOnly className="w-4 h-4 accent-primary-dark dark:accent-accent"/>
                                            <span className="font-medium text-primary-dark dark:text-white">Cash on Delivery (COD)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <button onClick={() => setStep(2)} className="text-gray-500 dark:text-gray-400 hover:text-primary-dark dark:hover:text-white font-medium transition-colors cursor-pointer">
                                    &larr; Return to Shipping
                                </button>
                                <button onClick={handlePlaceOrder} disabled={isProcessing} className="bg-primary-dark dark:bg-accent text-white px-8 py-4 rounded-xl uppercase tracking-widest text-sm font-bold shadow-lg hover:shadow-xl hover:bg-black dark:hover:bg-accent/80 transition-all flex items-center gap-2 cursor-pointer">
                                    {isProcessing ? "Processing..." : (
                                        paymentMethod === 'card' ? `Pay LKR ${finalTotal.toFixed(2)}` : `Place Order (COD)`
                                    )}
                                    {paymentMethod === 'card' && <FiLock />}
                                </button>
                            </div>
                        </motion.div>
                    )}

                </div>
                
                {/* Right Sticky Order Summary */}
                <div className="w-full lg:w-[450px]">
                    <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 sticky top-28">
                        <h2 className="font-serif text-2xl text-primary-dark dark:text-white mb-6">Order Summary</h2>
                        
                        <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map((item, idx) => (
                                <CheckoutItem key={idx} productId={item.productId} qty={item.qty} />
                            ))}
                        </div>
                        
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>LKR {labeledTotal.toFixed(2)}</span>
                            </div>
                            {labeledTotal - total > 0 && (
                                <div className="flex justify-between text-accent">
                                    <span>Discount</span>
                                    <span>- LKR {(labeledTotal - total).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Shipping ({shippingMethod})</span>
                                <span>LKR {shippingCharge.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-end border-t border-gray-100 dark:border-gray-800 pt-6">
                            <span className="text-lg font-medium text-primary-dark dark:text-white">Total</span>
                            <span className="text-3xl font-serif font-bold text-primary-dark dark:text-white">
                                LKR {finalTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                </div>
            </div>
        </div>
    );
}

const CheckoutItem = ({ productId, qty }) => {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        axios.get(import.meta.env.VITE_BACKEND_URL + "/api/product/" + productId)
            .then((res) => {
                if (res.data) setProduct(res.data);
            })
            .catch(console.error);
    }, [productId]);

    return (
        <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0 relative overflow-visible border border-gray-100 dark:border-gray-700 shadow-sm">
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-dark dark:bg-accent text-white rounded-full flex items-center justify-center text-[10px] font-bold z-10 shadow">
                    {qty}
                </span>
                <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    {product?.images?.[0] ? (
                        <img src={product.images[0]} alt={product.productName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-[10px] text-gray-400 animate-pulse">IMG</div>
                    )}
                </div>
            </div>
            <div className="flex-1">
                <p className="font-medium text-sm text-primary-dark dark:text-white line-clamp-1">{product?.productName || `Ref: ${productId.substring(0, 8)}`}</p>
                {product?.lastPrice && <p className="text-xs text-gray-500 dark:text-gray-400">LKR {product.lastPrice.toFixed(2)}</p>}
            </div>
        </div>
    );
};
