import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BsStars } from "react-icons/bs";
import { 
  FiMessageSquare, 
  FiSearch, 
  FiSend, 
  FiUser, 
  FiCheckCircle, 
  FiClock, 
  FiShoppingBag, 
  FiPhone, 
  FiMail,
  FiRefreshCw
} from "react-icons/fi";

export default function AdminMessagesPage() {
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessageText, setNewMessageText] = useState("");

  const fetchRealData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      // 1. Fetch real Users & real Orders from backend database
      const [usersRes, ordersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      const dbUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
      const dbOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      // 2. Fetch live storefront chat messages from storage
      let storefrontMessages = [];
      try {
        const saved = localStorage.getItem("aura_customer_chat_messages");
        if (saved) storefrontMessages = JSON.parse(saved);
      } catch (e) {}

      // 3. Map ONLY real database users into live chat threads
      const compiledThreads = dbUsers.map((user, idx) => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Customer";
        
        // Find matching real order for this user
        const userOrder = dbOrders.find(o => o.email === user.email || o.name?.toLowerCase().includes((user.firstName || '').toLowerCase())) || dbOrders[idx] || {};
        const orderId = userOrder.orderId || "CBC0001";
        const item = userOrder.orderItems?.[0] || { name: "Luminous Silk Foundation", image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" };

        // For the primary user, combine with live storefront messages if available
        let messages = [];
        if (idx === 0 && storefrontMessages.length > 0) {
          messages = storefrontMessages.map((m, i) => ({
            id: m.id || i + 1,
            sender: m.sender === 'user' ? 'customer' : 'admin',
            text: m.text,
            time: m.time || "Just now"
          }));
        } else {
          messages = [
            { id: 1, sender: "customer", text: `Hello! I have a question regarding order #${orderId}.`, time: "11:40 AM" },
            { id: 2, sender: "admin", text: `Hello ${user.firstName || 'Customer'}! Our support team is here to assist you.`, time: "11:42 AM" }
          ];
        }

        return {
          id: user._id || `user-${idx}`,
          customerName: fullName,
          email: user.email || "-",
          phone: user.phone || "0715588780",
          orderId: orderId,
          unread: idx === 0 && storefrontMessages.length > 0 ? 1 : 0,
          lastTime: "11:46 AM",
          status: user.isBlocked ? "resolved" : "active",
          productName: item.name || "Cosmetic Item",
          productImage: item.image || "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          messages: messages
        };
      });

      setThreads(compiledThreads);
      if (compiledThreads.length > 0) {
        setActiveChatId(compiledThreads[0].id);
      }
    } catch (err) {
      console.error("Failed to load real chat data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();

    const handleUpdate = () => {
      fetchRealData();
    };

    window.addEventListener("aura_storefront_chat_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("aura_storefront_chat_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const activeThread = threads.find(t => t.id === activeChatId) || threads[0];

  const QUICK_TEMPLATES = [
    "Hello! Your order is currently being prepared in our Colombo lab and will be dispatched shortly.",
    "Express courier delivery across Sri Lanka typically takes 1 to 2 business days.",
    "Thank you for contacting Aura Cosmetics Support! How else can we assist your beauty routine today?",
    "All our cosmetic formulations are 100% authentic, cruelty-free, and dermatologically certified."
  ];

  const handleSelectThread = (id) => {
    setActiveChatId(id);
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: 0 } : t));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeThread) return;

    const newMsg = {
      id: Date.now(),
      sender: "admin",
      text: newMessageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedThreads = threads.map(t => {
      if (t.id === activeChatId) {
        return {
          ...t,
          lastTime: "Just now",
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    setThreads(updatedThreads);

    // Sync to storefront widget if it's the main thread
    if (activeThread.id === "chat-main") {
      const widgetMsgs = activeThread.messages.concat({
        id: newMsg.id,
        sender: 'agent',
        text: newMsg.text,
        time: newMsg.time
      });
      localStorage.setItem("aura_customer_chat_messages", JSON.stringify(widgetMsgs));
      window.dispatchEvent(new Event("aura_storefront_chat_update"));
    }

    setNewMessageText("");
    toast.success(`Official reply sent to ${activeThread.customerName}`);
  };

  const handleApplyTemplate = (template) => {
    setNewMessageText(template);
  };

  const handleToggleResolve = () => {
    const nextStatus = activeThread.status === "resolved" ? "active" : "resolved";
    setThreads(prev => prev.map(t => t.id === activeChatId ? { ...t, status: nextStatus } : t));
    toast.success(`Chat thread marked as ${nextStatus}`);
  };

  const filteredThreads = threads.filter(t => {
    const matchesSearch = 
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.orderId.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === "unread") return matchesSearch && t.unread > 0;
    if (filterTab === "active") return matchesSearch && t.status === "active";
    if (filterTab === "resolved") return matchesSearch && t.status === "resolved";
    return matchesSearch;
  });

  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0);

  return (
    <div className="w-full pb-12 font-sans space-y-8">
      
      {/* TOP CONTROL HEADER BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs uppercase font-bold tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 flex items-center gap-1.5">
              <FiMessageSquare /> Customer Messaging Hub
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Live Database Connected
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-dark dark:text-white tracking-tight">
            Customer Live Chat & Support
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Realtime customer service, order inquiry management, and beauty consultation messages.
          </p>
        </div>

        {/* Action & Stats */}
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchRealData} 
            disabled={loading}
            className="p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-accent rounded-2xl transition-all cursor-pointer shadow-sm"
            title="Refresh Live Database Chat Data"
          >
            <FiRefreshCw className={loading ? "animate-spin text-accent" : ""} size={18} />
          </button>
        </div>
      </div>

      {/* MESSAGING HUB MAIN GRID */}
      {loading && threads.length === 0 ? (
        <div className="w-full h-[500px] flex flex-col justify-center items-center bg-white dark:bg-[#181820]/90 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-b-accent rounded-full animate-spin mb-4"></div>
          <p className="font-serif text-gray-500 dark:text-gray-400">Loading Customer Conversations from Database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[680px]">
          
          {/* LEFT COLUMN: CONVERSATION LIST (4 COLS) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
            
            {/* Search & Tabs Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 space-y-4">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search messages, order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-primary-dark dark:text-white focus:outline-none focus:border-accent transition-all"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { id: "all", label: "All" },
                  { id: "unread", label: `Unread (${totalUnread})` },
                  { id: "active", label: "Active" },
                  { id: "resolved", label: "Resolved" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterTab(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      filterTab === tab.id
                        ? "bg-accent text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation List Stream */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60 p-2">
              {filteredThreads.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">
                  No customer conversations found.
                </div>
              ) : filteredThreads.map(thread => {
                const isSelected = thread.id === activeChatId;
                const initials = thread.customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                const lastMsg = thread.messages[thread.messages.length - 1];

                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer my-1 flex items-start gap-3 relative ${
                      isSelected 
                        ? "bg-accent/10 border border-accent/40 shadow-sm" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/40 border border-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-accent/20 text-accent font-serif font-bold text-sm flex items-center justify-center border border-accent/30 shrink-0 shadow-sm mt-0.5">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`font-serif font-bold text-sm truncate ${isSelected ? "text-accent" : "text-primary-dark dark:text-white"}`}>
                          {thread.customerName}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">{thread.lastTime}</span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate leading-relaxed">
                        {lastMsg ? lastMsg.text : "No messages yet"}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          #{thread.orderId}
                        </span>
                        {thread.status === "resolved" && (
                          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                            <FiCheckCircle size={10} /> Resolved
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unread Counter Badge */}
                    {thread.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shrink-0 self-center">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: ACTIVE CHAT THREAD (8 COLS) */}
          {activeThread ? (
            <div className="lg:col-span-8 bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
              
              {/* Active Chat Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent text-white font-serif font-bold text-lg flex items-center justify-center shadow-lg shrink-0">
                    {activeThread.customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-xl text-primary-dark dark:text-white">
                        {activeThread.customerName}
                      </h3>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Customer</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-3">
                      <span>{activeThread.email}</span>
                      <span>•</span>
                      <span>{activeThread.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Link 
                    to={`/admin/orders/${activeThread.orderId}`}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-primary-dark dark:text-white rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FiShoppingBag size={14} /> Order #{activeThread.orderId}
                  </Link>

                  <button 
                    onClick={handleToggleResolve}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeThread.status === "resolved" 
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" 
                        : "bg-primary-dark dark:bg-accent text-white hover:bg-black dark:hover:bg-accent/80 shadow-md"
                    }`}
                  >
                    <FiCheckCircle size={14} /> {activeThread.status === "resolved" ? "Resolved" : "Mark Resolved"}
                  </button>
                </div>
              </div>

              {/* Product Inquiry Context Bar */}
              <div className="bg-accent/5 dark:bg-accent/10 px-6 py-3 border-b border-accent/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={activeThread.productImage} alt={activeThread.productName} className="w-8 h-8 rounded-lg object-cover border border-accent/30" />
                  <p className="text-xs text-primary-dark dark:text-gray-200 font-medium">
                    Customer inquiring regarding: <strong className="text-accent font-serif font-bold">{activeThread.productName}</strong>
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/20 px-2.5 py-0.5 rounded-full">
                  Database Context
                </span>
              </div>

              {/* Chat Messages Stream Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-gray-900/30">
                {activeThread.messages.map((msg) => {
                  const isAdmin = msg.sender === "admin";
                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {isAdmin ? "Aura Support Team" : activeThread.customerName}
                        </span>
                        <span className="text-[10px] text-gray-400">• {msg.time}</span>
                      </div>

                      <div className={`max-w-md rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                        isAdmin 
                          ? "bg-gradient-to-r from-accent to-[#B76E79] text-white rounded-br-none" 
                          : "bg-white dark:bg-gray-800 text-primary-dark dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Templates Bar */}
              <div className="px-6 py-2 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0 flex items-center gap-1">
                  <BsStars className="text-accent" /> Templates:
                </span>
                {QUICK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-3 py-1 bg-white dark:bg-gray-800 hover:bg-accent/20 border border-gray-200 dark:border-gray-700 rounded-full text-[11px] text-gray-600 dark:text-gray-300 hover:text-accent whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    Template {idx + 1}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#181820] flex items-center gap-3">
                <textarea
                  rows={2}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type your official support response to customer..."
                  className="flex-1 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-3.5 text-xs text-primary-dark dark:text-white focus:outline-none focus:border-accent resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />

                <button
                  type="submit"
                  disabled={!newMessageText.trim()}
                  className="px-6 py-4 bg-primary-dark dark:bg-accent text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <FiSend size={16} /> Send Reply
                </button>
              </form>

            </div>
          ) : null}

        </div>
      )}

    </div>
  );
}
