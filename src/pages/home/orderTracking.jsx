import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FiSearch, 
    FiPackage, 
    FiCheckCircle, 
    FiTruck, 
    FiMapPin, 
    FiClock, 
    FiFileText, 
    FiArrowLeft,
    FiRefreshCw,
    FiShield,
    FiPhone,
    FiHelpCircle,
    FiBox,
    FiActivity,
    FiChevronRight,
    FiCalendar,
    FiStar
} from "react-icons/fi";
import { addToCart } from "../../utils/cartFunction";

export default function OrderTracking() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Guard view if not logged in
    if (!token) {
        return (
            <div className="w-full min-h-screen bg-gray-50 dark:bg-[#121212] pt-28 pb-16 px-4 flex items-center justify-center font-sans">
                <div className="max-w-md w-full bg-white dark:bg-[#181820]/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto shadow-sm">
                        <FiShield size={32} />
                    </div>
                    <div>
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary-dark dark:text-white mb-2">
                            Sign In Required
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Order tracking & live process updates are available exclusively for registered Aura Cosmetics account holders.
                        </p>
                    </div>
                    <div className="pt-2 space-y-3">
                        <Link to="/login" className="block w-full py-3.5 bg-primary-dark dark:bg-accent text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-md">
                            Sign In to Your Account
                        </Link>
                        <Link to="/singin" className="block w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-primary-dark dark:text-gray-200 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                            Create New Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    // Initial order ID from query param or default
    const initialOrderId = searchParams.get("id") || "";
    const [searchId, setSearchId] = useState(initialOrderId);
    const [currentOrderId, setCurrentOrderId] = useState(initialOrderId || "CBC1018");
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userOrders, setUserOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("orders"); // "orders", "details"
    const [orderStatusFilter, setOrderStatusFilter] = useState("all"); // "all", "active", "completed", "cancelled"

    // Default mock processing orders for rich demonstration if backend has few records
    const fallbackOrders = [
        {
            orderId: "CBC1018",
            date: new Date(Date.now() - 3600000 * 5).toISOString(),
            name: "Ganidu Chalinda",
            address: "123 Aura Boulevard, Colombo 03",
            phone: "0771234567",
            notes: "Shipping: express | Payment: card",
            status: "Processing",
            orderItems: [
                { productId: "PROD-1", name: "Luminous Silk Foundation", price: 5800, quantity: 1, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
                { productId: "PROD-2", name: "Velvet Matte Lipstick", price: 2400, quantity: 2, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
            ]
        },
        {
            orderId: "CBC1022",
            date: new Date(Date.now() - 3600000 * 24).toISOString(),
            name: "Nipuni Perera",
            address: "45 Rosewood Gardens, Kandy",
            phone: "0718889900",
            notes: "Shipping: standard | Payment: card",
            status: "Shipped",
            orderItems: [
                { productId: "PROD-3", name: "Hydrating Rose Serum", price: 4200, quantity: 1, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
            ]
        },
        {
            orderId: "CBC1025",
            date: new Date(Date.now() - 3600000 * 2).toISOString(),
            name: "Kasun Jayasuriya",
            address: "88 Sea View Avenue, Galle",
            phone: "0751112233",
            notes: "Shipping: express | Payment: COD",
            status: "Preparing",
            orderItems: [
                { productId: "PROD-4", name: "Vitamin C Glow Cleanser", price: 3100, quantity: 1, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
            ]
        }
    ];

    // Fetch user's all orders if logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                let ordersToStore = fallbackOrders;
                if (Array.isArray(res.data) && res.data.length > 0) {
                    ordersToStore = res.data;
                    setUserOrders(res.data);
                    if (!initialOrderId && res.data[0]?.orderId) {
                        setCurrentOrderId(res.data[0].orderId);
                        setSearchId(res.data[0].orderId);
                    }
                } else {
                    setUserOrders(fallbackOrders);
                }
                localStorage.setItem("aura_user_orders", JSON.stringify(ordersToStore));
                window.dispatchEvent(new Event("aura_orders_updated"));
            })
            .catch(err => {
                console.error("Error fetching user orders list:", err);
                setUserOrders(fallbackOrders);
                localStorage.setItem("aura_user_orders", JSON.stringify(fallbackOrders));
                window.dispatchEvent(new Event("aura_orders_updated"));
            });
        } else {
            setUserOrders(fallbackOrders);
            localStorage.setItem("aura_user_orders", JSON.stringify(fallbackOrders));
            window.dispatchEvent(new Event("aura_orders_updated"));
        }
    }, []);

    // Fetch specific order details (always from real API)
    useEffect(() => {
        if (!currentOrderId) return;

        let isMounted = true;
        setLoading(true);

        const fetchOrderData = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                // Not logged in — try to find in userOrders state
                const localMatch = userOrders.find(o => o.orderId === currentOrderId);
                if (isMounted) { setOrder(localMatch || null); setLoading(false); }
                return;
            }

            let foundOrder = null;

            // Step 1: Check already-loaded userOrders first (no extra network call)
            if (userOrders.length > 0) {
                foundOrder = userOrders.find(o => o.orderId === currentOrderId)
                    || userOrders.find(o => String(o.orderId || "").toLowerCase() === currentOrderId.toLowerCase());
            }

            // Step 2: If not found in local state, fetch all orders and filter
            if (!foundOrder) {
                try {
                    const res = await axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/api/orders`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (Array.isArray(res.data) && res.data.length > 0) {
                        foundOrder = res.data.find(o => o.orderId === currentOrderId)
                            || res.data.find(o => String(o.orderId || "").toLowerCase() === currentOrderId.toLowerCase());
                        // Also update the full orders list
                        if (isMounted) setUserOrders(res.data);
                    }
                } catch (err) {
                    console.error("fetchOrderData: /api/orders failed:", err.message);
                }
            }

            if (isMounted) {
                setOrder(foundOrder || null);
                setLoading(false);
            }
        };

        fetchOrderData();
        return () => { isMounted = false; };
    }, [currentOrderId]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchId.trim()) {
            toast.error("Please enter a valid Order ID.");
            return;
        }
        setCurrentOrderId(searchId.trim());
        setSearchParams({ id: searchId.trim() });
        setActiveTab("details");
    };

    const handleReorder = (items) => {
        if (!items || items.length === 0) return;
        items.forEach(item => {
            addToCart(item.productId || "mock-prod", item.quentity || item.quantity || 1);
        });
        toast.success("Items added to your cart!");
        navigate("/cart");
    };

    // Calculate totals
    const subtotal = order?.orderItems?.reduce((acc, item) => acc + (item.price * (item.quentity || item.quantity || 1)), 0) || 0;
    const isExpress = order?.notes?.toLowerCase().includes("express");
    const shipping = isExpress ? 800 : 400;
    const total = subtotal + shipping;

    const deliveryDate = new Date(order?.date || Date.now());
    deliveryDate.setDate(deliveryDate.getDate() + (isExpress ? 2 : 4));

    // Timeline Process Steps
    const PROCESS_STEPS = [
        { 
            key: "Preparing", 
            title: "Order Confirmed", 
            desc: "Payment verified & order registered", 
            icon: FiCheckCircle,
            time: "Step 1"
        },
        { 
            key: "Processing", 
            title: "Processing in Beauty Lab", 
            desc: "Quality inspecting & custom packaging", 
            icon: FiBox,
            time: "Step 2"
        },
        { 
            key: "Shipped", 
            title: "Handed to Express Courier", 
            desc: "Dispatched with delivery partner", 
            icon: FiTruck,
            time: "Step 3"
        },
        { 
            key: "Delivered", 
            title: "Out for Delivery & Delivered", 
            desc: "Arrived safely at recipient address", 
            icon: FiMapPin,
            time: "Step 4"
        }
    ];

    const currentStatus = order?.status || "Processing";
    let activeStepIdx = 0;
    if (currentStatus === "Cancelled") {
        activeStepIdx = -1;
    } else {
        const found = PROCESS_STEPS.findIndex(s => s.key === currentStatus);
        activeStepIdx = found >= 0 ? found : 1;
    }

    // Helper for status progress percentage
    const getStatusPercent = (status) => {
        if (status === "Preparing") return 25;
        if (status === "Processing") return 50;
        if (status === "Shipped") return 75;
        if (status === "Delivered") return 100;
        if (status === "Cancelled") return 100;
        return 50;
    };

    // Helper for status badge color styles
    const getStatusStyle = (status) => {
        switch (String(status || "").toLowerCase()) {
            case "preparing":
                return {
                    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30",
                    dot: "bg-amber-500",
                    animate: true
                };
            case "processing":
                return {
                    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30",
                    dot: "bg-blue-500",
                    animate: true
                };
            case "shipped":
                return {
                    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30",
                    dot: "bg-violet-500",
                    animate: false
                };
            case "delivered":
                return {
                    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
                    dot: "bg-emerald-500",
                    animate: false
                };
            case "cancelled":
                return {
                    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30",
                    dot: "bg-rose-500",
                    animate: false
                };
            default:
                return {
                    badge: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/30",
                    dot: "bg-gray-500",
                    animate: false
                };
        }
    };

    const allOrdersList = userOrders.length > 0 ? userOrders : fallbackOrders;
    const displayProcessingList = allOrdersList.filter(o => o.status !== "Completed" && o.status !== "Delivered" && o.status !== "Cancelled");
    const displayCompletedList = allOrdersList.filter(o => o.status === "Completed" || o.status === "Delivered");
    const displayCancelledList = allOrdersList.filter(o => o.status === "Cancelled");

    const renderOrderCard = (procOrder, idx) => {
        const procSubtotal = procOrder.orderItems?.reduce((acc, i) => acc + (i.price * (i.quentity || i.quantity || 1)), 0) || 0;
        const procShipping = procOrder.notes?.toLowerCase().includes("express") ? 800 : 400;
        const procTotal = procSubtotal + procShipping;
        const pct = getStatusPercent(procOrder.status);
        const statusStyle = getStatusStyle(procOrder.status);

        return (
            <div 
                key={`${procOrder.orderId}-${idx}`}
                className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-800 hover:border-accent/40 transition-all group"
            >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                    
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="font-serif font-bold text-xl md:text-2xl text-primary-dark dark:text-white">
                                Order #{procOrder.orderId}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusStyle.badge}`}>
                                <span className={`w-2 h-2 rounded-full ${statusStyle.dot} ${statusStyle.animate ? 'animate-ping' : ''}`}></span>
                                {procOrder.status || "Processing"}
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 pt-1">
                            <FiCalendar /> Placed on: {new Date(procOrder.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            <span>•</span>
                            <span className="font-medium text-primary-dark dark:text-gray-200">Recipient: {procOrder.name}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                        <div className="text-left lg:text-right">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">Order Amount</span>
                            <span className="font-serif font-bold text-xl text-accent">LKR {procTotal.toFixed(2)}</span>
                        </div>

                        <Link 
                            to={`/track-timeline/${procOrder.orderId}`}
                            className="px-5 py-2.5 bg-primary-dark dark:bg-accent text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all flex items-center gap-2 shadow-md cursor-pointer"
                        >
                            Track Timeline <FiChevronRight />
                        </Link>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="pt-6 pb-4">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        <span>{procOrder.status === 'Cancelled' ? 'Order Cancelled' : 'Order Processing Progress'}</span>
                        <span className={`${procOrder.status === 'Cancelled' ? 'text-rose-500' : 'text-accent'} font-bold`}>{procOrder.status === 'Cancelled' ? 'Cancelled' : `${pct}% Completed`}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ${procOrder.status === 'Cancelled' ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-accent'}`} 
                            style={{ width: `${pct}%` }}
                        ></div>
                    </div>
                </div>

                {/* PRODUCTS PREVIEW & REVIEW ACTION */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                        {procOrder.orderItems?.map((item, idx) => {
                            const isDeliveredOrCompleted = ['completed', 'delivered'].includes(String(procOrder.status || '').toLowerCase());
                            return (
                                <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shrink-0">
                                    {item.image && (
                                        <img src={item.image} alt={item.name} className="w-6 h-6 rounded-md object-cover" />
                                    )}
                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[140px] sm:max-w-[180px]">
                                        {item.name}
                                    </span>
                                    <span className="text-gray-400 font-bold">x{item.quentity || item.quantity || 1}</span>

                                    {isDeliveredOrCompleted && (
                                        <Link
                                            to={`/productInfo/${item.productId || item._id || item.id || 'PROD-1'}`}
                                            className="ml-2 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer border border-amber-500/30"
                                        >
                                            <FiStar size={10} className="fill-current" /> Write Review
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <Link 
                        to={`/invoice/${procOrder.orderId}`}
                        className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-accent dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1 shrink-0"
                    >
                        <FiFileText /> View Invoice
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-[#121212] pt-28 pb-16 px-4 md:px-12 font-sans relative overflow-hidden">
            
            {/* Background Decorative Glow */}
            <div className="absolute top-10 right-10 w-96 h-96 bg-accent/20 dark:bg-pink-900/20 rounded-full filter blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-200/30 dark:bg-rose-900/20 rounded-full filter blur-3xl opacity-40 pointer-events-none"></div>

            <div className="max-w-5xl mx-auto relative z-10 space-y-8">
                
                {/* Top Back Link & Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <button 
                            onClick={() => navigate('/product')}
                            className="inline-flex items-center gap-2 px-4 py-2 mb-3 text-xs uppercase tracking-widest font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-dark dark:hover:text-white bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all cursor-pointer group"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Shop
                        </button>
                        <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-dark dark:text-white">
                            Active Orders & Live Processing
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Real-time order fulfillment & live status monitoring.
                        </p>
                    </div>

                    {order && (
                        <Link 
                            to={`/invoice/${order.orderId}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-dark dark:bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-md cursor-pointer"
                        >
                            <FiFileText size={16} /> View Tax Invoice
                        </Link>
                    )}
                </div>

                {/* NAVIGATION TABS & SEARCH BAR */}
                <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
                    
                    {/* View Filter Pills */}
                    <div className="flex flex-wrap gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <button 
                            onClick={() => setActiveTab("orders")}
                            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === "orders" 
                                    ? "bg-accent text-white shadow-md" 
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            <FiPackage /> My Orders ({(userOrders.length > 0 ? userOrders.length : fallbackOrders.length)})
                        </button>

                        <button 
                            onClick={() => setActiveTab("details")}
                            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === "details" 
                                    ? "bg-primary-dark dark:bg-accent text-white shadow-md" 
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            <FiPackage /> Timeline (#{currentOrderId})
                        </button>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input 
                                type="text"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                placeholder="Enter specific Order ID (e.g. CBC1018, CBC1022)..."
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-11 pr-4 py-3.5 rounded-2xl text-primary-dark dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm outline-none focus:border-primary-dark dark:focus:border-accent transition-all"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full md:w-auto px-8 py-3.5 bg-primary-dark dark:bg-accent text-white rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-black dark:hover:bg-accent/80 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        >
                            <FiSearch /> Search Order
                        </button>
                    </form>

                </div>

                {/* ORDER LISTS SECTION */}
                {activeTab === "orders" && (
                    <div className="space-y-12">
                        {/* Status Filter Sub-Tabs */}
                        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#181820]/90 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            {[
                                { id: "all", label: "All Orders", count: allOrdersList.length, icon: FiPackage },
                                { id: "active", label: "Active / Processing", count: displayProcessingList.length, icon: FiActivity, color: "text-amber-500" },
                                { id: "completed", label: "Completed", count: displayCompletedList.length, icon: FiCheckCircle, color: "text-emerald-500" },
                                { id: "cancelled", label: "Cancelled", count: displayCancelledList.length, icon: FiPackage, color: "text-rose-500" },
                            ].map(tab => {
                                const Icon = tab.icon;
                                const isSelected = orderStatusFilter === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setOrderStatusFilter(tab.id)}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                                            isSelected 
                                                ? "bg-primary-dark dark:bg-accent text-white shadow-md scale-105" 
                                                : "bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        <Icon className={isSelected ? "text-white" : (tab.color || "")} size={14} />
                                        <span>{tab.label}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSelected ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        {(orderStatusFilter === "all" || orderStatusFilter === "active") && displayProcessingList.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-serif text-2xl font-bold text-primary-dark dark:text-white flex items-center gap-2">
                                        <FiActivity className="text-amber-500 animate-pulse" /> Active & Processing Orders
                                    </h2>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {displayProcessingList.length} Orders
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {displayProcessingList.map((procOrder, idx) => renderOrderCard(procOrder, idx))}
                                </div>
                            </div>
                        )}

                        {(orderStatusFilter === "all" || orderStatusFilter === "completed") && displayCompletedList.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-serif text-2xl font-bold text-primary-dark dark:text-white flex items-center gap-2">
                                        <FiCheckCircle className="text-emerald-500" /> Completed Orders
                                    </h2>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {displayCompletedList.length} Orders
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {displayCompletedList.map((procOrder, idx) => renderOrderCard(procOrder, idx))}
                                </div>
                            </div>
                        )}

                        {(orderStatusFilter === "all" || orderStatusFilter === "cancelled") && displayCancelledList.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-serif text-2xl font-bold text-primary-dark dark:text-white flex items-center gap-2">
                                        <FiPackage className="text-rose-500" /> Cancelled Orders
                                    </h2>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {displayCancelledList.length} Orders
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {displayCancelledList.map((procOrder, idx) => renderOrderCard(procOrder, idx))}
                                </div>
                            </div>
                        )}

                        {((orderStatusFilter === "active" && displayProcessingList.length === 0) ||
                          (orderStatusFilter === "completed" && displayCompletedList.length === 0) ||
                          (orderStatusFilter === "cancelled" && displayCancelledList.length === 0) ||
                          (displayProcessingList.length === 0 && displayCompletedList.length === 0 && displayCancelledList.length === 0)) && (
                            <div className="text-center py-16 bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <FiBox className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-lg font-serif font-bold text-primary-dark dark:text-white">No {orderStatusFilter !== "all" ? orderStatusFilter.toUpperCase() : ""} Orders Found</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">There are no orders matching this filter.</p>
                                <Link to="/product" className="inline-block mt-6 px-6 py-2.5 bg-primary-dark dark:bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all">Start Shopping</Link>
                            </div>
                        )}
                    </div>
                )}


                {/* TAB 2: DETAILED TIMELINE & ORDER SUMMARY */}
                {(activeTab === "details" || activeTab === "search") && (
                    <>
                        {loading ? (
                            <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800 shadow-xl">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-b-primary-dark dark:border-b-accent mx-auto mb-4"></div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Fetching order status details...</p>
                            </div>
                        ) : order ? (
                            <div className="space-y-8">
                                
                                {/* ORDER LIVE STATUS HEADER CARD */}
                                <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary-dark dark:text-white">
                                                    Order #{order.orderId}
                                                </h2>
                                                <span className="relative flex h-3 w-3">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                Placed on: {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-accent/10 text-accent border border-accent/30 shadow-sm">
                                                Status: {currentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ESTIMATED DELIVERY COUNTDOWN */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-center sm:text-left">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold block mb-1">Estimated Delivery</span>
                                            <p className="font-serif font-bold text-lg text-primary-dark dark:text-white">
                                                {deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold block mb-1">Shipping Partner</span>
                                            <p className="font-serif font-bold text-lg text-primary-dark dark:text-white">
                                                {isExpress ? "Aura Express Courier" : "Standard Postal Delivery"}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold block mb-1">Total Amount</span>
                                            <p className="font-serif font-bold text-lg text-accent">
                                                LKR {total.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* LIVE PROCESS TIMELINE */}
                                <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                                    <h3 className="font-serif text-2xl text-primary-dark dark:text-white mb-8">
                                        Live Order Fulfillment Timeline
                                    </h3>

                                    <div className="relative pl-6 md:pl-8 border-l-2 border-gray-200 dark:border-gray-800 space-y-10 my-4 ml-2 md:ml-4">
                                        {PROCESS_STEPS.map((step, idx) => {
                                            const isDone = activeStepIdx >= idx;
                                            const isCurrent = activeStepIdx === idx;
                                            const Icon = step.icon;

                                            return (
                                                <div key={idx} className="relative group">
                                                    <div 
                                                        className={`absolute -left-[31px] md:-left-[39px] top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                                                            isCurrent 
                                                                ? 'bg-accent text-white border-white dark:border-[#181820] shadow-lg scale-110 ring-4 ring-accent/20' 
                                                                : isDone 
                                                                    ? 'bg-emerald-500 text-white border-white dark:border-[#181820] shadow' 
                                                                    : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                                                        }`}
                                                    >
                                                        <Icon size={18} />
                                                    </div>

                                                    <div className="pl-4">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className={`font-serif text-xl font-bold ${isDone ? 'text-primary-dark dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                                                {step.title}
                                                            </h4>
                                                            {isCurrent && (
                                                                <span className="bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-accent/30 animate-pulse">
                                                                    Current Step
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-light">
                                                            {step.desc}
                                                        </p>
                                                        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                                            Fulfillment Stage: {step.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ORDERED ITEMS & DELIVER TO INFO */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    
                                    {/* Items List (2 Cols) */}
                                    <div className="lg:col-span-2 bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-serif text-2xl text-primary-dark dark:text-white">
                                                Ordered Items ({order.orderItems?.length || 0})
                                            </h3>
                                            <button 
                                                onClick={() => handleReorder(order.orderItems)}
                                                className="text-xs uppercase font-bold tracking-widest text-accent hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                                            >
                                                <FiRefreshCw /> Buy Again
                                            </button>
                                        </div>

                                        <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                                            {order.orderItems?.map((item, idx) => {
                                                const qty = item.quentity || item.quantity || 1;
                                                return (
                                                    <div key={idx} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                                                                {item.image ? (
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-primary-dark dark:text-white text-base">
                                                                    {item.name}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                    Qty: {qty} × LKR {item.price?.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="font-bold text-primary-dark dark:text-white text-base shrink-0">
                                                            LKR {(item.price * qty).toFixed(2)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Customer Delivery Details (1 Col) */}
                                    <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between space-y-6">
                                        <div>
                                            <h3 className="font-serif text-2xl text-primary-dark dark:text-white mb-4">
                                                Delivery Details
                                            </h3>
                                            
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <span className="text-xs uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 block mb-1">Recipient</span>
                                                    <p className="font-semibold text-primary-dark dark:text-white">{order.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 block mb-1">Address</span>
                                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{order.address}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 block mb-1">Contact Phone</span>
                                                    <p className="text-gray-600 dark:text-gray-300 font-medium">{order.phone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                <FiShield size={16} /> Aura Buyer Protection Active
                                            </div>
                                            <a 
                                                href="tel:+94112345678"
                                                className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-primary-dark dark:text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                            >
                                                <FiPhone /> Contact Support
                                            </a>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        ) : null}
                    </>
                )}

            </div>
        </div>
    );
}
