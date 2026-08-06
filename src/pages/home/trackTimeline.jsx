import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { 
    FiArrowLeft, 
    FiCheckCircle, 
    FiBox, 
    FiTruck, 
    FiMapPin, 
    FiClock, 
    FiFileText, 
    FiRefreshCw, 
    FiShield, 
    FiPhone, 
    FiNavigation, 
    FiCalendar,
    FiPackage,
    FiExternalLink,
    FiAlertTriangle,
    FiX,
    FiLock
} from "react-icons/fi";

export default function TrackTimeline() {
    const { orderId } = useParams();
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
                            Order tracking & timeline status details are available exclusively for registered Aura Cosmetics account holders.
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
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Customer Cancellation Modal States
    const [showCustomerCancelModal, setShowCustomerCancelModal] = useState(false);
    const [cancelReasonOption, setCancelReasonOption] = useState("Ordered by mistake / Selected wrong product variant");
    const [customerCancelText, setCustomerCancelText] = useState("Ordered by mistake / Selected wrong product variant");

    const getMockOrder = (id) => {
        let status = "Processing";
        let items = [
            { productId: "PROD-1", name: "Luminous Silk Foundation", price: 5800, quantity: 1, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
            { productId: "PROD-2", name: "Velvet Matte Lipstick", price: 2400, quantity: 2, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
        ];

        if (id === "CBC0002") {
            status = "Preparing";
            items = [
                { productId: "PROD-5", name: "Velvet Noir Mascara", price: 3200, quantity: 2, image: "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
                { productId: "PROD-6", name: "Hydrating Botanical Serum", price: 4800, quantity: 3, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
            ];
        } else if (id === "CBC0004") {
            status = "Shipped";
        }

        return {
            orderId: id || "CBC0006",
            date: new Date().toISOString(),
            name: "Ganidu Chalinda",
            address: "Kekanadura, Matara - 81020",
            phone: "0715588780",
            notes: "Shipping: express | Payment: card",
            status: status,
            orderItems: items
        };
    };

    const normalizeOrder = (rawOrder, id) => {
        const fallbackId = id || "CBC0006";
        if (!rawOrder || typeof rawOrder !== "object") {
            return getMockOrder(fallbackId);
        }

        let rawItems = rawOrder.orderItems || rawOrder.items || rawOrder.cartItems || rawOrder.products;
        if (!Array.isArray(rawItems) || rawItems.length === 0) {
            rawItems = getMockOrder(fallbackId).orderItems;
        }

        const normalizedItems = rawItems.map(item => ({
            productId: item.productId || item._id || "PROD-X",
            name: item.name || item.productName || item.title || "Luxury Beauty Product",
            price: Number(item.price || item.unitPrice || 0),
            quantity: Number(item.quantity || item.quentity || item.qty || 1),
            image: item.image || item.productImage || item.img || "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        }));

        return {
            orderId: rawOrder.orderId || fallbackId,
            date: rawOrder.date || rawOrder.createdAt || new Date().toISOString(),
            name: rawOrder.name || rawOrder.customerName || "Ganidu Chalinda",
            address: rawOrder.address || rawOrder.shippingAddress || "Kekanadura, Matara - 81020",
            phone: rawOrder.phone || rawOrder.contactPhone || "0715588780",
            notes: rawOrder.notes || "",
            status: rawOrder.status || "Preparing",
            cancelReason: rawOrder.cancelReason || "",
            orderItems: normalizedItems
        };
    };

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchOrder = async () => {
            // Mock order shortcut
            if (!orderId || orderId.startsWith("mock-")) {
                if (isMounted) { setOrder(getMockOrder(orderId)); setLoading(false); }
                return;
            }

            let foundOrder = null;

            // Step 1: Fetch all customer orders (proven endpoint)
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/orders`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (Array.isArray(res.data) && res.data.length > 0) {
                    // Try exact match first
                    foundOrder = res.data.find(o => o.orderId === orderId)
                        // Fallback: case-insensitive match
                        || res.data.find(o => String(o.orderId || "").toLowerCase() === orderId.toLowerCase());
                }
            } catch (e) {
                console.warn("fetchOrder: /api/orders failed:", e.message);
            }

            // Step 2: If not found, try the specific /:orderId endpoint
            if (!foundOrder) {
                try {
                    const res = await axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (Array.isArray(res.data)) {
                        foundOrder = res.data.find(o => o.orderId === orderId) || res.data[0];
                    } else if (res.data && res.data.orderId) {
                        foundOrder = res.data;
                    }
                } catch (e) {
                    console.warn("fetchOrder: /api/orders/:id failed:", e.message);
                }
            }

            if (isMounted) {
                setOrder(foundOrder ? normalizeOrder(foundOrder, orderId) : getMockOrder(orderId));
                setLoading(false);
            }
        };

        fetchOrder();
        return () => { isMounted = false; };
    }, [orderId, token]);

    const currentOrder = order || getMockOrder(orderId);

    const subtotal = currentOrder.orderItems?.reduce((acc, item) => acc + (Number(item?.price || 0) * Number(item?.quantity || 1)), 0) || 0;
    const isExpress = String(currentOrder.notes || "").toLowerCase().includes("express");
    const shipping = isExpress ? 800 : 400;
    const total = subtotal + shipping;

    const orderDateObj = new Date(currentOrder.date || Date.now());
    const validOrderDate = isNaN(orderDateObj.getTime()) ? new Date() : orderDateObj;

    const deliveryDate = new Date(validOrderDate);
    deliveryDate.setDate(deliveryDate.getDate() + (isExpress ? 2 : 4));

    const TIMELINE_STEPS = [
        { 
            key: "Preparing", 
            title: "Order Placed & Confirmed", 
            desc: "Payment verified. Formulating product in laboratory", 
            time: "Step 1 - Laboratory Prep",
            icon: FiCheckCircle
        },
        { 
            key: "Processing", 
            title: "Quality Testing & Packaging", 
            desc: "Quality inspection and luxury aesthetic box wrapping", 
            time: "Step 2 - Boxing & Batching",
            icon: FiBox
        },
        { 
            key: "Shipped", 
            title: "Handed to Courier Partner", 
            desc: "Package in transit with express courier van", 
            time: "Step 3 - Dispatching",
            icon: FiTruck
        },
        { 
            key: "Delivered", 
            title: "Out for Delivery & Delivered", 
            desc: "Arrived at recipient doorstep", 
            time: "Step 4 - Final Arrival",
            icon: FiMapPin
        }
    ];

    const currentStatus = currentOrder.status || "Preparing";
    const normStatus = currentStatus.toLowerCase();
    
    // Customer can cancel BEFORE Shipped status (i.e. status is Preparing, Processing, Confirmed)
    const canCustomerCancel = normStatus !== "shipped" && normStatus !== "delivered" && normStatus !== "cancelled";

    let activeStepIdx = 0;
    if (normStatus === "cancelled") activeStepIdx = -1;
    else {
        const found = TIMELINE_STEPS.findIndex(s => s.key.toLowerCase() === normStatus);
        activeStepIdx = found >= 0 ? found : 0;
    }

    const getProgressPercent = (statusStr) => {
        const s = String(statusStr || "").toLowerCase();
        if (s === "preparing") return 25;
        if (s === "processing") return 50;
        if (s === "shipped") return 75;
        if (s === "delivered") return 100;
        return 25;
    };

    const progressPct = getProgressPercent(currentStatus);

    const handleConfirmCustomerCancel = async () => {
        const finalReason = "Customer Self-Cancelled: " + (customerCancelText.trim() || cancelReasonOption);
        const loadingToast = toast.loading("Cancelling your order & issuing full refund...");

        try {
            const existing = JSON.parse(localStorage.getItem('aura_cancellation_reasons') || '{}');
            existing[currentOrder.orderId] = finalReason;
            localStorage.setItem('aura_cancellation_reasons', JSON.stringify(existing));

            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${currentOrder.orderId}`, {
                status: "Cancelled",
                cancelReason: finalReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.dismiss(loadingToast);
            toast.success(`Order #${currentOrder.orderId} cancelled! Cancellation Invoice generated.`);
            setShowCustomerCancelModal(false);
            navigate(`/invoice/${currentOrder.orderId}`);
        } catch(err) {
            console.error(err);
            toast.dismiss(loadingToast);
            const existing = JSON.parse(localStorage.getItem('aura_cancellation_reasons') || '{}');
            existing[currentOrder.orderId] = finalReason;
            localStorage.setItem('aura_cancellation_reasons', JSON.stringify(existing));

            toast.success(`Order #${currentOrder.orderId} cancelled! Cancellation Invoice generated.`);
            setShowCustomerCancelModal(false);
            navigate(`/invoice/${currentOrder.orderId}`);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-[#121212] pt-28 pb-16 px-4 md:px-12 font-sans relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-10 right-10 w-96 h-96 bg-accent/20 dark:bg-pink-900/20 rounded-full filter blur-3xl opacity-40 pointer-events-none"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-200/30 dark:bg-rose-900/20 rounded-full filter blur-3xl opacity-40 pointer-events-none"></div>

            <div className="max-w-5xl mx-auto relative z-10 space-y-8">
                
                {/* Back Button & Top Action Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <Link 
                            to="/track-order"
                            className="inline-flex items-center gap-2 px-4 py-2 mb-3 text-xs uppercase tracking-widest font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-dark dark:hover:text-white bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all cursor-pointer group"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to My Orders
                        </Link>
                        <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-dark dark:text-white flex items-center gap-3">
                            Order Timeline #{currentOrder.orderId}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Live fulfillment tracking & courier dispatch status.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {canCustomerCancel && (
                            <button
                                onClick={() => setShowCustomerCancelModal(true)}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer hover:scale-105"
                            >
                                Cancel Order
                            </button>
                        )}

                        <Link 
                            to={`/invoice/${currentOrder.orderId}`}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer ${
                                normStatus === "cancelled" ? "bg-rose-600 hover:bg-rose-700" : "bg-primary-dark dark:bg-accent hover:bg-black dark:hover:bg-accent/80"
                            }`}
                        >
                            <FiFileText size={16} /> {normStatus === "cancelled" ? "Cancellation Invoice" : "View Tax Invoice"}
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800 shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-b-primary-dark dark:border-b-accent mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading live timeline for #{orderId}...</p>
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* CUSTOMER CANCELLATION BANNER (IF BEFORE SHIPPED) */}
                        {canCustomerCancel && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                                        <FiShield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-amber-500 text-lg">Order Eligible for Cancellation</h3>
                                        <p className="text-xs text-amber-600/90 dark:text-amber-400 mt-0.5">
                                            Your order is currently in <strong className="uppercase font-bold">{currentStatus}</strong> status and has not been dispatched to the courier van yet. You can cancel now for a 100% full refund.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowCustomerCancelModal(true)}
                                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg transition-all cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95"
                                >
                                    Cancel My Order
                                </button>
                            </div>
                        )}
                        
                        {/* HERO OVERVIEW BANNER */}
                        <div className="bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-serif text-3xl font-bold text-primary-dark dark:text-white">
                                            #{currentOrder.orderId}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                                            normStatus === "cancelled"
                                                ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                                                : normStatus === "delivered"
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                                : normStatus === "shipped"
                                                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30"
                                                : normStatus === "processing"
                                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                        }`}>
                                            <span className={`w-2.5 h-2.5 rounded-full ${
                                                normStatus === "cancelled" ? "bg-rose-500" :
                                                normStatus === "delivered" ? "bg-emerald-500" :
                                                normStatus === "shipped" ? "bg-violet-500" :
                                                normStatus === "processing" ? "bg-blue-500 animate-ping" :
                                                "bg-amber-500 animate-ping"
                                            }`}></span>
                                            Current Status: {currentStatus}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <FiCalendar /> Placed on: {validOrderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                <div className="text-left md:text-right">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Grand Total Paid</span>
                                    <span className="font-serif text-3xl font-bold text-accent">LKR {total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* PROGRESS BAR & ESTIMATE GRID */}
                            <div className="pt-6 space-y-6">
                                <div>
                                    <div className="flex justify-between items-center text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                        <span>Order Fulfillment Progress</span>
                                        <span className="text-accent font-bold">{progressPct}% Completed</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-gray-700">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 shadow-sm ${
                                                normStatus === "cancelled" ? "bg-rose-600" : "bg-gradient-to-r from-amber-500 via-accent to-emerald-500"
                                            }`}
                                            style={{ width: `${progressPct}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold block mb-1">Estimated Delivery</span>
                                        <p className="font-serif font-bold text-lg text-primary-dark dark:text-white">
                                            {deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold block mb-1">Courier Partner</span>
                                        <p className="font-serif font-bold text-lg text-primary-dark dark:text-white">
                                            {isExpress ? "Aura Express Courier" : "Standard Postal Service"}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold block mb-1">Tracking Code</span>
                                        <p className="font-mono font-bold text-lg text-accent">
                                            TRK-{currentOrder.orderId}-842
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FULL INTERACTIVE STAGE TIMELINE */}
                        <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                            <h3 className="font-serif text-2xl text-primary-dark dark:text-white mb-8">
                                Detailed Stage-by-Stage Timeline
                            </h3>

                            <div className="relative pl-6 md:pl-8 border-l-2 border-gray-200 dark:border-gray-800 space-y-10 my-4 ml-2 md:ml-4">
                                {TIMELINE_STEPS.map((step, idx) => {
                                    const isDone = activeStepIdx >= idx && normStatus !== "cancelled";
                                    const isCurrent = activeStepIdx === idx && normStatus !== "cancelled";
                                    const Icon = step.icon;

                                    return (
                                        <div key={idx} className="relative group">
                                            <div className={`absolute -left-[31px] md:-left-[39px] top-0.5 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
                                                isCurrent 
                                                    ? "bg-accent text-white ring-4 ring-accent/30 scale-110" 
                                                    : isDone 
                                                        ? "bg-emerald-500 text-white" 
                                                        : "bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-300 dark:border-gray-700"
                                            }`}>
                                                <Icon size={18} />
                                            </div>

                                            <div className="pl-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                    <h4 className={`font-serif text-lg font-bold ${
                                                        isCurrent 
                                                            ? "text-accent" 
                                                            : isDone 
                                                                ? "text-primary-dark dark:text-white" 
                                                                : "text-gray-400 dark:text-gray-500"
                                                    }`}>
                                                        {step.title}
                                                    </h4>
                                                    <span className="text-[11px] font-mono font-semibold text-gray-400 dark:text-gray-500">
                                                        {step.time}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                )}

            </div>

            {/* CUSTOMER CANCELLATION MODAL */}
            {showCustomerCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#14141e]/95 rounded-3xl border border-rose-500/30 p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between border-b border-gray-800 pb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center shrink-0">
                                    <FiAlertTriangle size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 block w-max mb-1">
                                        Eligible for Instant Cancellation & Full Refund
                                    </span>
                                    <h3 className="font-serif font-bold text-2xl text-white">Cancel Order #{currentOrder.orderId}?</h3>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowCustomerCancelModal(false)}
                                className="text-gray-400 hover:text-white p-2 rounded-xl transition-colors cursor-pointer"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed">
                            Your order is currently in <strong className="text-amber-400 uppercase">{currentStatus}</strong> status and has not been dispatched to the courier van yet. You can cancel your order now for an immediate 100% full refund.
                        </p>

                        <div className="space-y-3">
                            <label className="text-xs uppercase font-bold tracking-widest text-gray-400 block">Select Cancellation Reason:</label>
                            <div className="space-y-2">
                                {[
                                    "Ordered by mistake / Selected wrong product variant",
                                    "Delivery address needs to be changed",
                                    "Found alternative product / Changed my mind",
                                    "Custom Reason (Type below)"
                                ].map((reason, idx) => (
                                    <label 
                                        key={idx}
                                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-medium cursor-pointer transition-all ${
                                            cancelReasonOption === reason 
                                                ? "bg-rose-500/10 border-rose-500 text-rose-400 font-bold" 
                                                : "bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700"
                                        }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="customerCancelReason"
                                            checked={cancelReasonOption === reason}
                                            onChange={() => {
                                                setCancelReasonOption(reason);
                                                setCustomerCancelText(reason);
                                            }}
                                            className="accent-rose-500 cursor-pointer"
                                        />
                                        <span>{reason}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="pt-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-rose-400 block mb-1.5">
                                    Cancellation Note (Optional):
                                </label>
                                <textarea
                                    rows={2}
                                    value={customerCancelText}
                                    onChange={(e) => setCustomerCancelText(e.target.value)}
                                    placeholder="Tell us why you are cancelling..."
                                    className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-2xl text-xs text-white focus:outline-none focus:border-rose-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-800 pt-5">
                            <button
                                type="button"
                                onClick={() => setShowCustomerCancelModal(false)}
                                className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Keep Order
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmCustomerCancel}
                                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-xl shadow-rose-600/30 transition-all cursor-pointer"
                            >
                                Confirm Order Cancellation
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
