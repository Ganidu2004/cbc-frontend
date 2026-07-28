import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiCreditCard, FiMapPin, FiUser, FiPrinter } from "react-icons/fi";
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
      setOrder(res.data);
      setStatus(res.data.status || "Preparing");
      setNotes(res.data.notes || "");
    }).catch((err) => {
      console.error(err);
      toast.error("Failed to load order details");
      navigate("/admin/orders");
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleUpdateStatus = (newStatus) => {
    const token = localStorage.getItem("token");
    setUpdating(true);
    axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, { status: newStatus, notes }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      toast.success(`Order marked as ${newStatus}`);
      setOrder(res.data.order);
      setStatus(res.data.order.status);
    }).catch((err) => {
      console.error(err);
      toast.error("Failed to update status");
    }).finally(() => {
      setUpdating(false);
    });
  };

  const handleSaveNotes = () => {
    const token = localStorage.getItem("token");
    setUpdating(true);
    axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, { notes }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      toast.success("Notes saved successfully");
      setOrder(res.data.order);
    }).catch((err) => {
      console.error(err);
      toast.error("Failed to save notes");
    }).finally(() => {
      setUpdating(false);
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center min-h-[60vh]">
        <div className="w-[40px] h-[40px] border-[3px] border-gray-200 border-b-primary-dark rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  const orderDate = new Date(order.date).toLocaleString("en-US", {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
  });

  const subtotal = order.orderItems?.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quentity || 1)), 0) || 0;
  const shippingTotal = order.orderItems?.reduce((sum, item) => sum + (400 * (item.quentity || 1)), 0) || 0;
  const total = subtotal + shippingTotal;

  const getStatusIcon = (statusName) => {
    switch(statusName) {
      case "Preparing": return <FiClock />;
      case "Processing": return <FiPackage />;
      case "Shipped": return <FiTruck />;
      case "Delivered": return <FiCheckCircle />;
      case "Cancelled": return <FiXCircle />;
      default: return <FiClock />;
    }
  };

  const getStatusColor = (statusName) => {
    switch(statusName) {
      case "Preparing": return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "Processing": return "bg-blue-50 text-blue-600 border-blue-200";
      case "Shipped": return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "Delivered": return "bg-green-50 text-green-600 border-green-200";
      case "Cancelled": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="w-full min-h-full pb-10 text-primary-dark font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link to="/admin/orders" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-primary-dark transition-colors mb-4">
            <FiArrowLeft /> Back to Orders
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-serif">Order <span className="text-accent">{order.orderId}</span></h1>
            <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              {status}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-2 font-medium">{orderDate}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="px-5 py-2.5 bg-white border border-gray-200 text-primary-dark rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <FiPrinter size={16} /> Print Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-serif">Purchased Items</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100">
                    <tr>
                      <th className="pb-4 font-semibold">Product</th>
                      <th className="pb-4 font-semibold text-center">Qty</th>
                      <th className="pb-4 font-semibold text-right">Price</th>
                      <th className="pb-4 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {order.orderItems?.map((item, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full bg-gray-200" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-primary-dark">{item.name}</p>
                              <p className="text-xs text-gray-400 mt-1">Item #{idx + 1}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center font-medium text-gray-600">{item.quentity || 1}</td>
                        <td className="py-4 text-right text-gray-500">Rs. {parseFloat(item.price).toFixed(2)}</td>
                        <td className="py-4 text-right font-medium text-primary-dark">Rs. {(parseFloat(item.price) * (item.quentity || 1)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Ledger */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                <div className="w-full sm:w-1/2 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping & Courier (Rs. 400/item)</span>
                    <span>Rs. {shippingTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg text-primary-dark pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-accent font-serif">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Workflow Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-serif">Update Order Status</h2>
            </div>
            <div className="p-6 flex flex-wrap gap-4">
              <button 
                disabled={updating || status === "Preparing"}
                onClick={() => handleUpdateStatus("Preparing")}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest border transition-all ${status === "Preparing" ? "bg-yellow-50 border-yellow-200 text-yellow-600 cursor-not-allowed" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                Preparing
              </button>
              <button 
                disabled={updating || status === "Processing"}
                onClick={() => handleUpdateStatus("Processing")}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest border transition-all ${status === "Processing" ? "bg-blue-50 border-blue-200 text-blue-600 cursor-not-allowed" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                Processing
              </button>
              <button 
                disabled={updating || status === "Shipped"}
                onClick={() => handleUpdateStatus("Shipped")}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest border transition-all ${status === "Shipped" ? "bg-purple-50 border-purple-200 text-purple-600 cursor-not-allowed" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                Shipped
              </button>
              <button 
                disabled={updating || status === "Delivered"}
                onClick={() => handleUpdateStatus("Delivered")}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest border transition-all ${status === "Delivered" ? "bg-green-50 border-green-200 text-green-600 cursor-not-allowed" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                Delivered
              </button>
            </div>
            <div className="p-6 border-t border-gray-100 bg-red-50/30 flex justify-end">
              <button 
                disabled={updating || status === "Cancelled"}
                onClick={() => {
                  if(window.confirm("Are you sure you want to cancel this order?")) {
                    handleUpdateStatus("Cancelled");
                  }
                }}
                className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${status === "Cancelled" ? "bg-red-50 border-red-200 text-red-600 cursor-not-allowed" : "bg-white border-red-200 text-red-500 hover:bg-red-50"}`}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar (Right 1/3) */}
        <div className="space-y-6">
          
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2"><FiUser /> Customer Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Name</p>
                <p className="font-medium text-primary-dark">{order.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <a href={`mailto:${order.email}`} className="font-medium text-accent hover:underline">{order.email}</a>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <p className="font-medium text-primary-dark">{order.phone || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2"><FiMapPin /> Shipping Address</h3>
            <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {order.address}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2"><FiCreditCard /> Payment Information</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Payment Method</p>
                <p className="font-medium text-primary-dark">Cash on Delivery (COD)</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Payment Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${status === "Delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {status === "Delivered" ? "Paid" : "Pending Collection"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Internal Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Internal Notes</h3>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes about this order..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-primary-dark focus:ring-1 focus:ring-primary-dark resize-none h-32 mb-4"
            ></textarea>
            <button 
              onClick={handleSaveNotes}
              disabled={updating}
              className="w-full py-3 bg-primary-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
            >
              {updating ? 'Saving...' : 'Save Notes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
