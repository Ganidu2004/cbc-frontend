import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { BsGraphUp } from "react-icons/bs";
import { FaBoxOpen, FaUsers } from "react-icons/fa";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FiLogOut, FiFileText } from "react-icons/fi";
import AdminProduct from "./admin/adminProductsPage";
import AddProductForm from "./admin/addProductForm";
import EditProductForm from "./admin/editProductForm";
import AdminDashboard from "./admin/adminDashboard";
import AdminOrdersPage from "./admin/adminOrdersPage";
import AdminOrderDetailsPage from "./admin/adminOrderDetailsPage";
import AddAdminForm from "./admin/addAdminForm";
import AdminCustomersPage from "./admin/adminCustomersPage";
import AdminReportsPage from "./admin/adminReportsPage";
import { motion } from "framer-motion";

export default function AdminHomePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname.includes(path);
    return `flex items-center gap-4 px-6 py-4 transition-all duration-300 border-l-4 ${
      isActive 
        ? "bg-white/10 border-accent text-white" 
        : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white hover:border-gray-500"
    }`;
  };

  return (
    <div className="w-full h-screen flex bg-gray-50 overflow-hidden font-sans">
      
      {/* Luxury Sidebar */}
      <div className="w-[280px] h-full bg-primary-dark flex flex-col justify-between shadow-2xl relative z-20">
        <div>
          {/* Admin Logo / Header */}
          <div className="p-8 border-b border-white/10 mb-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
              <span className="font-serif text-xl">A</span>
            </div>
            <h2 className="text-white font-serif text-xl tracking-wider">AURA <span className="font-light italic text-accent">Admin</span></h2>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 w-full">
            <Link className={getLinkClass("/admin/dashboard")} to="/admin/dashboard">
              <BsGraphUp size={20} /> <span className="text-sm uppercase tracking-widest font-medium">Dashboard</span>
            </Link>

            <Link className={getLinkClass("/admin/orders")} to="/admin/orders">
              <MdOutlineShoppingCart size={20} /> <span className="text-sm uppercase tracking-widest font-medium">Orders</span>
            </Link>

            <Link className={getLinkClass("/admin/products")} to="/admin/products">
              <FaBoxOpen size={20} /> <span className="text-sm uppercase tracking-widest font-medium">Products</span>
            </Link>

            <Link className={getLinkClass("/admin/reports")} to="/admin/reports">
              <FiFileText size={20} /> <span className="text-sm uppercase tracking-widest font-medium">Reports</span>
            </Link>

            <Link className={getLinkClass("/admin/customers")} to="/admin/customers">
              <FaUsers size={20} /> <span className="text-sm uppercase tracking-widest font-medium">Customers</span>
            </Link>

            <Link className={getLinkClass("/admin/addAdmin")} to="/admin/addAdmin">
              <FaUsers size={20} /> <span className="text-sm uppercase tracking-widest font-medium">Add Admin</span>
            </Link>
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-4 px-2 py-2 text-gray-400 hover:text-accent transition-colors w-full text-left"
          >
            <FiLogOut size={20} /> <span className="text-sm uppercase tracking-widest font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto bg-gray-50/50 relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/40 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="p-10 max-w-7xl mx-auto min-h-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Routes>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/reports" element={<AdminReportsPage />} />
              <Route path="/products" element={<AdminProduct />} />
              <Route path="/products/addProduct" element={<AddProductForm />} />
              <Route path="/products/editeProduct" element={<EditProductForm />} />
              <Route path="/orders" element={<AdminOrdersPage />} />
              <Route path="/orders/:orderId" element={<AdminOrderDetailsPage />} />
              <Route path="/addAdmin" element={<AddAdminForm />} />
              <Route path="/customers" element={<AdminCustomersPage />} />
              <Route path="/*" element={<AdminDashboard />} />
            </Routes>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
