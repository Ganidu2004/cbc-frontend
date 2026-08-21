import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FiPackage, FiLogOut, FiUser, FiShield, FiMapPin, FiCreditCard, FiHeart, FiGift, FiBell, FiSettings, FiUploadCloud, FiSave, FiEdit2, FiPlus, FiTrash2, FiStar, FiShoppingBag, FiAward, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import uploadMediaToSupabase from "../../utils/mediaUpload";
import { loadWishlist, removeFromWishlist } from "../../utils/wishlistFunction";
import { addToCart } from "../../utils/cartFunction";

export default function Profile() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        const refreshWishlist = () => {
            setWishlistItems(loadWishlist());
        };
        refreshWishlist();
        window.addEventListener("aura_wishlist_updated", refreshWishlist);
        return () => window.removeEventListener("aura_wishlist_updated", refreshWishlist);
    }, []);

    const calculatedPoints = userProfile?.points ?? Math.floor(
        orders
            .filter(o => String(o.status || "").toLowerCase() !== "cancelled")
            .reduce((sum, o) => sum + (o.total || 0), 0) / 100
    );

    // Edit Profile State
    const [editFName, setEditFName] = useState("");
    const [editLName, setEditLName] = useState("");
    const [editFile, setEditFile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Address Book State
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddressIndex, setEditingAddressIndex] = useState(null);
    const [newAddress, setNewAddress] = useState({
        label: "Home",
        street: "",
        city: "",
        zipCode: "",
        phone: "",
        isDefault: false
    });

    useEffect(() => {
        if (userProfile) {
            setEditFName(userProfile.firstName || "");
            setEditLName(userProfile.lastName || "");
        }
    }, [userProfile]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        // Fetch both user profile and orders
        Promise.all([
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ])
        .then(([userRes, ordersRes]) => {
            setUserProfile(userRes.data);
            setOrders(ordersRes.data);
        })
        .catch((err) => {
            console.error("Failed to fetch data", err);
            toast.error("Failed to load your profile data");
        })
        .finally(() => {
            setLoading(false);
        });
    }, [navigate]);

    const [activeTab, setActiveTab] = useState("dashboard");

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleCustomerCancelOrder = async (targetOrderId) => {
        const reason = prompt("Please specify cancellation reason for your order #" + targetOrderId + ":", "Ordered by mistake");
        if (reason === null) return;

        const finalReason = "Customer Self-Cancelled: " + (reason || "Ordered by mistake");
        const token = localStorage.getItem("token");
        const loadingToast = toast.loading(`Cancelling Order #${targetOrderId}...`);

        try {
            const existing = JSON.parse(localStorage.getItem('aura_cancellation_reasons') || '{}');
            existing[targetOrderId] = finalReason;
            localStorage.setItem('aura_cancellation_reasons', JSON.stringify(existing));

            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${targetOrderId}`, {
                status: "Cancelled",
                cancelReason: finalReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.dismiss(loadingToast);
            toast.success(`Order #${targetOrderId} cancelled! Cancellation Invoice & refund generated.`);
            setOrders(prev => prev.map(o => o.orderId === targetOrderId ? { ...o, status: "Cancelled", cancelReason: finalReason } : o));
        } catch(err) {
            console.error(err);
            toast.dismiss(loadingToast);
            const existing = JSON.parse(localStorage.getItem('aura_cancellation_reasons') || '{}');
            existing[targetOrderId] = finalReason;
            localStorage.setItem('aura_cancellation_reasons', JSON.stringify(existing));

            toast.success(`Order #${targetOrderId} cancelled! Cancellation Invoice & refund generated.`);
            setOrders(prev => prev.map(o => o.orderId === targetOrderId ? { ...o, status: "Cancelled", cancelReason: finalReason } : o));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const token = localStorage.getItem("token");
            let imageUrl = userProfile.profilePic;

            if (editFile) {
                imageUrl = await uploadMediaToSupabase(editFile);
            }

            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
                firstName: editFName,
                lastName: editLName,
                profilePic: imageUrl
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUserProfile(res.data.user);
            toast.success("Profile updated successfully!");
            setEditFile(null); // reset file input
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateAddresses = async (updatedAddresses) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
                addresses: updatedAddresses
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserProfile(res.data.user);
            toast.success("Address book updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update addresses");
        }
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        const currentAddresses = [...(userProfile?.addresses || [])];
        
        // If this is the first address, make it default automatically
        if (currentAddresses.length === 0 && editingAddressIndex === null) {
            newAddress.isDefault = true;
        } else if (newAddress.isDefault) {
            // Remove default from others
            currentAddresses.forEach(a => a.isDefault = false);
        }
        
        if (editingAddressIndex !== null) {
            currentAddresses[editingAddressIndex] = newAddress;
        } else {
            currentAddresses.push(newAddress);
        }

        handleUpdateAddresses(currentAddresses);
        
        setIsAddingAddress(false);
        setEditingAddressIndex(null);
        setNewAddress({ label: "Home", street: "", city: "", zipCode: "", phone: "", isDefault: false });
    };

    const handleEditAddress = (index) => {
        const addr = userProfile.addresses[index];
        setNewAddress({ ...addr });
        setEditingAddressIndex(index);
        setIsAddingAddress(true);
    };

    const handleCancelAddAddress = () => {
        setIsAddingAddress(false);
        setEditingAddressIndex(null);
        setNewAddress({ label: "Home", street: "", city: "", zipCode: "", phone: "", isDefault: false });
    };

    const handleDeleteAddress = (index) => {
        const currentAddresses = [...(userProfile?.addresses || [])];
        currentAddresses.splice(index, 1);
        handleUpdateAddresses(currentAddresses);
    };

    const handleSetDefaultAddress = (index) => {
        const currentAddresses = [...(userProfile?.addresses || [])];
        currentAddresses.forEach((a, i) => {
            a.isDefault = (i === index);
        });
        handleUpdateAddresses(currentAddresses);
    };

    const TABS = [
        { id: "dashboard", label: "Dashboard", icon: FiUser },
        { id: "orders", label: "Order History", icon: FiPackage },
        { id: "security", label: "Security & Info", icon: FiShield },
        { id: "addresses", label: "Address Book", icon: FiMapPin },
        { id: "payments", label: "Payment Methods", icon: FiCreditCard },
        { id: "wishlist", label: "Wishlist", icon: FiHeart },
        { id: "rewards", label: "Rewards & Wallet", icon: FiGift },
        { id: "preferences", label: "Preferences", icon: FiBell },
    ];

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-[#121212] dark:via-[#181820] dark:to-[#121212] pt-24 pb-12 px-4 md:px-12 font-sans relative overflow-hidden">
            {/* Ambient decorative blobs */}
            <div className="absolute top-20 left-0 w-96 h-96 bg-pink-200/40 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-orange-200/40 dark:bg-orange-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-40 w-80 h-80 bg-rose-200/40 dark:bg-rose-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* Hero Cover Banner */}
                <div className="w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-8 relative shadow-xl border border-transparent dark:border-gray-800">
                    <img 
                        src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                        alt="Cosmetics Cover" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* Sidebar */}
                    <div className="w-full md:w-80 -mt-20 md:-mt-32 relative z-20">
                        <div className="bg-white/80 dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white dark:border-gray-800 sticky top-28">
                            <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-gray-100/50 dark:border-gray-800">
                                {userProfile?.profilePic ? (
                                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg mb-4 overflow-hidden">
                                        <img src={userProfile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-primary-dark dark:bg-accent text-white rounded-full flex items-center justify-center text-4xl font-serif border-4 border-white dark:border-gray-800 shadow-lg mb-4">
                                        <FiUser />
                                    </div>
                                )}
                                <div>
                                    <h2 className="font-serif text-2xl text-primary-dark dark:text-white mb-1">
                                        {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'My Account'}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{userProfile?.email || 'Welcome back, Beautiful'}</p>
                                </div>
                            </div>
                            
                            <nav className="space-y-2">
                                {TABS.map((tab) => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium transition-all duration-300 cursor-pointer ${activeTab === tab.id ? 'bg-primary-dark dark:bg-accent text-white shadow-lg shadow-primary-dark/20 scale-105' : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800/80 hover:text-primary-dark dark:hover:text-white hover:shadow-sm'}`}
                                    >
                                        <tab.icon size={20} className={activeTab === tab.id ? 'opacity-100' : 'opacity-70'} /> 
                                        {tab.label}
                                    </button>
                                ))}
                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button 
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-medium transition-colors cursor-pointer"
                                    >
                                        <FiLogOut size={18} /> Sign Out
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        
                        {/* DASHBOARD TAB */}
                        {activeTab === "dashboard" && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-white/80 dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white dark:border-gray-800">
                                    <h3 className="font-serif text-3xl text-primary-dark dark:text-white mb-3">
                                        Welcome back{userProfile ? `, ${userProfile.firstName}` : ''}!
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg">Manage your orders, update your profile, and track your rewards all in one place.</p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300" onClick={() => setActiveTab('orders')}>
                                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                                                <FiPackage size={22} className="text-primary-dark dark:text-white" />
                                            </div>
                                            <p className="text-3xl font-serif text-primary-dark dark:text-white mb-1">{orders.length}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Orders</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-amber-950/30 p-6 rounded-2xl shadow-sm border border-orange-100 dark:border-amber-900/40 text-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300" onClick={() => setActiveTab('rewards')}>
                                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-4">
                                                <FiGift size={22} className="text-orange-500 dark:text-amber-400" />
                                            </div>
                                            <p className="text-3xl font-serif text-orange-600 dark:text-amber-400 mb-1">{calculatedPoints.toLocaleString()}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest text-orange-400 dark:text-amber-500">Points</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-white to-pink-50 dark:from-gray-800 dark:to-pink-950/30 p-6 rounded-2xl shadow-sm border border-pink-100 dark:border-pink-900/40 text-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300" onClick={() => setActiveTab('wishlist')}>
                                            <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center mx-auto mb-4">
                                                <FiHeart size={22} className="text-pink-500 dark:text-pink-400" />
                                            </div>
                                            <p className="text-3xl font-serif text-pink-600 dark:text-pink-400 mb-1">{wishlistItems.length}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest text-pink-400 dark:text-pink-500">Saved</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30 p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/40 text-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300" onClick={() => setActiveTab('addresses')}>
                                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-4">
                                                <FiMapPin size={22} className="text-blue-500 dark:text-blue-400" />
                                            </div>
                                            <p className="text-3xl font-serif text-blue-600 dark:text-blue-400 mb-1">{(userProfile?.addresses || []).length}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 dark:text-blue-500">Addresses</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ORDER HISTORY TAB */}
                        {activeTab === "orders" && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white dark:border-gray-800"
                            >
                                <h3 className="font-serif text-3xl text-primary-dark dark:text-white mb-8">Order History</h3>
                                
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 dark:border-gray-700 border-b-primary-dark dark:border-b-accent"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500 shadow-sm">
                                            <FiPackage size={24} />
                                        </div>
                                        <h4 className="font-medium text-primary-dark dark:text-white mb-2">No orders yet</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">When you place an order, it will appear here.</p>
                                        <Link to="/product" className="inline-block px-6 py-2.5 bg-primary-dark dark:bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-colors">
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map((order, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                key={order.orderId || idx} 
                                                className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                                            >
                                                <div className="bg-gray-50 dark:bg-gray-800/60 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 dark:border-gray-800">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                                                        <p className="text-sm font-medium text-primary-dark dark:text-white">
                                                            {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total</p>
                                                        <p className="text-sm font-medium text-primary-dark dark:text-white">LKR {(order.total || 0).toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Order #</p>
                                                        <p className="text-sm font-medium text-accent">{order.orderId}</p>
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                         {String(order.status || "Preparing").toLowerCase() !== "shipped" && 
                                                          String(order.status || "Preparing").toLowerCase() !== "delivered" && 
                                                          String(order.status || "Preparing").toLowerCase() !== "cancelled" && (
                                                             <button
                                                                 onClick={() => handleCustomerCancelOrder(order.orderId)}
                                                                 className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors inline-block text-center cursor-pointer shadow-sm"
                                                             >
                                                                 Cancel Order
                                                             </button>
                                                         )}

                                                         <Link 
                                                             to={`/invoice/${order.orderId}`}
                                                             className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors inline-block text-center ${
                                                                 String(order.status || "").toLowerCase() === "cancelled" 
                                                                     ? "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20"
                                                                     : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                                             }`}
                                                         >
                                                             {String(order.status || "").toLowerCase() === "cancelled" ? "Cancellation Invoice" : "View Invoice"}
                                                         </Link>
                                                     </div>
                                                    </div>
                                                </div>
                                                <div className="px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-primary-dark dark:text-white mb-1">
                                                            Status: <span className={
                                                                order.status === 'Delivered' ? 'text-emerald-600 dark:text-emerald-400' :
                                                                order.status === 'Shipped' ? 'text-violet-600 dark:text-violet-400' :
                                                                order.status === 'Processing' ? 'text-blue-600 dark:text-blue-400' :
                                                                order.status === 'Cancelled' ? 'text-rose-500 dark:text-rose-400' :
                                                                'text-amber-600 dark:text-amber-400'
                                                            }>{order.status}</span>
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {order.orderItems?.length || 0} items in this order
                                                        </p>
                                                    </div>
                                                    <div className="flex -space-x-4">
                                                        {order.orderItems?.slice(0, 3).map((item, i) => (
                                                            <div key={i} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                                                                {item.image && <img src={item.image} alt="item" className="w-full h-full object-cover" />}
                                                            </div>
                                                        ))}
                                                        {(order.orderItems?.length || 0) > 3 && (
                                                            <div className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
                                                                +{(order.orderItems.length - 3)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* SECURITY & INFO TAB (EDIT PROFILE) */}
                        {activeTab === "security" && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white dark:border-gray-800"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-primary-dark dark:bg-accent text-white rounded-full flex items-center justify-center text-xl shadow-lg">
                                        <FiShield />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-3xl text-primary-dark dark:text-white">Personal Details</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Update your information to keep your profile secure.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="space-y-2 flex-1">
                                            <label className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">First Name</label>
                                            <input 
                                                type="text" required
                                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white focus:outline-none focus:border-primary-dark dark:focus:border-accent focus:ring-1 focus:ring-primary-dark dark:focus:ring-accent transition-all shadow-sm" 
                                                value={editFName} onChange={(e) => setEditFName(e.target.value)} 
                                            />
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <label className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Last Name</label>
                                            <input 
                                                type="text" required
                                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white focus:outline-none focus:border-primary-dark dark:focus:border-accent focus:ring-1 focus:ring-primary-dark dark:focus:ring-accent transition-all shadow-sm" 
                                                value={editLName} onChange={(e) => setEditLName(e.target.value)} 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Email Address (Cannot be changed)</label>
                                        <input 
                                            type="email" disabled
                                            className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-sm" 
                                            value={userProfile?.email || ""} 
                                        />
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <label className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Update Profile Picture</label>
                                        <div className="relative overflow-hidden">
                                            <input 
                                                type="file" 
                                                onChange={(e) => setEditFile(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                accept="image/*"
                                            />
                                            <div className="w-full bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 border-dashed text-primary-dark dark:text-white text-sm rounded-xl px-4 py-6 outline-none flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
                                                <FiUploadCloud size={24} className="text-gray-400 dark:text-gray-500" /> 
                                                <span className="font-medium">{editFile ? editFile.name : 'Click or drag image to upload'}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button 
                                            type="submit"
                                            disabled={isUpdating || (!editFile && editFName === userProfile?.firstName && editLName === userProfile?.lastName)}
                                            className="w-full md:w-auto bg-primary-dark dark:bg-accent text-white py-4 px-8 rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black dark:hover:bg-accent/80 transition-all flex justify-center items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {isUpdating ? 'Saving Changes...' : 'Save Changes'} <FiSave />
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* ADDRESS BOOK TAB */}
                        {activeTab === "addresses" && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white dark:border-gray-800"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-dark dark:bg-accent text-white rounded-full flex items-center justify-center text-xl shadow-lg">
                                            <FiMapPin />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-3xl text-primary-dark dark:text-white">Address Book</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Manage your shipping and billing addresses.</p>
                                        </div>
                                    </div>
                                    {!isAddingAddress && (
                                        <button 
                                            onClick={() => setIsAddingAddress(true)}
                                            className="bg-primary-dark dark:bg-accent text-white px-4 py-2 rounded-xl text-sm font-medium tracking-widest uppercase hover:bg-black dark:hover:bg-accent/80 transition-colors flex items-center gap-2 shadow-md cursor-pointer"
                                        >
                                            <FiPlus /> Add New
                                        </button>
                                    )}
                                </div>

                                {isAddingAddress ? (
                                    <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner max-w-2xl">
                                        <h4 className="font-serif text-xl text-primary-dark dark:text-white mb-4">{editingAddressIndex !== null ? "Edit Address" : "Add New Address"}</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Address Label</label>
                                                <select 
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent transition-all"
                                                    value={newAddress.label}
                                                    onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                                                >
                                                    <option value="Home">Home</option>
                                                    <option value="Work">Work</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Street Address</label>
                                                <input 
                                                    type="text" required
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent transition-all"
                                                    value={newAddress.street}
                                                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                                                    placeholder="123 Beauty Lane, Apt 4B"
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="space-y-2 flex-1">
                                                    <label className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">City</label>
                                                    <input 
                                                        type="text" required
                                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent transition-all"
                                                        value={newAddress.city}
                                                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                                        placeholder="New York"
                                                    />
                                                </div>
                                                <div className="space-y-2 flex-1">
                                                    <label className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">ZIP Code</label>
                                                    <input 
                                                        type="text" required
                                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent transition-all"
                                                        value={newAddress.zipCode}
                                                        onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                                                        placeholder="10001"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Phone Number</label>
                                                <input 
                                                    type="tel" required
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-xl text-primary-dark dark:text-white outline-none focus:border-primary-dark dark:focus:border-accent transition-all"
                                                    value={newAddress.phone}
                                                    onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                                                    placeholder="0771234567"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <input 
                                                    type="checkbox" 
                                                    id="isDefault" 
                                                    checked={newAddress.isDefault}
                                                    onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                                                    className="w-4 h-4 text-primary-dark dark:accent-accent cursor-pointer"
                                                />
                                                <label htmlFor="isDefault" className="text-sm text-gray-600 dark:text-gray-300 font-medium cursor-pointer">Set as default address</label>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <button 
                                                type="submit"
                                                className="bg-primary-dark dark:bg-accent text-white px-6 py-3 rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black dark:hover:bg-accent/80 transition-colors cursor-pointer"
                                            >
                                                {editingAddressIndex !== null ? "Update Address" : "Save Address"}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={handleCancelAddAddress}
                                                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {userProfile?.addresses && userProfile.addresses.length > 0 ? (
                                            userProfile.addresses.map((addr, index) => (
                                                <div key={index} className={`relative p-6 rounded-2xl border-2 transition-all ${addr.isDefault ? 'border-primary-dark dark:border-accent bg-primary-dark/5 dark:bg-accent/10' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700'}`}>
                                                    {addr.isDefault && (
                                                        <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest bg-primary-dark dark:bg-accent text-white px-2 py-1 rounded-md flex items-center gap-1">
                                                            <FiStar size={12}/> Default
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-primary-dark dark:text-white">
                                                            <FiMapPin size={14}/>
                                                        </div>
                                                        <span className="font-serif font-bold text-lg text-primary-dark dark:text-white">{addr.label}</span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300 mb-1">{addr.street}</p>
                                                    <p className="text-gray-600 dark:text-gray-300 mb-1">{addr.city}, {addr.zipCode}</p>
                                                    {addr.phone && <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium">Phone: {addr.phone}</p>}
                                                    {!addr.phone && <div className="mb-6"></div>}
                                                    
                                                    <div className="flex items-center gap-4">
                                                        {!addr.isDefault && (
                                                            <button 
                                                                onClick={() => handleSetDefaultAddress(index)}
                                                                className="text-xs uppercase font-semibold text-primary-dark dark:text-accent hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                                                            >
                                                                Set as Default
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleEditAddress(index)}
                                                            className="text-xs flex items-center gap-1 uppercase font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-dark dark:hover:text-white transition-colors ml-auto cursor-pointer"
                                                        >
                                                            <FiEdit2 /> Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteAddress(index)}
                                                            className="text-xs flex items-center gap-1 uppercase font-semibold text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                                                        >
                                                            <FiTrash2 /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-12 text-center bg-white/50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <FiMapPin size={24} />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No addresses saved yet.</p>
                                                <button 
                                                    onClick={() => setIsAddingAddress(true)}
                                                    className="mt-4 text-primary-dark dark:text-accent font-medium underline cursor-pointer"
                                                >
                                                    Add your first address
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* WISHLIST TAB */}
                        {activeTab === "wishlist" && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white dark:border-gray-800"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg">
                                        <FiHeart />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-3xl text-primary-dark dark:text-white">Saved Wishlist</h3>
                                        <p className="text-gray-500 dark:text-gray-400">{wishlistItems.length} items saved for later.</p>
                                    </div>
                                </div>

                                {wishlistItems.length === 0 ? (
                                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/40 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <FiHeart size={28} />
                                        </div>
                                        <h4 className="font-serif text-xl font-bold text-primary-dark dark:text-white mb-2">Your wishlist is empty</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">Explore our products and tap the heart icon to save your favorite beauty items!</p>
                                        <Link to="/product" className="inline-block px-6 py-3 bg-primary-dark dark:bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-colors shadow-md">
                                            Explore Products
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {wishlistItems.map((item, idx) => {
                                            const prodId = typeof item === 'object' ? (item.productId || item._id || item.id) : item;
                                            const name = item.name || item.title || "Luxury Beauty Product";
                                            const price = Number(item.price || 0);
                                            const image = item.image || item.productImage || "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

                                            return (
                                                <div key={idx} className="bg-white dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                                    <div>
                                                        <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-700">
                                                            <img src={image} alt={name} className="w-full h-full object-cover" />
                                                            <button 
                                                                onClick={() => {
                                                                    removeFromWishlist(prodId);
                                                                    toast.success("Item removed from Wishlist");
                                                                }}
                                                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                                                title="Remove from Wishlist"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </div>
                                                        <h4 className="font-bold text-sm text-primary-dark dark:text-white line-clamp-1 mb-1">{name}</h4>
                                                        <p className="font-serif font-bold text-accent text-sm mb-4">LKR {price > 0 ? price.toLocaleString() : 'N/A'}</p>
                                                    </div>
                                                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                                        <button 
                                                            onClick={() => {
                                                                addToCart(prodId, 1);
                                                                removeFromWishlist(prodId);
                                                                toast.success("✨ Item moved from Wishlist to Cart!");
                                                            }}
                                                            className="flex-1 py-2.5 bg-primary-dark dark:bg-accent text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-accent/80 transition-colors shadow-sm cursor-pointer"
                                                        >
                                                            <FiShoppingBag size={14} /> Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* REWARDS TAB */}
                        {activeTab === "rewards" && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white dark:border-gray-800"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg">
                                        <FiGift />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-3xl text-primary-dark dark:text-white">Aura Rewards & Wallet</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Earn points on every order and redeem exclusive beauty perks.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
                                        <p className="text-xs uppercase font-bold tracking-widest text-amber-100 mb-2">Available Points</p>
                                        <h4 className="font-serif text-4xl font-bold mb-4">{calculatedPoints.toLocaleString()} <span className="text-lg font-normal">pts</span></h4>
                                        <p className="text-xs text-amber-100">Worth LKR {(calculatedPoints * 1).toLocaleString()} in checkout discounts</p>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                        <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-2">Membership Tier</p>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiAward className="text-amber-500" size={24} />
                                            <h4 className="font-serif text-2xl font-bold text-primary-dark dark:text-white">
                                                {calculatedPoints >= 1500 ? "VIP Gold" : calculatedPoints >= 500 ? "Silver Aura" : "Bronze Member"}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {calculatedPoints >= 1500 ? "Enjoy free express shipping & double points!" : calculatedPoints >= 500 ? "Earn 500 more points for VIP tier." : "Earn 500 points to unlock Silver status."}
                                        </p>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                        <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-2">Order Earn Rate</p>
                                        <h4 className="font-serif text-2xl font-bold text-accent mb-2">1 Point / LKR 100</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Automatically credited on completed orders.</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                    <h4 className="font-serif text-lg font-bold text-primary-dark dark:text-white mb-4">How to Earn & Redeem</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <FiCheckCircle className="text-emerald-500 shrink-0 mt-1" size={18} />
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Shop online and automatically earn 1 point for every LKR 100 spent.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <FiCheckCircle className="text-emerald-500 shrink-0 mt-1" size={18} />
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Use your accumulated points during checkout for instant discounts on your favorite products.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <FiCheckCircle className="text-emerald-500 shrink-0 mt-1" size={18} />
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Points never expire as long as your account remains active.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* OTHER TABS PLACEHOLDERS */}
                        {["payments", "preferences"].includes(activeTab) && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/80 dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white dark:border-gray-800 h-96 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mb-6 text-primary-dark dark:text-white shadow-inner">
                                    <FiSettings size={40} className="opacity-80" />
                                </div>
                                <h3 className="font-serif text-3xl text-primary-dark dark:text-white mb-3 capitalize">{activeTab} Module</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg">This section is currently under construction and will feature advanced user controls.</p>
                            </motion.div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}
