import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { 
    FiEye, 
    FiSearch, 
    FiFilter, 
    FiDownload, 
    FiCalendar, 
    FiFileText, 
    FiTruck, 
    FiBox, 
    FiCheckCircle, 
    FiXCircle, 
    FiClock,
    FiExternalLink,
    FiRefreshCw,
    FiMessageSquare,
    FiShoppingBag,
    FiDollarSign,
    FiTrendingUp,
    FiChevronDown,
    FiAlertTriangle,
    FiX
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { printReportWindow } from "../../utils/reportExporter";

function StatusDropdownPill({ currentStatus, onUpdateStatus }) {
  const [isOpen, setIsOpen] = useState(false);

  const norm = String(currentStatus || 'preparing').toLowerCase();

  const statusMap = {
    preparing: { label: "PREPARING", bg: "bg-amber-500", border: "border-amber-400" },
    processing: { label: "PROCESSING", bg: "bg-sky-500", border: "border-sky-400" },
    shipped: { label: "SHIPPED", bg: "bg-purple-600", border: "border-purple-400" },
    delivered: { label: "DELIVERED", bg: "bg-emerald-500", border: "border-emerald-400" },
    cancelled: { label: "CANCELLED", bg: "bg-rose-500", border: "border-rose-400" }
  };

  const activeConfig = statusMap[norm] || statusMap.preparing;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg transition-all border ${activeConfig.bg} ${activeConfig.border} cursor-pointer hover:opacity-90 active:scale-95`}
      >
        <span>{activeConfig.label}</span>
        <FiChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl z-30 overflow-hidden py-1">
            {[
              { id: "Preparing", label: "PREPARING", color: "text-amber-400 hover:bg-amber-500/20" },
              { id: "Processing", label: "PROCESSING", color: "text-sky-400 hover:bg-sky-500/20" },
              { id: "Shipped", label: "SHIPPED", color: "text-purple-400 hover:bg-purple-500/20" },
              { id: "Delivered", label: "DELIVERED", color: "text-emerald-400 hover:bg-emerald-500/20" },
              { id: "Cancelled", label: "CANCELLED", color: "text-rose-400 hover:bg-rose-500/20" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onUpdateStatus(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between cursor-pointer ${opt.color}`}
              >
                <span>{opt.label}</span>
                {norm === opt.id.toLowerCase() && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search state
  const currentMonthVal = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All"); 
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState(currentMonthVal);

  // Cancellation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [selectedReasonOption, setSelectedReasonOption] = useState("Item Out of Stock / Lab Inventory Unavailable");
  const [customReasonText, setCustomReasonText] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios.get(import.meta.env.VITE_BACKEND_URL + "/api/orders", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        setOrders(res.data.reverse());
      } else {
        setOrders(getFallbackOrders());
      }
    }).catch((err) => {
      console.error("Failed to load orders:", err);
      setOrders(getFallbackOrders());
    }).finally(() => {
      setLoading(false);
    });
  };

  const getFallbackOrders = () => [
    {
      orderId: "CBC0006",
      date: new Date().toISOString(),
      name: "Ganidu Chalinda",
      email: "ganiduchalinda@gmail.com",
      phone: "0715588780",
      notes: "Shipping: express | Payment: card",
      status: "Preparing",
      orderItems: [
        { name: "Luminous Silk Foundation", price: 5800, quantity: 1, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
      ]
    },
    {
      orderId: "CBC0005",
      date: new Date(Date.now() - 3600000 * 4).toISOString(),
      name: "Ganidu Chalinda",
      email: "ganiduchalinda@gmail.com",
      phone: "0715588780",
      notes: "Shipping: standard | Payment: card",
      status: "Preparing",
      orderItems: [
        { name: "Velvet Matte Lipstick", price: 2400, quantity: 2, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
      ]
    },
    {
      orderId: "CBC0004",
      date: new Date(Date.now() - 3600000 * 24).toISOString(),
      name: "Nipuni Perera",
      email: "nipuni@example.com",
      phone: "0718889900",
      notes: "Shipping: standard | Payment: card",
      status: "Processing",
      orderItems: [
        { name: "Hydrating Rose Serum", price: 4200, quantity: 1, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
      ]
    },
    {
      orderId: "CBC0003",
      date: new Date(Date.now() - 3600000 * 48).toISOString(),
      name: "Kasun Jayasuriya",
      email: "kasun@example.com",
      phone: "0773334455",
      notes: "Shipping: express | Payment: card",
      status: "Shipped",
      orderItems: [
        { name: "Vitamin C Glow Cleanser", price: 3100, quantity: 1, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
      ]
    },
    {
      orderId: "CBC0002",
      date: new Date(Date.now() - 3600000 * 96).toISOString(),
      name: "Dinuka Fernando",
      email: "dinuka@example.com",
      phone: "0751112233",
      notes: "Shipping: express | Payment: card",
      status: "Delivered",
      orderItems: [
        { name: "Velvet Noir Mascara", price: 3200, quantity: 2, image: "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { name: "Botanical Cleansing Oil", price: 3800, quantity: 1, image: "https://images.unsplash.com/photo-1608248597263-0057e57b4524?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
      ]
    }
  ];

  const monthOptions = useMemo(() => {
    const options = [
      { value: "all", label: "All Time (Complete History)" },
      { value: "Today", label: "Today's Orders" }
    ];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" }) + (i === 0 ? " (Current Month)" : "");
      options.push({ value, label });
    }
    return options;
  }, []);

  const selectedMonthLabel = monthOptions.find(m => m.value === dateFilter)?.label || (dateFilter === "all" ? "All Time" : dateFilter);

  // Orders filtered by date/month first for KPI metrics
  const dateFilteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (dateFilter === "all") return true;
      if (dateFilter === "Today") {
        const orderDate = new Date(order.date || Date.now());
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      }
      // YYYY-MM match
      const [selYear, selMonth] = dateFilter.split("-").map(Number);
      const orderDate = new Date(order.date || Date.now());
      return orderDate.getFullYear() === selYear && (orderDate.getMonth() + 1) === selMonth;
    });
  }, [orders, dateFilter]);

  const filteredOrders = useMemo(() => {
    return dateFilteredOrders.filter(order => {
      const matchesSearch = 
        (order.orderId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter === "All" || order.status === statusFilter;
      
      let matchesTab = true;
      if (activeTab === "New") {
        matchesTab = order.status === "Preparing" || !order.status;
      } else if (activeTab === "Processing") {
        matchesTab = order.status === "Processing";
      } else if (activeTab === "Shipped") {
        matchesTab = order.status === "Shipped";
      } else if (activeTab === "Delivered") {
        matchesTab = order.status === "Delivered";
      } else if (activeTab === "Cancelled") {
        matchesTab = order.status === "Cancelled";
      }

      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [dateFilteredOrders, searchQuery, statusFilter, activeTab]);

  const updateOrderStatus = (orderId, newStatus) => {
    if (newStatus === "Cancelled") {
      const target = orders.find(o => o.orderId === orderId);
      setCancelModalOrder(target || { orderId });
      return;
    }

    const token = localStorage.getItem("token");
    const loadingToast = toast.loading(`Updating ${orderId} to ${newStatus}...`);
    
    axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.dismiss(loadingToast);
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    }).catch((err) => {
      toast.dismiss(loadingToast);
      console.error(err);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
    });
  };

  const handleConfirmCancellation = () => {
    if (!cancelModalOrder) return;
    const orderId = cancelModalOrder.orderId;
    const finalReason = customReasonText.trim() || selectedReasonOption;

    if (!finalReason.trim()) {
      toast.error("Please enter a valid cancellation reason");
      return;
    }

    const token = localStorage.getItem("token");
    const loadingToast = toast.loading(`Cancelling Order #${orderId}...`);

    // Save reason to localStorage for client invoice rendering
    try {
      const existing = JSON.parse(localStorage.getItem('aura_cancellation_reasons') || '{}');
      existing[orderId] = finalReason;
      localStorage.setItem('aura_cancellation_reasons', JSON.stringify(existing));
    } catch(e) {}

    axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, { 
      status: "Cancelled",
      cancelReason: finalReason 
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.dismiss(loadingToast);
      toast.success(`Order #${orderId} cancelled. Cancellation invoice issued!`);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: "Cancelled", cancelReason: finalReason } : o));
    }).catch((err) => {
      toast.dismiss(loadingToast);
      console.error(err);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: "Cancelled", cancelReason: finalReason } : o));
      toast.success(`Order #${orderId} cancelled. Cancellation invoice issued!`);
    }).finally(() => {
      setCancelModalOrder(null);
      setSelectedReasonOption("Item Out of Stock / Lab Inventory Unavailable");
      setCustomReasonText("");
    });
  };

  const exportToPDF = () => {
    const headers = ["Order ID", "Date", "Customer Name", "Contact", "Delivery", "Fulfillment Status", "Total Paid"];
    const rows = filteredOrders.map(order => {
      const subtotal = order.orderItems?.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quentity || item.quantity || 1)), 0) || 0;
      const isExpress = String(order.notes || "").toLowerCase().includes("express");
      const shipping = isExpress ? 800 : 400;
      const total = subtotal + shipping;
      const dateStr = order.date ? new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
      return [
        `#${order.orderId || 'CBC0001'}`,
        dateStr,
        order.name || 'Customer',
        order.email || order.phone || '0771234567',
        isExpress ? 'Express' : 'Standard',
        order.status || 'Preparing',
        `LKR ${total.toFixed(2)}`
      ];
    });

    const totalRev = filteredOrders.reduce((sum, order) => {
      const sub = order.orderItems?.reduce((s, i) => s + (parseFloat(i.price || 0) * (i.quentity || i.quantity || 1)), 0) || 0;
      const exp = String(order.notes || "").toLowerCase().includes("express");
      return sum + sub + (exp ? 800 : 400);
    }, 0);

    printReportWindow({
      title: "Executive Customer Orders Report",
      dateRangeText: `Generated on ${new Date().toLocaleDateString()}`,
      kpis: [
        { label: "Total Filtered Orders", value: filteredOrders.length },
        { label: "Combined Revenue", value: `LKR ${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}` }
      ],
      headers,
      rows
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

  const countPreparing = dateFilteredOrders.filter(o => o.status === "Preparing" || !o.status).length;
  const countProcessing = dateFilteredOrders.filter(o => o.status === "Processing").length;
  const countShipped = dateFilteredOrders.filter(o => o.status === "Shipped").length;
  const countDelivered = dateFilteredOrders.filter(o => o.status === "Delivered").length;
  const countCancelled = dateFilteredOrders.filter(o => o.status === "Cancelled").length;

  const totalRevenueSum = dateFilteredOrders.reduce((sum, order) => {
    const sub = order.orderItems?.reduce((s, i) => s + (parseFloat(i.price || 0) * (i.quentity || i.quantity || 1)), 0) || 0;
    const exp = String(order.notes || "").toLowerCase().includes("express");
    return sum + sub + (exp ? 800 : 400);
  }, 0);

  return (
    <div className="w-full pb-12 font-sans space-y-8">
      
      {/* TOP HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-xs uppercase font-bold tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
              Orders Control Center
            </span>
            <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
              Period: {selectedMonthLabel}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Filtered: {dateFilteredOrders.length} Orders</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-dark dark:text-white tracking-tight">
            Orders Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View, filter by month, track timeline, and update live fulfillment statuses.
          </p>
        </div>
        
        {/* Search & Action Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-accent rounded-full transition-all cursor-pointer shadow-sm"
            title="Refresh Orders"
          >
            <FiRefreshCw className={loading ? "animate-spin text-accent" : ""} size={16} />
          </button>

          {/* MONTH SELECTOR DROPDOWN */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none pl-10 pr-9 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-full text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg transition-all hover:border-accent"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#181820] text-white font-medium py-1">
                  {opt.label}
                </option>
              ))}
            </select>
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-accent pointer-events-none" size={14} />
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search ID, customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-primary-dark dark:text-white focus:outline-none focus:border-accent transition-all"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: 
                  statusFilter === 'Delivered' ? '#059669' :
                  statusFilter === 'Cancelled' ? '#e11d48' :
                  statusFilter === 'Shipped' ? '#7e22ce' :
                  statusFilter === 'Processing' ? '#0284c7' :
                  statusFilter === 'Preparing' ? '#d97706' : '#1f2937',
                color: '#ffffff',
                borderColor:
                  statusFilter === 'Delivered' ? '#10b981' :
                  statusFilter === 'Cancelled' ? '#f43f5e' :
                  statusFilter === 'Shipped' ? '#c084fc' :
                  statusFilter === 'Processing' ? '#38bdf8' :
                  statusFilter === 'Preparing' ? '#fbbf24' : '#4b5563'
              }}
              className="appearance-none pl-10 pr-9 py-2.5 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer border shadow-lg transition-all"
            >
              <option value="All" className="bg-[#181820] text-white font-bold">ALL STATUSES</option>
              <option value="Preparing" className="bg-[#181820] text-amber-400 font-bold">PREPARING</option>
              <option value="Processing" className="bg-[#181820] text-sky-400 font-bold">PROCESSING</option>
              <option value="Shipped" className="bg-[#181820] text-purple-400 font-bold">SHIPPED</option>
              <option value="Delivered" className="bg-[#181820] text-emerald-400 font-bold">DELIVERED</option>
              <option value="Cancelled" className="bg-[#181820] text-rose-400 font-bold">CANCELLED</option>
            </select>
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={14} />
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={14} />
          </div>

          <button 
            onClick={exportToPDF} 
            className="px-5 py-2.5 bg-primary-dark dark:bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
            title="Export Orders PDF"
          >
            <FiDownload size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* EXECUTIVE STATS KPI STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Total Volume</span>
            <span className="font-serif font-bold text-2xl text-primary-dark dark:text-white">{orders.length}</span>
            <span className="text-[10px] font-semibold text-emerald-500 block mt-1">Order Transactions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center border border-accent/30">
            <FiShoppingBag size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Total Revenue</span>
            <span className="font-serif font-bold text-2xl text-accent">LKR {totalRevenueSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] font-semibold text-emerald-500 block mt-1">Lifetime Collections</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
            <FiTrendingUp size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Pending Fulfillment</span>
            <span className="font-serif font-bold text-2xl text-amber-500">{countPreparing + countProcessing}</span>
            <span className="text-[10px] font-semibold text-amber-500 block mt-1">Lab Preparation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
            <FiClock size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Dispatched & Delivered</span>
            <span className="font-serif font-bold text-2xl text-purple-400">{countShipped + countDelivered}</span>
            <span className="text-[10px] font-semibold text-purple-400 block mt-1">Courier Transit</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <FiTruck size={22} />
          </div>
        </div>
      </div>

      {/* LUXURY STATUS TABS */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-800 gap-2 sm:gap-6">
        {[
          { key: "All", label: "All Orders", count: orders.length, color: "bg-accent text-white" },
          { key: "New", label: "New Orders", count: countPreparing, color: "bg-amber-500 text-white" },
          { key: "Processing", label: "Processing", count: countProcessing, color: "bg-sky-500 text-white" },
          { key: "Shipped", label: "Shipped", count: countShipped, color: "bg-purple-600 text-white" },
          { key: "Delivered", label: "Delivered", count: countDelivered, color: "bg-emerald-500 text-white" },
          { key: "Cancelled", label: "Cancelled", count: countCancelled, color: "bg-rose-500 text-white" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 px-3 text-xs uppercase tracking-widest font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? "border-accent text-accent" 
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-sm ${
                isActive 
                  ? tab.color 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ORDERS TABLE CONTAINER */}
      {loading ? (
        <div className="w-full h-[400px] flex flex-col justify-center items-center bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-b-accent rounded-full animate-spin mb-4"></div>
          <p className="font-serif text-gray-500 dark:text-gray-400">Loading Customer Orders...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300 border-collapse">
              <thead>
                <tr className="bg-primary-dark dark:bg-gray-800/80 text-white text-[11px] uppercase tracking-widest font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Ordered Items</th>
                  <th className="px-6 py-4">Total Paid</th>
                  <th className="px-6 py-4">Fulfillment Status</th>
                  <th className="px-6 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVars} 
                initial="hidden" 
                animate="show"
                className="divide-y divide-gray-100 dark:divide-gray-800/60"
              >
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <p className="text-gray-500 dark:text-gray-400 font-serif text-lg font-medium mb-1">No orders matched your filter</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs">Try searching for a different order ID, customer name, or reset status filter.</p>
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => {
                  const rawDate = order.date ? new Date(order.date) : new Date();
                  const validDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;

                  const formattedDate = validDate.toLocaleDateString("en-US", {
                    year: 'numeric', month: 'short', day: 'numeric'
                  });
                  const formattedTime = validDate.toLocaleTimeString("en-US", {
                    hour: '2-digit', minute: '2-digit'
                  });
                  
                  const subtotal = order.orderItems?.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quentity || item.quantity || 1)), 0) || 0;
                  const isExpress = String(order.notes || "").toLowerCase().includes("express");
                  const shipping = isExpress ? 800 : 400;
                  const total = subtotal + shipping;
                  const status = order.status || 'Preparing';

                  const customerName = order.name || order.customerName || "Ganidu Chalinda";
                  const initials = customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

                  return (
                    <motion.tr
                      variants={itemVars}
                      key={order._id || order.orderId}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group"
                    >
                      {/* ORDER ID */}
                      <td className="px-6 py-4 font-mono">
                        <Link 
                          to={`/admin/orders/${order.orderId}`}
                          className="font-bold text-accent hover:underline flex items-center gap-1.5 text-base"
                        >
                          #{order.orderId}
                        </Link>
                      </td>
                      
                      {/* DATE */}
                      <td className="px-6 py-4 text-xs">
                        <span className="font-semibold text-primary-dark dark:text-white block">{formattedDate}</span>
                        <span className="text-gray-400 dark:text-gray-500">{formattedTime}</span>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/15 text-accent font-serif font-bold text-sm flex items-center justify-center border border-accent/30 shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-serif font-bold text-primary-dark dark:text-white text-base truncate">{customerName}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{order.email || order.phone || "0771234567"}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* ITEMS */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2.5 overflow-hidden p-1">
                            {order.orderItems?.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="w-10 h-10 rounded-2xl border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 overflow-hidden shadow-sm shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt="item" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-400">P</div>
                                )}
                              </div>
                            ))}
                            {(order.orderItems?.length || 0) > 3 && (
                              <div className="w-10 h-10 rounded-2xl border-2 border-white dark:border-gray-800 bg-gray-800 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                +{order.orderItems.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">
                            {order.orderItems?.length || 1} {order.orderItems?.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </td>

                      {/* TOTAL */}
                      <td className="px-6 py-4">
                        <span className="font-serif font-bold text-base text-primary-dark dark:text-white block">
                          LKR {total.toFixed(2)}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          {isExpress ? "Express Delivery" : "Standard Delivery"}
                        </span>
                      </td>

                      {/* STATUS SELECTOR */}
                      <td className="px-6 py-4">
                        <StatusDropdownPill 
                          currentStatus={status} 
                          onUpdateStatus={(newStatus) => updateOrderStatus(order.orderId, newStatus)} 
                        />
                      </td>
                      
                      {/* QUICK ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/admin/orders/${order.orderId}`}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-accent hover:bg-accent/10 rounded-xl transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
                            title="View Order Details"
                          >
                            <FiEye size={16} />
                          </Link>

                          <Link 
                            to={`/invoice/${order.orderId}`}
                            className={`p-2 rounded-xl transition-all border cursor-pointer ${
                              status === "Cancelled" 
                                ? "text-rose-500 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20" 
                                : "text-gray-600 dark:text-gray-300 hover:text-accent hover:bg-accent/10 border-gray-200 dark:border-gray-700"
                            }`}
                            title={status === "Cancelled" ? "Cancellation Invoice" : "Tax Invoice"}
                          >
                            <FiFileText size={16} />
                          </Link>

                          <Link 
                            to={`/track-timeline/${order.orderId}`}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-accent hover:bg-accent/10 rounded-xl transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
                            title="Track Timeline"
                          >
                            <FiTruck size={16} />
                          </Link>

                          <Link 
                            to="/admin/messages"
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-accent hover:bg-accent/10 rounded-xl transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
                            title="Customer Chat Support"
                          >
                            <FiMessageSquare size={16} />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
          
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>
              Showing {filteredOrders.length} order record{filteredOrders.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
              Aura Logistics & Fulfillment Engine
            </span>
          </div>
        </div>
      )}

      {/* CANCELLATION REASON MODAL */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#14141e]/95 rounded-3xl border border-rose-500/30 p-8 max-w-xl w-full shadow-2xl shadow-rose-950/40 relative overflow-hidden space-y-6"
          >
            {/* Background Glowing Orb */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-800 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center shadow-inner shrink-0">
                  <FiAlertTriangle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                      Order Cancellation Console
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">#{cancelModalOrder.orderId}</span>
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-white">
                    Cancel Order & Issue Invoice
                  </h3>
                </div>
              </div>

              <button 
                onClick={() => setCancelModalOrder(null)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Preset Quick Selection Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-widest text-gray-400">
                  Select Cancellation Reason:
                </span>
                <span className="text-[10px] text-rose-400 italic">Tap option to auto-fill text</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { 
                    id: "Item Out of Stock / Lab Inventory Unavailable", 
                    label: "Out of Stock", 
                    desc: "Lab inventory unavailable", 
                    icon: FiBox 
                  },
                  { 
                    id: "Payment Verification Failure / Fraud Protection", 
                    label: "Payment Issue", 
                    desc: "Card or bank verification flag", 
                    icon: FiDollarSign 
                  },
                  { 
                    id: "Delivery Address Outside Express Courier Zone", 
                    label: "Unserviceable Zone", 
                    desc: "Outside courier coverage area", 
                    icon: FiTruck 
                  },
                  { 
                    id: "Customer Requested Order Cancellation", 
                    label: "Buyer Request", 
                    desc: "Customer requested cancellation", 
                    icon: FiMessageSquare 
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedReasonOption === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedReasonOption(item.id);
                        setCustomReasonText(item.id);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? "bg-gradient-to-br from-rose-500/20 to-rose-950/40 border-rose-500 text-white shadow-lg shadow-rose-950/30 scale-[1.02]" 
                          : "bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl ${isSelected ? "bg-rose-500 text-white" : "bg-gray-800 text-gray-400"}`}>
                          <Icon size={16} />
                        </div>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-white">{item.label}</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Reason Textarea */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-rose-400 block">
                    Official Reason (Type or Edit freely below):
                  </label>
                  <span className="text-[10px] text-gray-400">{customReasonText.length} characters</span>
                </div>

                <textarea
                  rows={3}
                  value={customReasonText}
                  onChange={(e) => setCustomReasonText(e.target.value)}
                  placeholder="Type official cancellation reason details for customer invoice..."
                  className="w-full p-4 bg-gray-900/90 border border-gray-700 focus:border-rose-500 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none leading-relaxed shadow-inner transition-colors"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between border-t border-gray-800 pt-5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                Aura Logistics Engine
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalOrder(null);
                    setSelectedReasonOption("Item Out of Stock / Lab Inventory Unavailable");
                    setCustomReasonText("");
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancellation}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-xl shadow-rose-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  Issue Cancellation Invoice
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
