import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { BsGraphUp } from "react-icons/bs";
import { FaBoxOpen, FaUsers, FaUserPlus } from "react-icons/fa";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FiLogOut, FiFileText, FiSun, FiMoon, FiHome, FiMessageSquare } from "react-icons/fi";
import AdminProduct from "./admin/adminProductsPage";
import AddProductForm from "./admin/addProductForm";
import EditProductForm from "./admin/editProductForm";
import AdminDashboard from "./admin/adminDashboard";
import AdminOrdersPage from "./admin/adminOrdersPage";
import AdminOrderDetailsPage from "./admin/adminOrderDetailsPage";
import AddAdminForm from "./admin/addAdminForm";
import AdminCustomersPage from "./admin/adminCustomersPage";
import AdminReportsPage from "./admin/adminReportsPage";
import AdminMessagesPage from "./admin/adminMessagesPage";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function AdminHomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname.includes(path);
    return `flex items-center gap-4 px-5 py-3.5 mx-3 my-1 rounded-2xl transition-all duration-300 ${
      isActive 
        ? "bg-accent text-white shadow-lg shadow-accent/20 font-bold scale-[1.02]" 
        : "text-gray-400 hover:bg-white/10 hover:text-white font-medium"
    }`;
  };

  return (
    <div className="w-full h-screen flex bg-gray-50 dark:bg-[#121212] overflow-hidden font-sans">
      
      {/* Luxury Dark Sidebar */}
      <div className="w-[280px] h-full bg-[#161620] dark:bg-[#181820] flex flex-col justify-between shadow-2xl relative z-20 border-r border-gray-800">
        <div>
          {/* Admin Logo / Header */}
          <div className="p-6 border-b border-gray-800 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg font-serif text-xl font-bold shrink-0">
              A
            </div>
            <div>
              <h2 className="text-white font-serif text-lg font-bold tracking-wider">AURA <span className="font-light italic text-accent">Admin</span></h2>
              <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block">Boutique Control Hub</span>
            </div>
          </div>

          {/* Navigation with Category Sections */}
          <nav className="flex flex-col w-full space-y-4 px-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            
            {/* SECTION 1: STORE MANAGEMENT */}
            <div>
              <span className="px-5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">
                Store Management
              </span>
              <div className="space-y-0.5">
                <Link className={getLinkClass("/admin/dashboard")} to="/admin/dashboard">
                  <BsGraphUp size={18} /> <span className="text-xs uppercase tracking-widest">Dashboard</span>
                </Link>

                <Link className={getLinkClass("/admin/orders")} to="/admin/orders">
                  <MdOutlineShoppingCart size={18} /> <span className="text-xs uppercase tracking-widest">Orders</span>
                </Link>

                <Link className={getLinkClass("/admin/products")} to="/admin/products">
                  <FaBoxOpen size={18} /> <span className="text-xs uppercase tracking-widest">Products</span>
                </Link>

                <Link className={getLinkClass("/admin/reports")} to="/admin/reports">
                  <FiFileText size={18} /> <span className="text-xs uppercase tracking-widest">Reports</span>
                </Link>
              </div>
            </div>

            {/* SECTION 2: DEDICATED CUSTOMER COMMUNICATIONS HUB */}
            <div>
              <div className="flex items-center justify-between px-5 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                  Customer Support Hub
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>

              <div className="bg-accent/5 p-1 rounded-2xl border border-accent/20 space-y-0.5">
                <Link className={getLinkClass("/admin/customers")} to="/admin/customers">
                  <FaUsers size={18} /> <span className="text-xs uppercase tracking-widest">Customers</span>
                </Link>

                <Link className={getLinkClass("/admin/messages")} to="/admin/messages">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <FiMessageSquare size={18} /> <span className="text-xs uppercase tracking-widest">Customer Chat</span>
                    </div>
                    <span className="text-[9px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      LIVE
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* SECTION 3: SYSTEM ADMINISTRATION */}
            <div>
              <span className="px-5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">
                System Admin
              </span>
              <Link className={getLinkClass("/admin/addAdmin")} to="/admin/addAdmin">
                <FaUserPlus size={18} /> <span className="text-xs uppercase tracking-widest">Add Admin</span>
              </Link>
            </div>

          </nav>
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-800 flex flex-col gap-2">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white transition-colors w-full text-left rounded-xl hover:bg-white/5 cursor-pointer text-xs font-semibold uppercase tracking-wider"
          >
            <FiHome size={18} /> Customer Storefront
          </Link>

          <button 
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white transition-colors w-full text-left rounded-xl hover:bg-white/5 cursor-pointer text-xs font-semibold uppercase tracking-wider"
          >
            {darkMode ? <FiSun size={18} className="text-amber-300" /> : <FiMoon size={18} />} 
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:text-rose-300 transition-colors w-full text-left rounded-xl hover:bg-rose-500/10 cursor-pointer text-xs font-semibold uppercase tracking-wider"
          >
            <FiLogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto bg-gray-50 dark:bg-[#121212] relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
        
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/reports" element={<AdminReportsPage />} />
              <Route path="/products" element={<AdminProduct />} />
              <Route path="/products/addProduct" element={<AddProductForm />} />
              <Route path="/products/editeProduct" element={<EditProductForm />} />
              <Route path="/orders" element={<AdminOrdersPage />} />
              <Route path="/orders/:orderId" element={<AdminOrderDetailsPage />} />
              <Route path="/customers" element={<AdminCustomersPage />} />
              <Route path="/messages" element={<AdminMessagesPage />} />
              <Route path="/addAdmin" element={<AddAdminForm />} />
              <Route path="/*" element={<AdminDashboard />} />
            </Routes>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
