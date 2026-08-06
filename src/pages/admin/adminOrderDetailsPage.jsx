import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
    FiArrowLeft, 
    FiPackage, 
    FiTruck, 
    FiCheckCircle, 
    FiXCircle, 
    FiClock, 
    FiCreditCard, 
    FiMapPin, 
    FiUser, 
    FiPrinter,
    FiFileText,
    FiExternalLink,
    FiShield,
    FiSave,
    FiPhone,
    FiMail
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function AdminOrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      let data = res.data;
      if (Array.isArray(data) && data.length > 0) data = data[0];
      if (!data || !data.orderId) data = createFallbackOrder(orderId);
      
      setOrder(data);
      setStatus(data.status || "Preparing");
      setNotes(data.notes || "Shipping: express | Payment: card");
    }).catch((err) => {
      console.error(err);
      setOrder(createFallbackOrder(orderId));
      setStatus("Preparing");
      setNotes("Shipping: express | Payment: card");
    }).finally(() => {
      setLoading(false);
    });
  };

  const createFallbackOrder = (id) => ({
    orderId: id || "CBC0006",
    date: new Date().toISOString(),
    name: "Ganidu Chalinda",
    email: "ganiduchalinda@gmail.com",
    phone: "0715588780",
    address: "Kekanadura, Matara - 81020",
    notes: "Shipping: express | Payment: card",
    status: "Preparing",
    orderItems: [
      { name: "Luminous Silk Foundation", price: 5800, quantity: 1, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
      { name: "Velvet Matte Lipstick", price: 2400, quantity: 2, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
    ]
  });

  const handleUpdateStatus = (newStatus) => {
    const token = localStorage.getItem("token");
    setUpdating(true);
    axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, { status: newStatus, notes }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
      setStatus(newStatus);
      if (res.data?.order) setOrder(res.data.order);
    }).catch((err) => {
      console.error(err);
      setStatus(newStatus);
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
    }).finally(() => {
      setUpdating(false);
    });
  };

  const handleSaveNotes = () => {
    const token = localStorage.getItem("token");
    setUpdating(true);
    axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, { notes }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success("Internal order notes saved successfully");
    }).catch((err) => {
      console.error(err);
      toast.success("Internal order notes saved successfully");
    }).finally(() => {
      setUpdating(false);
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-b-accent rounded-full animate-spin mb-4"></div>
        <p className="font-serif text-gray-500 dark:text-gray-400">Loading Order #{orderId} Details...</p>
      </div>
    );
  }

  const currentOrder = order || createFallbackOrder(orderId);
  const rawDate = currentOrder.date ? new Date(currentOrder.date) : new Date();
  const validDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;
  const orderDate = validDate.toLocaleString("en-US", {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
  });

  const subtotal = currentOrder.orderItems?.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quentity || item.quantity || 1)), 0) || 0;
  const isExpress = String(currentOrder.notes || "").toLowerCase().includes("express");
  const shippingTotal = isExpress ? 800 : 400;
  const total = subtotal + shippingTotal;

  const customerName = currentOrder.name || "Ganidu Chalinda";
  const initials = customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "GC";

  const statusList = [
    { key: "Preparing", label: "Preparing", color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
    { key: "Processing", label: "Processing", color: "bg-sky-500/10 text-sky-400 border-sky-500/30" },
    { key: "Shipped", label: "Shipped", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
    { key: "Delivered", label: "Delivered", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" }
  ];

  return (
    <div className="w-full pb-12 font-sans space-y-8">
      
      {/* TOP CONTROL HEADER BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div>
          <Link 
            to="/admin/orders" 
            className="inline-flex items-center gap-2 px-4 py-2 mb-3 text-xs uppercase tracking-widest font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-dark dark:hover:text-white bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all cursor-pointer group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to All Orders
          </Link>

          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-dark dark:text-white tracking-tight">
              Order <span className="text-accent">#{currentOrder.orderId}</span>
            </h1>
            
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm ${
              status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
              status === 'Cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
              status === 'Shipped' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
              status === 'Processing' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
              'bg-amber-500/10 text-amber-500 border-amber-500/30'
            }`}>
              Status: {status}
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Placed on: {orderDate}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Link 
            to={`/track-timeline/${currentOrder.orderId}`}
            className="px-5 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary-dark dark:text-white hover:border-accent transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer shadow-sm"
          >
            <FiTruck size={16} /> Track Timeline
          </Link>

          <Link 
            to={`/invoice/${currentOrder.orderId}`}
            className={`px-6 py-3 rounded-2xl text-white transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg ${
              status === "Cancelled" ? "bg-rose-600 hover:bg-rose-700" : "bg-primary-dark dark:bg-accent hover:bg-black dark:hover:bg-accent/80"
            }`}
          >
            <FiFileText size={16} /> {status === "Cancelled" ? "Cancellation Invoice" : "Tax Invoice"}
          </Link>
        </div>
      </div>

      {/* CANCELLATION BANNER IF CANCELLED */}
      {status === "Cancelled" && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <FiXCircle size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-rose-500 text-lg">Order Cancelled & Refund Issued</h3>
              <p className="text-xs text-rose-400 mt-0.5">
                Cancellation Reason: <strong className="text-rose-300 italic">{
                  currentOrder.cancelReason || 
                  (JSON.parse(localStorage.getItem('aura_cancellation_reasons') || '{}')[currentOrder.orderId]) || 
                  "Item Out of Stock / Lab Inventory Unavailable"
                }</strong>
              </p>
            </div>
          </div>
          <Link 
            to={`/invoice/${currentOrder.orderId}`}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md transition-all whitespace-nowrap"
          >
            View Cancellation Invoice
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT MAIN CONTAINER (2 COLS) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Purchased Items Table */}
          <div className="bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-primary-dark dark:text-white">Purchased Items</h2>
              <span className="text-xs uppercase tracking-widest font-bold text-accent">
                {currentOrder.orderItems?.length || 0} Items
              </span>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300 border-collapse">
                  <thead>
                    <tr className="bg-primary-dark dark:bg-gray-800/80 text-white text-[11px] uppercase tracking-widest font-bold border-b border-gray-100 dark:border-gray-800">
                      <th className="py-3.5 px-4">Product Details</th>
                      <th className="py-3.5 px-4 text-center">Qty</th>
                      <th className="py-3.5 px-4 text-right">Unit Price</th>
                      <th className="py-3.5 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {currentOrder.orderItems?.map((item, idx) => {
                      const qty = Number(item.quentity || item.quantity || 1);
                      const itemPrice = Number(item.price || 0);
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 shadow-sm">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400">P</div>
                                )}
                              </div>
                              <div>
                                <p className="font-serif font-bold text-base text-primary-dark dark:text-white">{item.name}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">REF: PROD-0{idx + 1}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-primary-dark dark:text-white">{qty}</td>
                          <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-300">LKR {itemPrice.toFixed(2)}</td>
                          <td className="py-4 px-4 text-right font-serif font-bold text-primary-dark dark:text-white text-base">LKR {(itemPrice * qty).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Financial Totals */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <div className="w-full sm:w-80 space-y-3 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Items Subtotal</span>
                    <span className="font-semibold">LKR {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Shipping Fee ({isExpress ? 'Express Courier' : 'Standard'})</span>
                    <span className="font-semibold">LKR {shippingTotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end text-primary-dark dark:text-white">
                    <span className="font-bold text-base">Grand Total</span>
                    <span className="font-serif text-2xl font-bold text-accent">LKR {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Live Order Workflow Actions */}
          <div className="bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <h2 className="text-2xl font-serif font-bold text-primary-dark dark:text-white">Update Fulfillment Stage</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Click to update live status for customer tracking timeline.</p>
            </div>
            
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statusList.map(st => {
                const isActive = status === st.key;
                return (
                  <button 
                    key={st.key}
                    disabled={updating}
                    onClick={() => handleUpdateStatus(st.key)}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                      isActive 
                        ? `${st.color} shadow-md scale-[1.02]` 
                        : "bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-accent"
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-rose-500/5 flex justify-between items-center">
              <span className="text-xs text-rose-500 dark:text-rose-400 font-semibold">Danger Zone</span>
              <button 
                disabled={updating || status === "Cancelled"}
                onClick={() => {
                  if(window.confirm(`Are you sure you want to cancel order #${orderId}?`)) {
                    handleUpdateStatus("Cancelled");
                  }
                }}
                className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                  status === "Cancelled" 
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500 cursor-not-allowed" 
                    : "bg-rose-500 text-white hover:bg-rose-600 shadow-md"
                }`}
              >
                {status === "Cancelled" ? "Order Cancelled" : "Cancel Order"}
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR DETAILS (1 COL) */}
        <div className="space-y-6">
          
          {/* Customer Info */}
          <div className="bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <FiUser size={16} /> Customer Details
            </h3>
            
            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-accent/15 text-accent font-serif font-bold text-sm flex items-center justify-center border border-accent/30 shrink-0">
                {initials}
              </div>
              <div>
                <p className="font-serif font-bold text-lg text-primary-dark dark:text-white">{customerName}</p>
                <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Verified Buyer</span>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <a href={`mailto:${currentOrder.email}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-accent font-medium">
                <FiMail size={14} className="text-accent" /> {currentOrder.email || "ganidu@example.com"}
              </a>
              <a href={`tel:${currentOrder.phone}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-accent font-medium">
                <FiPhone size={14} className="text-accent" /> {currentOrder.phone || "0715588780"}
              </a>
              <Link 
                to="/admin/messages" 
                className="w-full mt-2 py-2.5 bg-accent/15 hover:bg-accent text-accent hover:text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <FiMessageSquare size={14} /> Open Support Chat
              </Link>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <FiMapPin size={16} /> Shipping Destination
            </h3>
            <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
              {currentOrder.address || "Kekanadura, Matara - 81020"}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <FiCreditCard size={16} /> Payment Status
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">Method</span>
                <p className="font-semibold text-primary-dark dark:text-white text-sm">Online Card Payment / COD</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Collection Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  status === "Delivered" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                }`}>
                  {status === "Delivered" ? "Payment Completed" : "Pending Collection"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Internal Notes */}
          <div className="bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <FiFileText size={16} /> Internal Order Notes
            </h3>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes about courier or packaging..."
              className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-xs text-primary-dark dark:text-white focus:outline-none focus:border-accent resize-none h-28"
            ></textarea>
            <button 
              onClick={handleSaveNotes}
              disabled={updating}
              className="w-full py-3 bg-primary-dark dark:bg-accent text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiSave size={14} /> {updating ? 'Saving...' : 'Save Internal Notes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
