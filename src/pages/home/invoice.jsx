import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiCheckCircle, FiDownload, FiMapPin, FiTruck, FiBox, FiShare2, FiHelpCircle } from "react-icons/fi";

export default function Invoice() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchOrder = async (showLoading = true) => {
            try {
                const token = localStorage.getItem("token");
                if (orderId.startsWith("mock-") || !token) {
                    if (isMounted) {
                        setOrder({
                            orderId: "CBC1018",
                            date: new Date().toISOString(),
                            name: "Guest User",
                            address: "123 Aura Boulevard",
                            phone: "0771234567",
                            notes: "Shipping: express | Payment: card",
                            status: "Processing",
                            orderItems: [
                                { name: "Luminous Silk Foundation", price: 5800, quantity: 1, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
                                { name: "Velvet Matte Lipstick", price: 2400, quantity: 2, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
                            ]
                        });
                        if (showLoading) setLoading(false);
                    }
                    return;
                }

                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (isMounted) {
                    if (Array.isArray(res.data)) {
                        if (res.data.length > 0) {
                            setOrder(res.data[0]);
                        } else if (showLoading) {
                            toast.error("Order not found");
                        }
                    } else {
                        setOrder(res.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching order:", error);
                if (showLoading) toast.error("Failed to load order details");
            } finally {
                if (isMounted && showLoading) {
                    setLoading(false);
                }
            }
        };

        fetchOrder(true);

        const intervalId = setInterval(() => {
            fetchOrder(false);
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [orderId]);

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-b-primary-dark"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <h1 className="font-serif text-4xl text-primary-dark mb-4">Order Not Found</h1>
                <p className="text-gray-500 mb-8">We couldn't locate the order you're looking for.</p>
                <Link to="/profile" className="px-8 py-3 bg-primary-dark text-white rounded-full uppercase tracking-widest text-xs font-bold hover:bg-black transition-colors">
                    Back to Profile
                </Link>
            </div>
        );
    }

    const subtotal = order.orderItems?.reduce((acc, item) => acc + (item.price * (item.quentity || item.quantity)), 0) || 0;
    // Derive shipping cost from notes roughly for UI
    const isExpress = order.notes?.toLowerCase().includes("express");
    const shipping = isExpress ? 800 : 400; 
    const total = subtotal + shipping;

    // Estimated delivery date (3 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (isExpress ? 2 : 4));

    // Dynamic Progress
    const statusSteps = [
        { key: "Preparing", label: "Confirmed", icon: FiCheckCircle },
        { key: "Processing", label: "Processing", icon: FiBox },
        { key: "Shipped", label: "Shipped", icon: FiTruck },
        { key: "Delivered", label: "Delivered", icon: FiMapPin }
    ];
    
    // Determine progress
    let currentStepIdx = 0;
    const currentStatus = order.status || "Preparing";
    if (currentStatus === "Cancelled") {
        currentStepIdx = -1;
    } else {
        const foundIdx = statusSteps.findIndex(s => s.key === currentStatus);
        currentStepIdx = foundIdx >= 0 ? foundIdx : 0;
    }
    
    // Progress bar width (0, 33%, 66%, 100%)
    const progressPercent = currentStepIdx >= 0 ? (currentStepIdx / (statusSteps.length - 1)) * 100 : 0;

    return (
        <div className="w-full min-h-screen bg-gray-50 py-12 md:py-24 px-4 font-sans print:bg-white print:py-0">
            <div className="max-w-4xl mx-auto relative">
                
                {/* Decorative Background Blob - Hidden on print */}
                <div className="absolute top-[-20%] left-[20%] w-[400px] h-[400px] rounded-full bg-green-200/40 blur-[120px] opacity-50 -z-10 pointer-events-none print:hidden"></div>

                {/* Print Action Bar */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <Link to="/product" className="text-sm uppercase tracking-widest text-gray-500 hover:text-primary-dark font-medium transition-colors">
                        ← Continue Shopping
                    </Link>
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-primary-dark rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <FiDownload /> Download Invoice
                    </button>
                </div>

                {/* SUCCESS PAPER */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                    
                    {/* Header - Immediate Gratification */}
                    <div className="p-12 text-center border-b border-gray-100 print:border-b-2 print:border-black relative overflow-hidden">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                        >
                            <FiCheckCircle size={40} />
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="font-serif text-3xl md:text-5xl text-primary-dark mb-4"
                        >
                            Thank You for Your Order!
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500"
                        >
                            Your order <strong className="text-primary-dark tracking-wider">#{order.orderId}</strong> has been successfully placed. <br/> We've sent a confirmation email with all the details.
                        </motion.p>
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Order Status Tracker */}
                        <div className="mb-16 print:hidden">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">
                                {currentStatus === "Cancelled" ? "Order Cancelled" : "Delivery Progress"}
                            </h3>
                            <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full -z-10"></div>
                                <motion.div 
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full -z-10 ${currentStatus === "Cancelled" ? "bg-red-500" : "bg-green-500"}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                ></motion.div>
                                
                                {statusSteps.map((step, idx) => {
                                    const isCompleted = currentStepIdx >= idx;
                                    const Icon = step.icon;
                                    
                                    // If cancelled, color everything red up to where it got? Or just keep it gray. Let's make it red if cancelled.
                                    const bgClass = currentStatus === "Cancelled" 
                                        ? "bg-red-50 text-red-500 border-2 border-red-500"
                                        : isCompleted 
                                            ? "bg-green-500 text-white shadow-lg" 
                                            : "bg-white border-2 border-gray-200 text-gray-400";
                                            
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2">
                                            <motion.div 
                                                initial={false}
                                                animate={{ scale: isCompleted ? 1.1 : 1 }}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${bgClass}`}
                                            >
                                                {currentStatus === "Cancelled" ? <FiCheckCircle /> : <Icon />}
                                            </motion.div>
                                            <span className={`text-xs font-medium ${isCompleted ? (currentStatus === "Cancelled" ? "text-red-500" : "text-gray-600") : "text-gray-400"}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 pb-12 border-b border-gray-100 print:border-gray-300">
                            <div>
                                <h3 className="font-serif text-xl text-primary-dark mb-4">Delivery Details</h3>
                                <div className="bg-gray-50 p-6 rounded-2xl h-full border border-gray-100 print:bg-transparent print:border-none print:p-0">
                                    <p className="font-medium text-primary-dark mb-1">{order.name}</p>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-3">{order.address}</p>
                                    <p className="text-gray-500 text-sm mb-6">{order.phone}</p>
                                    
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Estimated Arrival</p>
                                        <p className="font-medium text-primary-dark">{deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-serif text-xl text-primary-dark mb-4">Order Summary</h3>
                                <div className="bg-gray-50 p-6 rounded-2xl h-full border border-gray-100 flex flex-col justify-between print:bg-transparent print:border-none print:p-0">
                                    <div className="space-y-4 mb-6">
                                        {order.orderItems?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium text-primary-dark">{item.quentity || item.quantity}x</span>
                                                    <span className="text-gray-600 truncate max-w-[150px] sm:max-w-[200px]">{item.name}</span>
                                                </div>
                                                <span className="text-gray-600">LKR {(item.price * (item.quentity || item.quantity)).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>LKR {subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span>LKR {shipping.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-end pt-4 font-medium text-primary-dark text-lg border-t border-gray-200">
                                            <span>Total</span>
                                            <span className="font-serif text-2xl">LKR {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Next Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                            <button className="flex items-center justify-center gap-3 w-full bg-primary-dark text-white py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-black transition-colors shadow-lg">
                                <FiTruck /> Track Your Order
                            </button>
                            <Link to="/profile" className="flex items-center justify-center gap-3 w-full bg-white border border-gray-200 text-primary-dark py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors shadow-sm">
                                Manage Account
                            </Link>
                        </div>

                    </div>
                    
                    {/* Footer Links */}
                    <div className="bg-gray-50 p-6 md:p-8 flex justify-center gap-8 border-t border-gray-100 print:hidden">
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-dark transition-colors">
                            <FiShare2 /> Share with Friends
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-dark transition-colors">
                            <FiHelpCircle /> Need Help?
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
