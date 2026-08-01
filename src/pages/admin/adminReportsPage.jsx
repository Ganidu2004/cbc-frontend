import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiFileText, 
  FiDownload, 
  FiPrinter, 
  FiCalendar, 
  FiSearch, 
  FiRefreshCw, 
  FiTrendingUp, 
  FiShoppingBag, 
  FiUsers, 
  FiBox, 
  FiDollarSign,
  FiArrowUpRight,
  FiFilter
} from "react-icons/fi";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { exportToCSV, printReportWindow } from "../../utils/reportExporter";

const COLORS = ["#d4af37", "#1e1e24", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminReportsPage() {
  // Data state
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [reportType, setReportType] = useState("sales"); // 'sales', 'orders', 'products', 'customers'
  const [dateRangePreset, setDateRangePreset] = useState("last30"); // 'today', 'last7', 'last30', 'thisMonth', 'all', 'custom'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Load data on mount
  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get(import.meta.env.VITE_BACKEND_URL + "/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => ({ data: [] })),
        axios.get(import.meta.env.VITE_BACKEND_URL + "/api/product").catch(err => ({ data: [] })),
        axios.get(import.meta.env.VITE_BACKEND_URL + "/api/users").catch(err => ({ data: [] }))
      ]);

      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (error) {
      console.error("Failed to load report data:", error);
      toast.error("Failed to fetch analytical data");
    } finally {
      setLoading(false);
    }
  };

  // Date Filtering Logic
  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orders.filter(order => {
      if (!order.date) return true;
      const orderDate = new Date(order.date);

      if (dateRangePreset === "today") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateRangePreset === "last7") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      }
      if (dateRangePreset === "last30") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return orderDate >= thirtyDaysAgo;
      }
      if (dateRangePreset === "thisMonth") {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      if (dateRangePreset === "custom") {
        if (startDate && orderDate < new Date(startDate)) return false;
        if (endDate && orderDate > new Date(endDate + "T23:59:59")) return false;
        return true;
      }
      return true; // 'all'
    });
  }, [orders, dateRangePreset, startDate, endDate]);

  // Derived KPI Summaries & Chart Data
  const reportAnalytics = useMemo(() => {
    let totalRevenue = 0;
    let totalItemsSold = 0;
    let statusCounts = { Preparing: 0, Shipped: 0, Delivered: 0, Cancelled: 0, Other: 0 };
    const dateMap = {};
    const productSalesMap = {};

    filteredOrders.forEach(order => {
      // Calculate order total
      let orderTotal = 0;
      if (Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          const qty = item.quentity || item.quantity || 1;
          const price = parseFloat(item.price) || 0;
          const itemTotal = price * qty;
          orderTotal += itemTotal;
          totalItemsSold += qty;

          // Product performance aggregation
          const pName = item.name || "Unknown Product";
          if (!productSalesMap[pName]) {
            productSalesMap[pName] = { name: pName, unitsSold: 0, revenue: 0, price };
          }
          productSalesMap[pName].unitsSold += qty;
          productSalesMap[pName].revenue += itemTotal;
        });
      }

      totalRevenue += orderTotal;

      // Status aggregation
      const status = order.status || "Preparing";
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      } else {
        statusCounts.Other++;
      }

      // Timeline aggregation
      const dateKey = order.date 
        ? new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Unknown";
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
      }
      dateMap[dateKey].revenue += orderTotal;
      dateMap[dateKey].orders += 1;
    });

    const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    // Timeline array for recharts
    const timelineData = Object.values(dateMap);

    // Status breakdown array for recharts
    const statusChartData = Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));

    // Top Selling Products array
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Category Distribution from Products catalog
    const categoryMap = {};
    let totalStockValue = 0;
    let lowStockCount = 0;

    products.forEach(p => {
      const cat = p.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      const stock = parseInt(p.stock) || 0;
      const price = parseFloat(p.price) || 0;
      totalStockValue += stock * price;
      if (stock <= 5) lowStockCount++;
    });

    const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      totalItemsSold,
      averageOrderValue,
      statusCounts,
      timelineData,
      statusChartData,
      topProducts,
      categoryChartData,
      totalStockValue,
      lowStockCount,
      totalCatalogProducts: products.length,
      totalUsersCount: users.length
    };
  }, [filteredOrders, products, users]);

  // Format Date Range Display text
  const dateRangeText = useMemo(() => {
    if (dateRangePreset === "today") return "Today";
    if (dateRangePreset === "last7") return "Last 7 Days";
    if (dateRangePreset === "last30") return "Last 30 Days";
    if (dateRangePreset === "thisMonth") return "This Month";
    if (dateRangePreset === "custom") return `${startDate || 'Start'} to ${endDate || 'End'}`;
    return "All Time";
  }, [dateRangePreset, startDate, endDate]);

  // Tabular Data Generation per Report Type
  const tableData = useMemo(() => {
    let rows = [];

    if (reportType === "sales" || reportType === "orders") {
      rows = filteredOrders.map(order => {
        const orderTotal = Array.isArray(order.orderItems) 
          ? order.orderItems.reduce((sum, i) => sum + ((parseFloat(i.price) || 0) * (i.quentity || i.quantity || 1)), 0)
          : 0;
        const itemsSummary = Array.isArray(order.orderItems)
          ? order.orderItems.map(i => `${i.name} (x${i.quentity || 1})`).join(", ")
          : "N/A";

        return {
          id: order.orderId || order._id,
          customer: order.name || order.email || "Guest",
          email: order.email || "-",
          date: order.date ? new Date(order.date).toLocaleDateString() : "-",
          rawDate: order.date ? new Date(order.date) : new Date(0),
          status: order.status || "Preparing",
          itemsCount: order.orderItems ? order.orderItems.length : 0,
          itemsSummary,
          amount: orderTotal
        };
      });
    } else if (reportType === "products") {
      rows = reportAnalytics.topProducts.map(p => ({
        id: p.name,
        name: p.name,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
        avgPrice: p.unitsSold > 0 ? (p.revenue / p.unitsSold) : p.price
      }));
    } else if (reportType === "customers") {
      // Group spending by customer email
      const customerMap = {};
      filteredOrders.forEach(o => {
        const email = o.email || "Unknown";
        const name = o.name || email;
        const total = Array.isArray(o.orderItems)
          ? o.orderItems.reduce((sum, i) => sum + ((parseFloat(i.price) || 0) * (i.quentity || 1)), 0)
          : 0;

        if (!customerMap[email]) {
          customerMap[email] = { email, name, orderCount: 0, totalSpent: 0, lastOrder: o.date };
        }
        customerMap[email].orderCount += 1;
        customerMap[email].totalSpent += total;
        if (new Date(o.date) > new Date(customerMap[email].lastOrder)) {
          customerMap[email].lastOrder = o.date;
        }
      });
      rows = Object.values(customerMap);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(r => 
        Object.values(r).some(val => String(val).toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortField) {
      rows.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [reportType, filteredOrders, reportAnalytics, searchQuery, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    let filename = `aura_${reportType}_report_${dateRangePreset}.csv`;
    let headers = [];
    let csvRows = [];

    if (reportType === "sales" || reportType === "orders") {
      headers = ["Order ID", "Customer Name", "Customer Email", "Date", "Status", "Items Count", "Items", "Total Amount (Rs.)"];
      csvRows = tableData.map(r => [
        r.id, r.customer, r.email, r.date, r.status, r.itemsCount, r.itemsSummary, r.amount.toFixed(2)
      ]);
    } else if (reportType === "products") {
      headers = ["Product Name", "Units Sold", "Total Revenue (Rs.)", "Avg Selling Price (Rs.)"];
      csvRows = tableData.map(r => [
        r.name, r.unitsSold, r.revenue.toFixed(2), r.avgPrice.toFixed(2)
      ]);
    } else if (reportType === "customers") {
      headers = ["Customer Name", "Email", "Total Orders", "Total Spent (Rs.)", "Last Order Date"];
      csvRows = tableData.map(r => [
        r.name, r.email, r.orderCount, r.totalSpent.toFixed(2), r.lastOrder ? new Date(r.lastOrder).toLocaleDateString() : '-'
      ]);
    }

    exportToCSV(filename, headers, csvRows);
    toast.success("CSV Report downloaded successfully!");
  };

  // Print PDF Handler
  const handlePrintPDF = () => {
    let title = "Sales & Revenue Report";
    let kpis = [];
    let headers = [];
    let printRows = [];

    if (reportType === "sales") {
      title = "Sales & Revenue Executive Report";
      kpis = [
        { label: "Total Revenue", value: `Rs. ${reportAnalytics.totalRevenue.toLocaleString()}` },
        { label: "Total Orders", value: reportAnalytics.totalOrders },
        { label: "Avg Order Value", value: `Rs. ${reportAnalytics.averageOrderValue.toFixed(2)}` },
        { label: "Units Sold", value: reportAnalytics.totalItemsSold }
      ];
      headers = ["Order ID", "Customer", "Date", "Status", "Amount"];
      printRows = tableData.map(r => [r.id, r.customer, r.date, r.status, `Rs. ${r.amount.toFixed(2)}`]);
    } else if (reportType === "orders") {
      title = "Order Fulfillment & Status Analytics";
      kpis = [
        { label: "Total Orders", value: reportAnalytics.totalOrders },
        { label: "Preparing", value: reportAnalytics.statusCounts.Preparing || 0 },
        { label: "Shipped", value: reportAnalytics.statusCounts.Shipped || 0 },
        { label: "Delivered", value: reportAnalytics.statusCounts.Delivered || 0 }
      ];
      headers = ["Order ID", "Customer", "Date", "Fulfillment Status", "Items Summary"];
      printRows = tableData.map(r => [r.id, r.customer, r.date, r.status, r.itemsSummary]);
    } else if (reportType === "products") {
      title = "Product Performance & Inventory Report";
      kpis = [
        { label: "Catalog Products", value: reportAnalytics.totalCatalogProducts },
        { label: "Total Stock Value", value: `Rs. ${reportAnalytics.totalStockValue.toLocaleString()}` },
        { label: "Low Stock Items", value: reportAnalytics.lowStockCount }
      ];
      headers = ["Product Name", "Units Sold", "Total Revenue", "Avg Price"];
      printRows = tableData.map(r => [r.name, r.unitsSold, `Rs. ${r.revenue.toFixed(2)}`, `Rs. ${r.avgPrice.toFixed(2)}`]);
    } else if (reportType === "customers") {
      title = "Customer Purchasing Analytics";
      kpis = [
        { label: "Total Registered Users", value: reportAnalytics.totalUsersCount },
        { label: "Active Buyers in Period", value: tableData.length }
      ];
      headers = ["Customer Name", "Email", "Total Orders", "Total Spent"];
      printRows = tableData.map(r => [r.name, r.email, r.orderCount, `Rs. ${r.totalSpent.toFixed(2)}`]);
    }

    printReportWindow({ title, dateRangeText, kpis, headers, rows: printRows });
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Top Header & Export Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
              <FiFileText size={24} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">
              Reports & Business Intelligence
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-sans ml-12">
            Analyze key store metrics, performance breakdowns, and export executive reports.
          </p>
        </div>

        {/* Export & Refresh Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReportData}
            disabled={loading}
            className="p-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2 text-sm font-medium"
            title="Refresh Data"
          >
            <FiRefreshCw className={loading ? "animate-spin text-accent" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-3 rounded-xl bg-gray-900 hover:bg-black text-white transition-all flex items-center gap-2 text-sm font-medium shadow-md shadow-gray-900/10"
          >
            <FiDownload size={16} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-4 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white transition-all flex items-center gap-2 text-sm font-medium shadow-md shadow-accent/20"
          >
            <FiPrinter size={16} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Report Type & Date Selector */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 justify-between items-stretch">
        {/* Segmented Report Type Tabs */}
        <div className="flex flex-wrap items-center bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/60">
          {[
            { id: "sales", label: "Sales & Revenue", icon: FiDollarSign },
            { id: "orders", label: "Order Analytics", icon: FiShoppingBag },
            { id: "products", label: "Product Performance", icon: FiBox },
            { id: "customers", label: "Customer Analytics", icon: FiUsers }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = reportType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm font-bold"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <Icon size={16} className={isActive ? "text-accent" : "text-gray-400"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <FiCalendar size={15} className="text-accent" />
            <span>Period:</span>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "today", label: "Today" },
              { id: "last7", label: "Last 7 Days" },
              { id: "last30", label: "Last 30 Days" },
              { id: "thisMonth", label: "This Month" },
              { id: "all", label: "All Time" },
              { id: "custom", label: "Custom" }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => setDateRangePreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dateRangePreset === preset.id
                    ? "bg-primary-dark text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          {dateRangePreset === "custom" && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200"
            >
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* KPI Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportType === "sales" && (
          <>
            <KPICard
              title="Total Revenue"
              value={`Rs. ${reportAnalytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              subtitle={dateRangeText}
              icon={FiDollarSign}
              color="accent"
            />
            <KPICard
              title="Total Orders"
              value={reportAnalytics.totalOrders.toString()}
              subtitle="Completed & active orders"
              icon={FiShoppingBag}
              color="blue"
            />
            <KPICard
              title="Avg. Order Value"
              value={`Rs. ${reportAnalytics.averageOrderValue.toFixed(2)}`}
              subtitle="Per transaction"
              icon={FiTrendingUp}
              color="emerald"
            />
            <KPICard
              title="Units Sold"
              value={reportAnalytics.totalItemsSold.toString()}
              subtitle="Total items ordered"
              icon={FiBox}
              color="purple"
            />
          </>
        )}

        {reportType === "orders" && (
          <>
            <KPICard
              title="Total Volume"
              value={reportAnalytics.totalOrders.toString()}
              subtitle={dateRangeText}
              icon={FiShoppingBag}
              color="accent"
            />
            <KPICard
              title="Preparing"
              value={(reportAnalytics.statusCounts.Preparing || 0).toString()}
              subtitle="Awaiting dispatch"
              icon={FiRefreshCw}
              color="amber"
            />
            <KPICard
              title="Shipped"
              value={(reportAnalytics.statusCounts.Shipped || 0).toString()}
              subtitle="In transit"
              icon={FiTrendingUp}
              color="blue"
            />
            <KPICard
              title="Delivered"
              value={(reportAnalytics.statusCounts.Delivered || 0).toString()}
              subtitle="Successfully fulfilled"
              icon={FiArrowUpRight}
              color="emerald"
            />
          </>
        )}

        {reportType === "products" && (
          <>
            <KPICard
              title="Catalog Items"
              value={reportAnalytics.totalCatalogProducts.toString()}
              subtitle="Active products"
              icon={FiBox}
              color="accent"
            />
            <KPICard
              title="Est. Stock Value"
              value={`Rs. ${reportAnalytics.totalStockValue.toLocaleString()}`}
              subtitle="Total inventory worth"
              icon={FiDollarSign}
              color="emerald"
            />
            <KPICard
              title="Top Seller Volume"
              value={reportAnalytics.topProducts[0] ? `${reportAnalytics.topProducts[0].unitsSold} units` : "0"}
              subtitle={reportAnalytics.topProducts[0]?.name || "N/A"}
              icon={FiTrendingUp}
              color="purple"
            />
            <KPICard
              title="Low Stock Warning"
              value={reportAnalytics.lowStockCount.toString()}
              subtitle="Products with <= 5 stock"
              icon={FiFilter}
              color="rose"
            />
          </>
        )}

        {reportType === "customers" && (
          <>
            <KPICard
              title="Total Accounts"
              value={reportAnalytics.totalUsersCount.toString()}
              subtitle="Registered user profiles"
              icon={FiUsers}
              color="accent"
            />
            <KPICard
              title="Purchasing Customers"
              value={tableData.length.toString()}
              subtitle={`Active in ${dateRangeText}`}
              icon={FiShoppingBag}
              color="blue"
            />
            <KPICard
              title="Avg Orders / Customer"
              value={tableData.length > 0 ? (reportAnalytics.totalOrders / tableData.length).toFixed(1) : "0"}
              subtitle="Order frequency"
              icon={FiTrendingUp}
              color="emerald"
            />
            <KPICard
              title="Top Buyer Spend"
              value={tableData[0] ? `Rs. ${tableData[0].totalSpent?.toFixed(2)}` : "Rs. 0.00"}
              subtitle={tableData[0]?.name || "N/A"}
              icon={FiDollarSign}
              color="purple"
            />
          </>
        )}
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900">
                {reportType === "sales" ? "Revenue Timeline Trend" : "Order Volume Trend"}
              </h2>
              <p className="text-xs text-gray-400">Daily performance breakdown over period</p>
            </div>
            <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full">
              {dateRangeText}
            </span>
          </div>

          <div className="h-72 w-full">
            {reportAnalytics.timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportAnalytics.timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e1e24", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                    itemStyle={{ color: "#d4af37" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={reportType === "sales" ? "revenue" : "orders"} 
                    name={reportType === "sales" ? "Revenue (Rs.)" : "Orders"} 
                    stroke="#d4af37" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                No transaction data recorded for this date range.
              </div>
            )}
          </div>
        </div>

        {/* Secondary Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-gray-900 mb-1">
              {reportType === "products" ? "Catalog Category Share" : "Fulfillment Distribution"}
            </h2>
            <p className="text-xs text-gray-400 mb-6">Breakdown by current segments</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {reportType === "products" ? (
              reportAnalytics.categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportAnalytics.categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {reportAnalytics.categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e1e24", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 text-sm italic">No categories available</div>
              )
            ) : (
              reportAnalytics.statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportAnalytics.statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {reportAnalytics.statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e1e24", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 text-sm italic">No order status data</div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Itemized Report Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-gray-900">
              Detailed {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Breakdown
            </h2>
            <p className="text-xs text-gray-400">Showing {tableData.length} records in current report view</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search report items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-accent focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Table contents */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                {(reportType === "sales" || reportType === "orders") && (
                  <>
                    <th onClick={() => handleSort("id")} className="py-4 px-6 cursor-pointer hover:text-gray-900">Order ID</th>
                    <th onClick={() => handleSort("customer")} className="py-4 px-6 cursor-pointer hover:text-gray-900">Customer</th>
                    <th onClick={() => handleSort("date")} className="py-4 px-6 cursor-pointer hover:text-gray-900">Date</th>
                    <th onClick={() => handleSort("status")} className="py-4 px-6 cursor-pointer hover:text-gray-900">Status</th>
                    <th className="py-4 px-6">Items Summary</th>
                    <th onClick={() => handleSort("amount")} className="py-4 px-6 text-right cursor-pointer hover:text-gray-900">Amount</th>
                  </>
                )}

                {reportType === "products" && (
                  <>
                    <th onClick={() => handleSort("name")} className="py-4 px-6 cursor-pointer hover:text-gray-900">Product Name</th>
                    <th onClick={() => handleSort("unitsSold")} className="py-4 px-6 text-center cursor-pointer hover:text-gray-900">Units Sold</th>
                    <th onClick={() => handleSort("avgPrice")} className="py-4 px-6 text-right cursor-pointer hover:text-gray-900">Avg. Selling Price</th>
                    <th onClick={() => handleSort("revenue")} className="py-4 px-6 text-right cursor-pointer hover:text-gray-900">Total Revenue</th>
                  </>
                )}

                {reportType === "customers" && (
                  <>
                    <th onClick={() => handleSort("name")} className="py-4 px-6 cursor-pointer hover:text-gray-900">Customer Name</th>
                    <th onClick={() => handleSort("email")} className="py-4 px-6 cursor-pointer hover:text-gray-900">Email Address</th>
                    <th onClick={() => handleSort("orderCount")} className="py-4 px-6 text-center cursor-pointer hover:text-gray-900">Total Orders</th>
                    <th onClick={() => handleSort("lastOrder")} className="py-4 px-6 cursor-pointer hover:text-gray-900">Last Order Date</th>
                    <th onClick={() => handleSort("totalSpent")} className="py-4 px-6 text-right cursor-pointer hover:text-gray-900">Total Lifetime Spend</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-sans">
              {tableData.length > 0 ? (
                tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    {(reportType === "sales" || reportType === "orders") && (
                      <>
                        <td className="py-4 px-6 font-mono font-medium text-gray-900">{row.id}</td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{row.customer}</div>
                          <div className="text-[11px] text-gray-400">{row.email}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-500">{row.date}</td>
                        <td className="py-4 px-6">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate text-gray-600" title={row.itemsSummary}>
                          {row.itemsSummary}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-gray-900 font-serif">
                          Rs. {row.amount.toFixed(2)}
                        </td>
                      </>
                    )}

                    {reportType === "products" && (
                      <>
                        <td className="py-4 px-6 font-semibold text-gray-900">{row.name}</td>
                        <td className="py-4 px-6 text-center">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-md font-bold">
                            {row.unitsSold}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-gray-600 font-serif">
                          Rs. {row.avgPrice.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-accent font-serif">
                          Rs. {row.revenue.toFixed(2)}
                        </td>
                      </>
                    )}

                    {reportType === "customers" && (
                      <>
                        <td className="py-4 px-6 font-semibold text-gray-900">{row.name}</td>
                        <td className="py-4 px-6 text-gray-500">{row.email}</td>
                        <td className="py-4 px-6 text-center font-bold text-gray-800">{row.orderCount}</td>
                        <td className="py-4 px-6 text-gray-500">
                          {row.lastOrder ? new Date(row.lastOrder).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-emerald-600 font-serif">
                          Rs. {row.totalSpent.toFixed(2)}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                    {loading ? "Loading report data..." : "No matching report data found for selected criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// KPI Card Sub-Component
function KPICard({ title, value, subtitle, icon: Icon, color = "accent" }) {
  const colorMap = {
    accent: "bg-amber-50 text-amber-600 border-amber-200/60",
    blue: "bg-blue-50 text-blue-600 border-blue-200/60",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    purple: "bg-purple-50 text-purple-600 border-purple-200/60",
    amber: "bg-amber-50 text-amber-600 border-amber-200/60",
    rose: "bg-rose-50 text-rose-600 border-rose-200/60"
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
          {title}
        </span>
        <div className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <span className="text-[11px] text-gray-500 font-medium block mt-1">
            {subtitle}
          </span>
        )}
      </div>
      <div className={`p-3.5 rounded-2xl border ${colorMap[color] || colorMap.accent}`}>
        <Icon size={22} />
      </div>
    </div>
  );
}

// Order Status Badge Sub-Component
function StatusBadge({ status }) {
  const statusStyles = {
    Preparing: "bg-amber-50 text-amber-700 border-amber-200",
    Shipped: "bg-blue-50 text-blue-700 border-blue-200",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200"
  };

  const currentStyle = statusStyles[status] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${currentStyle}`}>
      {status || "Preparing"}
    </span>
  );
}
