import { motion } from "framer-motion";
import { FiTrendingUp, FiUsers, FiShoppingBag, FiDollarSign, FiMoreHorizontal } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: "Rs. 0.00",
    activeOrders: "0",
    totalCustomers: "0",
    conversionRate: "3.24%" // Kept static for now as we don't track page views
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem("token");
        const [ordersRes, usersRes] = await Promise.all([
          axios.get(import.meta.env.VITE_BACKEND_URL + "/api/orders", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(import.meta.env.VITE_BACKEND_URL + "/api/users")
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];

        // Calculate Total Revenue
        let revenue = 0;
        let activeCount = 0;

        // Initialize last 7 days for chart
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            dateStr: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            fullDate: d.toDateString(),
            revenue: 0
          };
        });

        orders.forEach(order => {
          if (order.status !== "Delivered" && order.status !== "Cancelled") {
            activeCount++;
          }
          
          let orderTotal = 0;
          if (order.orderItems) {
            order.orderItems.forEach(item => {
              orderTotal += (parseFloat(item.price) * (item.quentity || 1));
            });
            revenue += orderTotal;
          }

          // Map to chart data if within last 7 days
          const orderDate = new Date(order.date).toDateString();
          const dayMatch = last7Days.find(d => d.fullDate === orderDate);
          if (dayMatch) {
            dayMatch.revenue += orderTotal;
          }
        });

        const finalChartData = last7Days.map(d => ({
          name: d.dateStr,
          Revenue: d.revenue
        }));

        // Format recent orders
        const formattedOrders = orders
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 4)
          .map(order => ({
            id: order.orderId,
            customer: order.name || order.email,
            product: order.orderItems && order.orderItems.length > 0 
              ? `${order.orderItems[0].name}${order.orderItems.length > 1 ? ` +${order.orderItems.length - 1} more` : ''}` 
              : "Unknown Item",
            date: new Date(order.date).toLocaleDateString(),
            status: order.status || "Preparing",
            amount: "Rs. " + (order.orderItems?.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quentity || 1)), 0) || 0).toFixed(2)
          }));

        setStats({
          totalRevenue: "Rs. " + revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          activeOrders: activeCount.toString(),
          totalCustomers: users.length.toString(),
          conversionRate: "3.24%"
        });

        setRecentOrders(formattedOrders);
        setChartData(finalChartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const STATS_CARDS = [
    { id: 1, label: "Total Revenue", value: stats.totalRevenue, increment: "+20.1%", icon: <FiDollarSign size={20} /> },
    { id: 2, label: "Active Orders", value: stats.activeOrders, increment: "+12.5%", icon: <FiShoppingBag size={20} /> },
    { id: 3, label: "Total Customers", value: stats.totalCustomers, increment: "+5.2%", icon: <FiUsers size={20} /> },
    { id: 4, label: "Conversion Rate", value: stats.conversionRate, increment: "+1.1%", icon: <FiTrendingUp size={20} /> },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center w-full h-full text-primary-dark font-serif text-2xl">Loading Dashboard...</div>;
  }

  return (
    <div className="w-full min-h-full pb-10 text-primary-dark">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-serif mb-1">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm font-light">Welcome back, Admin. Here's what's happening with Aura Cosmetics today.</p>
        </div>
        <button className="bg-primary-dark text-white px-6 py-2.5 text-sm uppercase tracking-widest font-medium hover:bg-black transition-colors rounded-sm shadow-sm">
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVars} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10"
      >
        {STATS_CARDS.map(stat => (
          <motion.div key={stat.id} variants={itemVars} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/30 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-accent">
                {stat.icon}
              </div>
              <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-md">{stat.increment}</span>
            </div>
            
            <div className="relative z-10">
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
              <h3 className="text-2xl font-serif">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lower Section (Charts & Tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Chart Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-serif">Revenue Overview</h2>
            <select className="text-sm border border-gray-200 rounded-md px-3 py-1 outline-none text-gray-500">
              <option>This Week</option>
            </select>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C19A8B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C19A8B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(value) => `Rs. ${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`Rs. ${value.toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#C19A8B" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Orders List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col max-h-[420px]"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-serif">Recent Orders</h2>
            <button onClick={() => navigate("/admin/orders")} className="text-gray-400 hover:text-primary-dark transition-colors"><FiMoreHorizontal size={20}/></button>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto pr-2">
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold">{order.customer}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">{order.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{order.amount}</p>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full mt-1 inline-block
                    ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 
                      order.status === 'Preparing' ? 'bg-orange-50 text-orange-600' : 
                      'bg-blue-50 text-blue-600'}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-sm text-center pt-10">No recent orders found.</p>
            )}
          </div>

          <button onClick={() => navigate("/admin/orders")} className="w-full mt-6 pt-4 border-t border-gray-50 text-sm text-center text-accent hover:text-primary-dark transition-colors font-medium">
            View All Orders
          </button>
        </motion.div>

      </div>
    </div>
  );
}
