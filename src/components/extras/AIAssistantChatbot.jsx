import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiUser, FiCamera, FiCheckCircle, FiClock, FiShoppingBag } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';
import toast from 'react-hot-toast';

export default function AIAssistantChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'ai'
  const [step, setStep] = useState(0);

  // Live Chat Messages State
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("aura_customer_chat_messages");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, sender: 'agent', text: "Welcome to Aura Beauty Concierge! How can our boutique support team assist your beauty routine today?", time: "Just now" }
    ];
  });

  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("aura_customer_chat_messages", JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsgText = inputMessage.trim();
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage("");

    // Simulate instant automated acknowledgment / support dispatch
    setTimeout(() => {
      let replyText = "Thank you for reaching out! A live Aura Beauty Consultant has received your message and will respond shortly.";
      if (userMsgText.toLowerCase().includes("order") || userMsgText.toLowerCase().includes("cbc")) {
        replyText = "We have received your order inquiry. Our fulfillment team is preparing your express dispatch.";
      }
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const renderAIQuiz = () => {
    switch (step) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                  <BsStars size={14} />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none text-xs text-gray-700 dark:text-gray-200">
                  Hi there! I'm Aura, your AI Skincare Routine Advisor. Ready to discover your personalized regimen?
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <button onClick={() => setStep(1)} className="w-full bg-primary-dark text-white text-xs py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-colors">
                Start Skincare Quiz
              </button>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full justify-between">
            <div className="space-y-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none text-xs text-gray-700 dark:text-gray-200">
                What is your primary skin concern?
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {['Dryness & Dehydration', 'Acne / Blemishes', 'Anti-Aging & Elasticity', 'Dullness & Hyperpigmentation'].map(concern => (
                <button key={concern} onClick={() => setStep(2)} className="w-full border border-gray-200 dark:border-gray-700 p-3 text-xs text-left text-gray-700 dark:text-gray-200 hover:border-accent hover:text-accent transition-colors rounded-xl font-medium">
                  {concern}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none text-xs text-gray-700 dark:text-gray-200 mb-3">
              Based on your selection, here is your customized 2-step routine:
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="flex items-center gap-3 border border-gray-100 dark:border-gray-800 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&w=100&q=80" className="w-10 h-10 object-cover rounded-lg" />
                <div>
                  <div className="text-[10px] text-accent font-bold uppercase tracking-wider">Step 1: Hydrate</div>
                  <div className="text-xs font-serif font-bold text-primary-dark dark:text-white">Hydrating Rose Serum</div>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-gray-100 dark:border-gray-800 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&w=100&q=80" className="w-10 h-10 object-cover rounded-lg" />
                <div>
                  <div className="text-[10px] text-accent font-bold uppercase tracking-wider">Step 2: Glow</div>
                  <div className="text-xs font-serif font-bold text-primary-dark dark:text-white">Luminous Silk Foundation</div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                toast.success("Routine added to your wishlist!");
                setStep(0);
              }}
              className="mt-3 w-full bg-accent text-white text-xs py-3 font-bold tracking-widest uppercase hover:bg-opacity-90 transition-all rounded-xl shadow-md"
            >
              Save Custom Routine
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[360px] h-[520px] bg-white dark:bg-[#181820] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            {/* Header */}
            <div className="bg-primary-dark dark:bg-gray-900 p-4 text-white">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-primary-dark" />
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-serif font-bold text-xs">
                      A
                    </div>
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold">Aura Concierge</h4>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      🟢 Online &bull; Replies in 2m
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
                  <FiX size={18} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex bg-black/30 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('live')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all ${
                    activeTab === 'live' ? "bg-accent text-white shadow-sm" : "text-gray-400 hover:text-white"
                  }`}
                >
                  💬 Live Chat
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all ${
                    activeTab === 'ai' ? "bg-accent text-white shadow-sm" : "text-gray-400 hover:text-white"
                  }`}
                >
                  ✨ AI Routine Advisor
                </button>
              </div>
            </div>
            
            {/* Tab Body */}
            <div className="flex-1 p-4 bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden flex flex-col">
              {activeTab === 'live' ? (
                <div className="flex flex-col h-full justify-between">
                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {messages.map(msg => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                            {isUser ? "You" : "Aura Support"} • {msg.time}
                          </span>
                          <div className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                            isUser 
                              ? "bg-accent text-white rounded-br-none shadow-sm" 
                              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ask support or inquire on order..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2.5 text-xs text-primary-dark dark:text-white focus:outline-none focus:border-accent"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="w-9 h-9 bg-accent text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50 hover:bg-opacity-90 shrink-0"
                    >
                      <FiSend size={14} />
                    </button>
                  </form>
                </div>
              ) : (
                renderAIQuiz()
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-opacity-90 transition-all border-2 border-white/20"
        title="Live Customer Chat Support"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={26} />}
      </motion.button>
    </div>
  );
}
