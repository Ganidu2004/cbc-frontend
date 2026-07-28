import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FiSearch, FiDownload, FiUser, FiCheckCircle, FiXCircle, FiTrash2, FiLock, FiUnlock } from "react-icons/fi";
import { motion } from "framer-motion";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios.get(import.meta.env.VITE_BACKEND_URL + "/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      if (Array.isArray(res.data)) {
        setCustomers(res.data);
      } else {
        toast.error("Failed to load customers");
      }
    }).catch((err) => {
      console.error("Failed to load customers:", err);
      toast.error("Failed to load customers");
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleBlockUser = async (email, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/${email}/block`, 
        { isBlocked: !currentStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully`);
      setCustomers(customers.map(c => c.email === email ? { ...c, isBlocked: !currentStatus } : c));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/${email}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User deleted successfully");
      setCustomers(customers.filter(c => c.email !== email));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const name = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
      const matchesSearch = 
        name.includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase());
        
      let matchesStatus = true;
      if (statusFilter === "Active") matchesStatus = !customer.isBlocked;
      if (statusFilter === "Blocked") matchesStatus = customer.isBlocked;
      
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const exportToCSV = () => {
    const headers = "Name,Email,Status\n";
    const rows = filteredCustomers.map(c => {
      return `"${c.firstName || ''} ${c.lastName || ''}","${c.email}",${c.isBlocked ? 'Blocked' : 'Active'}`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toLocaleDateString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  return (
    <div className="w-full min-h-full pb-10 text-primary-dark">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-1">Customers Database</h1>
          <p className="text-gray-500 text-sm font-light">View and manage customer accounts.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-dark focus:ring-1 focus:ring-primary-dark transition-all"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-dark cursor-pointer text-gray-600 font-medium"
            >
              <option value="All">All Customers</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <button onClick={exportToCSV} className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-colors shadow-sm" title="Export to CSV">
            <FiDownload size={16} />
          </button>
        </div>
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
                  <th className="px-8 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Email Address</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-8 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVars} initial="hidden" animate="show"
              >
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <p className="text-gray-500 font-medium mb-1">No customers found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                ) : filteredCustomers.map((customer, index) => {
                  return (
                    <motion.tr
                      variants={itemVars}
                      key={customer._id || index}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          {customer.profilePic ? (
                            <img src={customer.profilePic} alt={customer.firstName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center font-bold font-serif text-lg">
                              {customer.firstName ? customer.firstName[0].toUpperCase() : <FiUser />}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          customer.isBlocked 
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}>
                          {customer.isBlocked ? <FiXCircle size={12}/> : <FiCheckCircle size={12}/>}
                          {customer.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => handleBlockUser(customer.email, customer.isBlocked)}
                            className={`p-2 rounded-full transition-colors flex items-center justify-center
                              ${customer.isBlocked ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}
                            title={customer.isBlocked ? "Unblock User" : "Block User"}
                          >
                            {customer.isBlocked ? <FiUnlock size={16} /> : <FiLock size={16} />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(customer.email)}
                            className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
                            title="Delete User"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium tracking-wide">
              Showing {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
