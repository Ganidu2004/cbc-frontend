import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiUser, FiLogOut, FiSun, FiMoon, FiHeart, FiZap } from "react-icons/fi";
import { motion } from "framer-motion";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { loadWishlist } from "../../utils/wishlistFunction";
import RoutineBuilderModal from "../extras/RoutineBuilderModal";
import WishlistDrawer from "../extras/WishlistDrawer";

export default function Header(){
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { darkMode, toggleDarkMode } = useTheme();

    const [userProfile, setUserProfile] = useState(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isRoutineOpen, setIsRoutineOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        
        if (token) {
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => setUserProfile(res.data))
            .catch(() => setUserProfile(null));
        }

        const updateWishlistCount = () => {
            const list = loadWishlist();
            setWishlistCount(list.length);
        };

        updateWishlistCount();
        window.addEventListener("aura_wishlist_updated", updateWishlistCount);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener("aura_wishlist_updated", updateWishlistCount);
        };
    }, [token]);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return(
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'} px-6 md:px-12 flex items-center justify-between`}>
                
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.png" className="w-12 h-12 md:w-16 md:h-16 rounded-full cursor-pointer transition-all duration-300"/>
                    <span className="font-serif font-semibold text-xl tracking-wide text-primary-dark dark:text-white hidden md:block">Aura Cosmetics</span>
                </Link>

                <div className="hidden md:flex gap-1 lg:gap-2 items-center bg-gray-100/80 dark:bg-[#14141f]/80 p-1.5 rounded-full border border-gray-200/80 dark:border-gray-800/80 backdrop-blur-xl shadow-inner">
                    {[
                        { path: "/", label: "Home" },
                        { path: "/product", label: "Shop", extraPaths: ["/productInfo"] },
                        { path: "/about", label: "About" },
                        { path: "/contact", label: "Contact" },
                        ...(token ? [
                            { path: "/track-order", label: "Track Order", extraPaths: ["/track-timeline", "/invoice"] },
                            { path: "/cart", label: "Cart" }
                        ] : [])
                    ].map(item => {
                        const isActive = item.path === "/" 
                            ? location.pathname === "/" 
                            : location.pathname.startsWith(item.path) || item.extraPaths?.some(ep => location.pathname.startsWith(ep));
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 rounded-full flex items-center gap-1.5 select-none ${
                                    isActive
                                        ? "text-white"
                                        : "text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeHeaderPill"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        className="absolute inset-0 bg-gradient-to-r from-accent via-rose-500 to-accent rounded-full shadow-md shadow-accent/25 border border-white/20 z-0"
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center gap-3 md:gap-5">
                    {/* Wishlist Button */}
                    <button
                        onClick={() => setIsWishlistOpen(true)}
                        title="View Wishlist"
                        className="relative w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer"
                    >
                        <FiHeart size={18} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                                {wishlistCount}
                            </span>
                        )}
                    </button>

                    {/* Theme Toggle Button */}
                    <button 
                        onClick={toggleDarkMode}
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label="Toggle Theme"
                        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-amber-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer"
                    >
                        {darkMode ? (
                            <FiSun size={18} className="transition-transform duration-500 rotate-0 hover:rotate-90 text-amber-300" />
                        ) : (
                            <FiMoon size={18} className="transition-transform duration-500 rotate-0 hover:-rotate-45 text-gray-700" />
                        )}
                    </button>

                    <div className="flex items-center gap-3 border-l md:border-transparent lg:border-gray-300 dark:lg:border-gray-700 md:pl-0 lg:pl-6">
                        {!token ? (
                            <>
                                <Link 
                                  to="/login" 
                                  className="text-primary-dark dark:text-gray-200 font-medium text-sm uppercase tracking-widest hover:text-accent transition-colors">
                                    Sign In
                                </Link>

                                <Link 
                                  to="/singin" 
                                  className="bg-primary-dark dark:bg-accent text-white font-medium text-xs uppercase tracking-widest px-5 py-2 hover:bg-black dark:hover:bg-accent/80 transition-colors">
                                    Register
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link 
                                    to="/profile" 
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-primary-dark dark:text-white rounded-full hover:bg-primary-dark dark:hover:bg-accent hover:text-white transition-colors overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
                                >
                                    {userProfile?.profilePic ? (
                                        <img src={userProfile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <FiUser size={16} />
                                    )}
                                </Link>
                                <button 
                                    onClick={handleSignOut}
                                    title="Sign Out"
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
                                >
                                    <FiLogOut size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </header>

            {/* Modals & Drawers */}
            <RoutineBuilderModal isOpen={isRoutineOpen} onClose={() => setIsRoutineOpen(false)} />
            <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
        </>
    )
}
