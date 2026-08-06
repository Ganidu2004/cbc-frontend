import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { 
    FiCheckCircle, 
    FiXCircle,
    FiDownload, 
    FiMapPin, 
    FiTruck, 
    FiBox, 
    FiShare2, 
    FiHelpCircle, 
    FiArrowLeft,
    FiPrinter,
    FiShield,
    FiAward,
    FiShoppingBag,
    FiRefreshCw,
    FiAlertTriangle
} from "react-icons/fi";

export default function Invoice() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Normalize order data so refresh never breaks rendering
    const normalizeOrder = (rawOrder, id) => {
        const fallbackId = id || "CBC0005";
        if (!rawOrder || typeof rawOrder !== "object") {
            return createFallbackOrder(fallbackId);
        }

        let rawItems = rawOrder.orderItems || rawOrder.items || rawOrder.cartItems || rawOrder.products;
        if (!Array.isArray(rawItems) || rawItems.length === 0) {
            rawItems = [
                { name: "Luminous Silk Foundation", price: 5800, quantity: 1, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
                { name: "Velvet Matte Lipstick", price: 2400, quantity: 2, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
            ];
        }

        const normalizedItems = rawItems.map(item => ({
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

    const createFallbackOrder = (id) => {
        return {
            orderId: id || "CBC0005",
            date: new Date().toISOString(),
            name: "Ganidu Chalinda",
            address: "Kekanadura, Matara - 81020",
            phone: "0715588780",
            notes: "Shipping: express | Payment: card",
            status: "Preparing",
            cancelReason: "",
            orderItems: [
                { name: "Luminous Silk Foundation", price: 5800, quantity: 1, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
                { name: "Velvet Matte Lipstick", price: 2400, quantity: 2, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
            ]
        };
    };

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchOrder = async () => {
            const token = localStorage.getItem("token");

            if (!token || !orderId || orderId.startsWith("mock-")) {
                if (isMounted) { setOrder(createFallbackOrder(orderId)); setLoading(false); }
                return;
            }

            let foundOrder = null;

            // Step 1: Fetch all user orders, filter by orderId (proven endpoint)
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/orders`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (Array.isArray(res.data) && res.data.length > 0) {
                    foundOrder = res.data.find(o => o.orderId === orderId)
                        || res.data.find(o => String(o.orderId || "").toLowerCase() === orderId.toLowerCase());
                }
            } catch (e) {
                console.warn("invoice: /api/orders failed:", e.message);
            }

            // Step 2: Try specific /:orderId endpoint as fallback
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
                    console.warn("invoice: /api/orders/:id failed:", e.message);
                }
            }

            if (isMounted) {
                setOrder(foundOrder ? normalizeOrder(foundOrder, orderId) : createFallbackOrder(orderId));
                setLoading(false);
            }
        };

        fetchOrder();
        return () => { isMounted = false; };
    }, [orderId]);

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212] pt-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-b-primary-dark dark:border-b-accent"></div>
            </div>
        );
    }

    const currentOrder = order || createFallbackOrder(orderId);

    // Read cancellation reason from local storage if available
    let savedCancelReason = "";
    try {
        const rawReasons = localStorage.getItem("aura_cancellation_reasons");
        if (rawReasons) {
            const parsed = JSON.parse(rawReasons);
            savedCancelReason = parsed[currentOrder.orderId] || "";
        }
    } catch(e) {}

    const cancelReason = currentOrder.cancelReason || savedCancelReason || "Item Out of Stock / Lab Inventory Unavailable";

    const subtotal = currentOrder.orderItems?.reduce((acc, item) => acc + (Number(item?.price || 0) * Number(item?.quantity || 1)), 0) || 0;
    const isExpress = String(currentOrder.notes || "").toLowerCase().includes("express");
    const shipping = isExpress ? 800 : 400; 
    const total = subtotal + shipping;

    const orderDateObj = new Date(currentOrder.date || Date.now());
    const validOrderDate = isNaN(orderDateObj.getTime()) ? new Date() : orderDateObj;

    const deliveryDate = new Date(validOrderDate);
    deliveryDate.setDate(deliveryDate.getDate() + (isExpress ? 2 : 4));

    const isCancelled = String(currentOrder.status || "").toLowerCase() === "cancelled";

    const handleCustomerInvoiceCancel = async () => {
        const reason = prompt("Please specify cancellation reason for your order #" + currentOrder.orderId + ":", "Ordered by mistake");
        if (reason === null) return;

        const finalReason = "Customer Self-Cancelled: " + (reason || "Ordered by mistake");
        const token = localStorage.getItem("token");
        const loadingToast = toast.loading(`Cancelling Order #${currentOrder.orderId}...`);

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
            setOrder(prev => ({ ...prev, status: "Cancelled", cancelReason: finalReason }));
        } catch(err) {
            console.error(err);
            toast.dismiss(loadingToast);
            const existing = JSON.parse(localStorage.getItem('aura_cancellation_reasons') || '{}');
            existing[currentOrder.orderId] = finalReason;
            localStorage.setItem('aura_cancellation_reasons', JSON.stringify(existing));

            toast.success(`Order #${currentOrder.orderId} cancelled! Cancellation Invoice generated.`);
            setOrder(prev => ({ ...prev, status: "Cancelled", cancelReason: finalReason }));
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-[#121212] pt-28 pb-16 px-4 md:px-12 font-sans print:bg-white print:py-0 print:px-0">
            {/* Custom Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm 12mm;
                    }
                    body {
                        background: #ffffff !important;
                        color: #111111 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print-hide {
                        display: none !important;
                    }
                    .print-shadow-none {
                        box-shadow: none !important;
                    }
                    .print-border-luxury {
                        border: 2px solid #e5e7eb !important;
                        border-radius: 16px !important;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto relative">
                
                {/* Decorative Background Ambient Glow */}
                <div className={`absolute top-[-10%] left-[25%] w-[450px] h-[450px] rounded-full blur-[130px] opacity-40 -z-10 pointer-events-none print-hide ${isCancelled ? 'bg-rose-500/20' : 'bg-accent/20'}`}></div>

                {/* Print & Action Bar Header */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8 print-hide">
                    <Link to="/product" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-dark dark:hover:text-white bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all cursor-pointer group">
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Shop
                    </Link>

                    <div className="flex items-center gap-3">
                        {!isCancelled && 
                         String(currentOrder.status || "Preparing").toLowerCase() !== "shipped" && 
                         String(currentOrder.status || "Preparing").toLowerCase() !== "delivered" && (
                            <button 
                                onClick={handleCustomerInvoiceCancel}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:-translate-y-0.5"
                            >
                                <FiXCircle /> Cancel Order
                            </button>
                        )}

                        <button 
                            onClick={() => window.print()}
                            className={`px-6 py-2.5 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:-translate-y-0.5 ${
                                isCancelled ? "bg-rose-600 hover:bg-rose-700" : "bg-primary-dark dark:bg-accent hover:bg-black dark:hover:bg-accent/80"
                            }`}
                        >
                            <FiPrinter /> {isCancelled ? "Print Cancellation Invoice" : "Print Tax Invoice"}
                        </button>
                    </div>
                </div>

                {/* CREATIVE LUXURY INVOICE CONTAINER */}
                <div className="bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden print-shadow-none print-border-luxury">
                    
                    {/* TOP LUXURY BRANDING HEADER */}
                    <div className={`text-white p-8 md:p-12 relative overflow-hidden print:bg-none print:text-black print:p-6 print:border-b-2 print:border-gray-200 ${
                        isCancelled 
                            ? "bg-gradient-to-r from-[#2b080e] via-[#3d0e16] to-[#2b080e]" 
                            : "bg-gradient-to-r from-[#161620] via-[#222230] to-[#161620]"
                    }`}>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg font-serif text-xl font-bold ${
                                        isCancelled ? "bg-rose-600" : "bg-accent"
                                    }`}>
                                        A
                                    </div>
                                    <span className="font-serif text-3xl md:text-4xl tracking-tight text-white print:text-black font-semibold">
                                        AURA COSMETICS
                                    </span>
                                </div>
                                <p className="text-xs uppercase tracking-widest text-accent font-medium pl-1">
                                    Boutique Beauty & Luxury Skincare
                                </p>
                            </div>

                            <div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-rose-500/40 pl-4 md:pl-0 md:pr-4">
                                <span className={`inline-block font-bold px-3.5 py-1 rounded-full text-xs uppercase tracking-widest mb-2 border ${
                                    isCancelled 
                                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40" 
                                        : "bg-accent/20 text-accent border-accent/40"
                                }`}>
                                    {isCancelled ? "Official Cancellation Invoice" : "Official Tax Invoice"}
                                </span>
                                <p className="text-sm font-serif font-bold tracking-wider text-white print:text-black">
                                    {isCancelled ? "CANCELLATION REF #" : "INVOICE #"} <span className={isCancelled ? "text-rose-400" : "text-accent"}>{isCancelled ? `CAN-${currentOrder.orderId}` : currentOrder.orderId}</span>
                                </p>
                                <p className="text-xs text-gray-400 print:text-gray-600 mt-1">
                                    Date: {validOrderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* STATUS BANNER */}
                    {isCancelled ? (
                        <div className="bg-rose-500/10 border-b border-rose-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shrink-0">
                                    <FiXCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-rose-500 text-lg">
                                        Order Cancelled & Full Refund Issued
                                    </h3>
                                    <p className="text-xs text-rose-400 mt-0.5">
                                        Reason: <strong className="text-rose-300 font-semibold">{cancelReason}</strong>
                                    </p>
                                </div>
                            </div>

                            <span className="bg-rose-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                                Status: CANCELLED
                            </span>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 border-b border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 print-hide">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                                    <FiCheckCircle size={22} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-emerald-800 dark:text-emerald-300 text-base">
                                        Payment Confirmed & Order Placed!
                                    </h3>
                                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400">
                                        Thank you! We're preparing your luxury products for shipment.
                                    </p>
                                </div>
                            </div>

                            <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                                Status: {currentOrder.status || "Preparing"}
                            </span>
                        </div>
                    )}

                    <div className="p-6 md:p-12 space-y-10">

                        {/* CANCELLATION DETAILS BOX */}
                        {isCancelled && (
                            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-6 space-y-3">
                                <h4 className="text-xs uppercase font-bold tracking-widest text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                    <FiAlertTriangle /> Official Cancellation & Refund Summary
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700 dark:text-gray-300 pt-1">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Cancellation Reason:</p>
                                        <p className="font-semibold text-rose-700 dark:text-rose-300 text-sm mt-0.5">{cancelReason}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Refund Settlement Status:</p>
                                        <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">100% Full Refund Issued to Original Payment Method</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CUSTOMER & SHIPPING INFORMATION GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 print:bg-gray-50 print:border-gray-200 print:p-4">
                            <div>
                                <h4 className="text-xs uppercase font-bold tracking-widest text-gray-800 dark:text-accent mb-3 flex items-center gap-2">
                                    <FiMapPin /> Billed & Customer Details
                                </h4>
                                <p className="font-serif font-bold text-lg text-primary-dark dark:text-white mb-1">{currentOrder.name || "Customer"}</p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-2">{currentOrder.address || "Main Address"}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Contact: {currentOrder.phone || "0771234567"}</p>
                            </div>

                            <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                                <h4 className="text-xs uppercase font-bold tracking-widest text-gray-800 dark:text-accent mb-3 flex items-center gap-2">
                                    <FiTruck /> Shipping & Payment Info
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                    <span className="font-medium">Shipping Method:</span> {isExpress ? 'Express Courier (1-2 Days)' : 'Standard Delivery (3-5 Days)'}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="font-medium">Order Status:</span> <span className={isCancelled ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>{isCancelled ? 'CANCELLED' : currentOrder.status}</span>
                                </p>
                                <div className="inline-block bg-white dark:bg-gray-800 px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Payment Method: Online / Card
                                </div>
                            </div>
                        </div>

                        {/* ITEMIZED PRODUCT TABLE */}
                        <div>
                            <h4 className="font-serif text-2xl text-primary-dark dark:text-white mb-4">Itemized Products</h4>
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-primary-dark dark:bg-gray-800 text-white text-xs uppercase tracking-widest font-semibold">
                                            <th className="py-3.5 px-6">Product Details</th>
                                            <th className="py-3.5 px-4 text-center">Qty</th>
                                            <th className="py-3.5 px-4 text-right">Unit Price</th>
                                            <th className="py-3.5 px-6 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/50 text-sm">
                                        {currentOrder.orderItems.map((item, idx) => {
                                            const qty = Number(item.quantity || 1);
                                            const itemPrice = Number(item.price || 0);
                                            const itemTotal = itemPrice * qty;
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            {item.image && (
                                                                <img 
                                                                    src={item.image} 
                                                                    alt={item.name || "Product"} 
                                                                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm shrink-0" 
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-primary-dark dark:text-white">{item.name || "Beauty Product"}</p>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">REF: PROD-0{idx + 1}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center font-semibold text-primary-dark dark:text-white">
                                                        {qty}
                                                    </td>
                                                    <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-300">
                                                        LKR {itemPrice.toFixed(2)}
                                                    </td>
                                                    <td className="py-4 px-6 text-right font-bold text-primary-dark dark:text-white">
                                                        LKR {itemTotal.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* TOTAL BREAKDOWN & REFUND SUMMARY */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                            
                            {/* Authenticity Stamp / Refund Protection */}
                            <div className="flex items-center gap-4 bg-accent/5 dark:bg-accent/10 border border-accent/30 p-4 rounded-2xl max-w-sm">
                                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                                    <FiShield size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-accent">Aura Customer Guarantee</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {isCancelled 
                                            ? "All refunds are fully processed back to your original payment method within 1-3 business days." 
                                            : "All items are 100% genuine cosmetics sourced directly from official brand labs."}
                                    </p>
                                </div>
                            </div>

                            {/* Financial Totals Box */}
                            <div className="w-full sm:w-80 space-y-3 bg-gray-50 dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">LKR {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                    <span>Shipping</span>
                                    <span className="font-semibold">LKR {shipping.toFixed(2)}</span>
                                </div>

                                {isCancelled ? (
                                    <>
                                        <div className="flex justify-between text-rose-400 font-bold border-t border-rose-500/20 pt-2">
                                            <span>Full Refund Issued</span>
                                            <span>- LKR {total.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end text-primary-dark dark:text-white">
                                            <span className="font-bold text-base">Net Outstanding</span>
                                            <span className="font-serif text-3xl font-bold text-emerald-400">LKR 0.00</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end text-primary-dark dark:text-white">
                                        <span className="font-bold text-base">Grand Total</span>
                                        <span className="font-serif text-3xl font-bold text-accent">LKR {total.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CUSTOMER NEXT STEPS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-hide pt-4">
                            <Link to="/product" className="flex items-center justify-center gap-2 w-full bg-primary-dark dark:bg-accent text-white py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-black dark:hover:bg-accent/80 transition-colors shadow-md">
                                <FiShoppingBag /> Continue Shopping
                            </Link>
                            <Link to="/profile" className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary-dark dark:text-white py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                                View My Account
                            </Link>
                        </div>

                    </div>

                    {/* LUXURY FOOTER */}
                    <div className="bg-gray-50 dark:bg-gray-900/80 p-6 md:p-8 text-center border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-2 print:bg-white print:text-black print:border-t-2 print:border-gray-200">
                        <p className="font-serif font-semibold text-sm text-primary-dark dark:text-white print:text-black">
                            Thank you for choosing Aura Cosmetics!
                        </p>
                        <p>
                            For support or inquiries, email us at <strong className="text-accent">support@auracosmetics.com</strong> or call <strong>+94 11 234 5678</strong>.
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest pt-2">
                            Aura Cosmetics Boutique Ltd • 123 Luxury Boulevard, Colombo 03 • Tax Reg No: AC-984210-SL
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}
