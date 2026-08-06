import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { 
  FiGlobe, 
  FiSearch, 
  FiSend, 
  FiUser, 
  FiCheckCircle, 
  FiClock, 
  FiRefreshCw,
  FiShoppingBag,
  FiMessageSquare,
  FiActivity
} from "react-icons/fi";
import { BsStars } from "react-icons/bs";

export default function AdminStorefrontChatsPage() {
  const [chats, setChats] = useState([]);
  const [activeVisitorId, setActiveVisitorId] = useState("visitor-1");
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Load storefront chats from localStorage or fallback
  const loadChats = () => {
    const saved = localStorage.getItem("aura_storefront_chats_v1");
    if (saved) {
      try {
        setChats(JSON.parse(saved));
        return;
      } catch (e) {}
    }

    // Default initial mock storefront chats
    const initialChats = [
      {
        visitorId: "visitor-1",
        customerName: "Ganidu Chalinda",
        email: "ganiduchalinda@gmail.com",
        location: "Matara, Sri Lanka",
        pageUrl: "/cart",
        unread: 1,
        lastTime: "Just now",
        status: "active",
        messages: [
          { id: 1, sender: "agent", text: "Welcome to Aura Beauty Concierge! How can our boutique support team assist your beauty routine today?", time: "12:15 PM" },
          { id: 2, sender: "user", text: "Hi! I am currently checking out my cart for Order #CBC0006. Is express courier delivery available to Matara?", time: "12:20 PM" }
        ]
      },
      {
        visitorId: "visitor-2",
        customerName: "Website Visitor #1094",
        email: "guest.visitor@aurabeauty.lk",
        location: "Colombo, Sri Lanka",
        pageUrl: "/products",
        unread: 0,
        lastTime: "11:45 AM",
        status: "replied",
        messages: [
          { id: 1, sender: "agent", text: "Welcome to Aura Beauty Concierge! How can our boutique support team assist your beauty routine today?", time: "11:30 AM" },
          { id: 2, sender: "user", text: "Hello! Is the Luminous Silk Foundation shade 4 currently in stock?", time: "11:35 AM" },
          { id: 3, sender: "agent", text: "Hi there! Yes, shade 4 is in stock and available for instant dispatch.", time: "11:45 AM" }
        ]
      },
      {
        visitorId: "visitor-3",
        customerName: "Nipuni Perera",
        email: "nipuni@example.com",
        location: "Kandy, Sri Lanka",
        pageUrl: "/product/hydrating-rose-serum",
        unread: 0,
        lastTime: "10:30 AM",
        status: "replied",
        messages: [
          { id: 1, sender: "agent", text: "Welcome to Aura Beauty Concierge! How can our boutique support team assist your beauty routine today?", time: "10:10 AM" },
          { id: 2, sender: "user", text: "Does the Hydrating Rose Serum work for dry skin?", time: "10:20 AM" },
          { id: 3, sender: "agent", text: "Yes! It contains hyaluronic acid and organic damask rose extract.", time: "10:30 AM" }
        ]
      }
    ];

    setChats(initialChats);
    localStorage.setItem("aura_storefront_chats_v1", JSON.stringify(initialChats));
  };

  useEffect(() => {
    loadChats();

    // Listen for custom window event when storefront customer sends a message
    const handleUpdate = () => {
      loadChats();
    };

    window.addEventListener("aura_storefront_chat_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("aura_storefront_chat_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const saveChats = (newChats) => {
    setChats(newChats);
    localStorage.setItem("aura_storefront_chats_v1", JSON.stringify(newChats));
    window.dispatchEvent(new Event("aura_storefront_chat_update"));
  };

  const activeChat = chats.find(c => c.visitorId === activeVisitorId) || chats[0];

  const handleSelectVisitor = (visitorId) => {
    setActiveVisitorId(visitorId);
    // Clear unread flag
    const updated = chats.map(c => c.visitorId === visitorId ? { ...c, unread: 0 } : c);
    saveChats(updated);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChat) return;

    const newReply = {
      id: Date.now(),
      sender: "agent",
      text: replyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = chats.map(c => {
      if (c.visitorId === activeVisitorId) {
        return {
          ...c,
          status: "replied",
          lastTime: "Just now",
          messages: [...c.messages, newReply]
        };
      }
      return c;
    });

    saveChats(updatedChats);

    // Also sync to customer storefront widget localStorage
    const customerMsgs = activeChat.messages.concat(newReply);
    localStorage.setItem("aura_customer_chat_messages", JSON.stringify(customerMsgs));

    setReplyText("");
    toast.success(`Reply sent to ${activeChat.customerName} on Storefront Widget!`);
  };

  const filteredChats = chats.filter(c => {
    return c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="w-full pb-12 font-sans space-y-8">
      
      {/* TOP CONTROL HEADER BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-[#181820]/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs uppercase font-bold tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 flex items-center gap-1.5">
              <FiGlobe /> Storefront Live Messages
            </span>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Realtime Sync Active
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-dark dark:text-white tracking-tight">
            Storefront Floating Chat Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and respond live to customer messages sent from the website floating widget.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={loadChats}
            className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:text-accent rounded-2xl transition-all cursor-pointer shadow-sm"
            title="Refresh Live Storefront Chats"
          >
            <FiRefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* MAIN MESSAGING WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
        
        {/* LEFT COLUMN: LIVE STOREFRONT VISITORS LIST (4 COLS) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
          
          {/* Search Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Search visitor name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-primary-dark dark:text-white focus:outline-none focus:border-accent transition-all"
              />
            </div>
          </div>

          {/* Visitor List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60 p-2">
            {filteredChats.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">
                No active storefront chats found.
              </div>
            ) : filteredChats.map(chat => {
              const isSelected = chat.visitorId === activeVisitorId;
              const initials = chat.customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "WV";
              const lastMsg = chat.messages[chat.messages.length - 1];

              return (
                <div
                  key={chat.visitorId}
                  onClick={() => handleSelectVisitor(chat.visitorId)}
                  className={`p-4 rounded-2xl transition-all cursor-pointer my-1 flex items-start gap-3 relative ${
                    isSelected 
                      ? "bg-accent/10 border border-accent/40 shadow-sm" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/40 border border-transparent"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-accent/20 text-accent font-serif font-bold text-sm flex items-center justify-center border border-accent/30 shrink-0 shadow-sm mt-0.5">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`font-serif font-bold text-sm truncate ${isSelected ? "text-accent" : "text-primary-dark dark:text-white"}`}>
                        {chat.customerName}
                      </h4>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">{chat.lastTime}</span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate leading-relaxed">
                      {lastMsg ? lastMsg.text : "No messages"}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {chat.location}
                      </span>
                    </div>
                  </div>

                  {chat.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shrink-0 self-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: STOREFRONT CHAT CONSOLE (8 COLS) */}
        {activeChat ? (
          <div className="lg:col-span-8 bg-white dark:bg-[#181820]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent text-white font-serif font-bold text-lg flex items-center justify-center shadow-lg shrink-0">
                  {activeChat.customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-xl text-primary-dark dark:text-white">
                      {activeChat.customerName}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Storefront Widget Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {activeChat.email} &bull; Page: <code className="text-accent">{activeChat.pageUrl}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/30 dark:bg-gray-900/30">
              {activeChat.messages.map(msg => {
                const isAdmin = msg.sender === 'agent';
                return (
                  <div key={msg.id} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      {isAdmin ? "Aura Boutique Support (You)" : activeChat.customerName} • {msg.time}
                    </span>
                    <div className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isAdmin 
                        ? "bg-accent text-white rounded-br-none" 
                        : "bg-white dark:bg-gray-800 text-primary-dark dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#181820] flex items-center gap-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Type official response to ${activeChat.customerName}...`}
                className="flex-1 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full px-5 py-3 text-xs text-primary-dark dark:text-white focus:outline-none focus:border-accent"
              />

              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-6 py-3 bg-primary-dark dark:bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <FiSend size={14} /> Send Storefront Reply
              </button>
            </form>

          </div>
        ) : null}

      </div>

    </div>
  );
}
