import { Routes, Route, Link } from "react-router-dom";
import { BsGraphUp } from "react-icons/bs";
import { FaBoxOpen, FaUsers } from "react-icons/fa";
import { MdOutlineShoppingCart } from "react-icons/md";
import AdminProduct from "./admin/adminProductsPage";
import AddProductForm from "./admin/addProductForm";

export default function AdminHomePage() {
  return (
    <div className=" w-full h-screen flex">
      {/* Sidebar */}
      <div className="w-[20%] h-full bg-blue-700 flex flex-col items-start p-6 space-y-6 text-white">
        <Link
          className="flex items-center gap-3 hover:bg-blue-600 px-3 py-2 rounded-lg w-full"
          to="/admin/dashboard"
        >
          <BsGraphUp className="text-xl" />
          Dashboard
        </Link>

        <Link
          className="flex items-center gap-3 hover:bg-blue-600 px-3 py-2 rounded-lg w-full"
          to="/admin/orders"
        >
          <MdOutlineShoppingCart className="text-xl" />
          Orders
        </Link>

        <Link
          className="flex items-center gap-3 hover:bg-blue-600 px-3 py-2 rounded-lg w-full"
          to="/admin/products"
        >
          <FaBoxOpen className="text-xl" />
          Products
        </Link>

        <Link
          className="flex items-center gap-3 hover:bg-blue-600 px-3 py-2 rounded-lg w-full"
          to="/admin/customers"
        >
          <FaUsers className="text-xl" />
          Customers
        </Link>
      </div>

      {/* Main Content */}
      <div className="w-[80%] h-screen bg-gray-100 p-6">
        <Routes path="/*">
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          <Route path="/products" element={<AdminProduct/>} />
          <Route path="/products/addProduct" element={<AddProductForm/>} />
          <Route path="/orders" element={<h1>Orders</h1>} />
          <Route path="/customers" element={<h1>Customers</h1>} />
          <Route path="/*" element={<h1>404 - Admin page not found</h1>} />
        </Routes>
      </div>
    </div>
  );
}
