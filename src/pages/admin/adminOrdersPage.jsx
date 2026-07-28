import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FiEye, FiSearch, FiFilter, FiDownload, FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("New"); // 'All', 'New', 'Active', 'Delivered'
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios.get(import.meta.env.VITE_BACKEND_URL + "/api/orders", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      if (Array.isArray(res.data)) {
        setOrders(res.data.reverse()); // Show newest first
      } else {
        toast.error(res.data.message || "Failed to load orders");
      }
    }).catch((err) => {
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders");
    }).finally(() => {
      setLoading(false);
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter === "All" || order.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter === "Today") {
        const orderDate = new Date(order.date);
        const today = new Date();
        matchesDate = orderDate.toDateString() === today.toDateString();
      }
      
      let matchesTab = true;
      if (activeTab === "New") {
        matchesTab = order.status === "Preparing" || !order.status;
      } else if (activeTab === "Active") {
        matchesTab = order.status === "Processing";
      } else if (activeTab === "Shipped") {
        matchesTab = order.status === "Shipped";
      } else if (activeTab === "Delivered") {
        matchesTab = order.status === "Delivered";
      } else if (activeTab === "Cancelled") {
        matchesTab = order.status === "Cancelled";
      }

      return matchesSearch && matchesStatus && matchesDate && matchesTab;
    });
  }, [orders, searchQuery, statusFilter, dateFilter, activeTab]);

  const updateOrderStatus = (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    const loadingToast = toast.loading("Updating status...");
    
    axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      toast.dismiss(loadingToast);
      toast.success(`Order marked as ${newStatus}`);
      // Update local state to reflect the change
      setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    }).catch((err) => {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error("Failed to update status");
    });
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const exportToCSV = () => {
    // Basic CSV export logic
    const headers = "Order ID,Date,Customer,Email,Total,Status\n";
    const rows = filteredOrders.map(order => {
      const total = order.orderItems?.reduce((sum, item) => sum + ((parseFloat(item.price) + 400) * (item.quentity || 1)), 0) || 0;
      return `${order.orderId},${new Date(order.date).toLocaleDateString()},"${order.name}","${order.email}",${total.toFixed(2)},${order.status || 'Preparing'}`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toLocaleDateString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-full pb-10 text-primary-dark">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-1">Orders Management</h1>
          <p className="text-gray-500 text-sm font-light">View and process customer orders.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search orders, customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-dark focus:ring-1 focus:ring-primary-dark transition-all"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-dark cursor-pointer text-gray-600 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Preparing">Preparing</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>

          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-dark cursor-pointer text-gray-600 font-medium"
            >
              <option value="All">All Time</option>
              <option value="Today">Today's Orders</option>
            </select>
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>

          <button onClick={exportToCSV} className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-colors shadow-sm" title="Export to CSV">
            <FiDownload size={16} />
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex border-b border-gray-200 mb-6 space-x-8">
        <button 
          onClick={() => setActiveTab("All")}
          className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "All" ? "border-primary-dark text-primary-dark" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          All Orders
        </button>
        <button 
          onClick={() => setActiveTab("New")}
          className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "New" ? "border-accent text-accent" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          New Orders
          <span className={`${activeTab === "New" ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-600"} text-[10px] px-2 py-0.5 rounded-full`}>
            {orders.filter(o => o.status === "Preparing" || !o.status).length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab("Active")}
          className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "Active" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          Processing
          <span className={`${activeTab === "Active" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"} text-[10px] px-2 py-0.5 rounded-full`}>
            {orders.filter(o => o.status === "Processing").length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab("Shipped")}
          className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "Shipped" ? "border-purple-600 text-purple-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          Shipped
          <span className={`${activeTab === "Shipped" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"} text-[10px] px-2 py-0.5 rounded-full`}>
            {orders.filter(o => o.status === "Shipped").length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab("Delivered")}
          className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "Delivered" ? "border-green-600 text-green-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          Delivered
          <span className={`${activeTab === "Delivered" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"} text-[10px] px-2 py-0.5 rounded-full`}>
            {orders.filter(o => o.status === "Delivered").length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab("Cancelled")}
          className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "Cancelled" ? "border-red-600 text-red-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          Cancelled
        </button>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="w-full h-[400px] flex justify-center items-center">
          <div className="w-[40px] h-[40px] border-[3px] border-gray-200 border-b-primary-dark rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-8 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVars} initial="hidden" animate="show"
              >
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <p className="text-gray-500 font-medium mb-1">No orders found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => {
                  const orderDate = new Date(order.date).toLocaleDateString("en-US", {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute:'2-digit'
                  });
                  
                  // Calculate total from items including 400 courier charge per item
                  const total = order.orderItems?.reduce((sum, item) => sum + ((parseFloat(item.price) + 400) * (item.quentity || 1)), 0) || 0;
                  const status = order.status || 'Preparing';

                  return (
                    <motion.tr
                      variants={itemVars}
                      key={order._id || order.orderId}
                      onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-4">
                        <Link to={`/admin/orders/${order.orderId}`} className="text-sm font-mono font-medium text-primary-dark hover:text-accent transition-colors">
                          {order.orderId}
                        </Link>
                      </td>
                      
                      <td className="px-6 py-4 text-gray-500">
                        <span className="block whitespace-nowrap">{orderDate.split(',')[0]}</span>
                        <span className="text-xs text-gray-400">{orderDate.split(',')[1]}</span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-primary-dark">{order.name}</p>
                        <p className="text-xs text-gray-400">{order.email}</p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {order.orderItems?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                              {item.image ? (
                                <img src={item.image} alt="item" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-200" />
                              )}
                            </div>
                          ))}
                          {order.orderItems?.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500 shadow-sm">
                              +{order.orderItems.length - 3}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">{order.orderItems?.length || 0} items</p>
                      </td>

                      <td className="px-6 py-4 font-medium text-primary-dark">
                        Rs. {total.toFixed(2)}
                      </td>

                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={status}
                          onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                          className={`text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full outline-none cursor-pointer appearance-none text-center border transition-colors shadow-sm
                            ${status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 
                              status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 
                              status === 'Shipped' ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' :
                              status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'}`}
                        >
                          <option value="Preparing">Preparing</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            to={`/admin/orders/${order.orderId}`}
                            className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-full transition-colors flex items-center gap-2"
                            title="View Details"
                          >
                            <FiEye size={16} />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
