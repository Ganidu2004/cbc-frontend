import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiUser, FiLogOut, FiSun, FiMoon, FiHeart, FiZap, FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { loadWishlist } from "../../utils/wishlistFunction";
import RoutineBuilderModal from "../extras/RoutineBuilderModal";
import WishlistDrawer from "../extras/WishlistDrawer";

export default function Header(){
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { darkMode, toggleDarkMode } = useTheme();

    const [isRoutineOpen, setIsRoutineOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [userProfile, setUserProfile] = useState(null);

    // Update Wishlist Count
    const updateWishlist = () => {
        const items = loadWishlist();
        setWishlistCount(items.length);
    };

    useEffect(() => {
        updateWishlist();
        window.addEventListener("aura_wishlist_updated", updateWishlist);
        window.addEventListener("storage", updateWishlist);
        return () => {
            window.removeEventListener("aura_wishlist_updated", updateWishlist);
            window.removeEventListener("storage", updateWishlist);
        };
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Fetch user profile if logged in
    useEffect(() => {
        if (token) {
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => setUserProfile(res.data))
            .catch(err => console.error("Error fetching header user profile", err));
        }
    }, [token]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const navItems = [
        { path: "/", label: "Home" },
        { path: "/product", label: "Shop", extraPaths: ["/productInfo"] },
        { path: "/about", label: "About" },
        { path: "/contact", label: "Contact" },
        ...(token ? [
            { path: "/track-order", label: "Track Order", extraPaths: ["/track-timeline", "/invoice"] },
            { path: "/cart", label: "Cart" }
        ] : [])
    ];

    return(
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'} px-4 md:px-12 flex items-center justify-between`}>
                
                <Link to="/" className="flex items-center gap-2 z-50">
                    <img src="/logo.png" className="w-10 h-10 md:w-16 md:h-16 rounded-full cursor-pointer transition-all duration-300"/>
                    <span className="font-serif font-semibold text-lg md:text-xl tracking-wide text-primary-dark dark:text-white">Aura Cosmetics</span>
                </Link>

                {/* Desktop Navigation Menu */}
                <div className="hidden md:flex gap-1 lg:gap-2 items-center bg-gray-100/80 dark:bg-[#14141f]/80 p-1.5 rounded-full border border-gray-200/80 dark:border-gray-800/80 backdrop-blur-xl shadow-inner">
                    {navItems.map(item => {
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

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2.5 md:gap-5">
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

                    {/* User Auth Buttons (Desktop) */}
                    <div className="hidden md:flex items-center gap-3 border-l lg:border-gray-300 dark:lg:border-gray-700 lg:pl-6">
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
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors cursor-pointer"
                                >
                                    <FiLogOut size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Toggle Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Mobile Menu"
                        className="md:hidden z-50 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white flex items-center justify-center cursor-pointer shadow-sm"
                    >
                        {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                    </button>
                </div>

            </header>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] bg-white dark:bg-[#121218] pt-24 px-6 pb-12 flex flex-col justify-between overflow-y-auto md:hidden"
                    >
                        <div className="flex flex-col gap-3">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Navigation</p>
                            {navItems.map(item => {
                                const isActive = item.path === "/" 
                                    ? location.pathname === "/" 
                                    : location.pathname.startsWith(item.path) || item.extraPaths?.some(ep => location.pathname.startsWith(ep));

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center justify-between py-3.5 px-4 rounded-2xl text-sm uppercase tracking-widest font-bold transition-all ${
                                            isActive
                                                ? "bg-accent/15 text-accent border border-accent/30 shadow-sm"
                                                : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {isActive && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile User Actions / Profile */}
                        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
                            {!token ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="py-3.5 text-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-bold uppercase tracking-widest"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/singin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="py-3.5 text-center rounded-xl bg-accent text-white text-xs font-bold uppercase tracking-widest shadow-md shadow-accent/20"
                                    >
                                        Register
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-100 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                                    <Link
                                        to="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3.5 flex-1"
                                    >
                                        <div className="w-11 h-11 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold overflow-hidden shrink-0 border border-accent/30">
                                            {userProfile?.profilePic ? (
                                                <img src={userProfile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <FiUser size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                                {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}` : "My Account"}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View Profile & Orders</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            handleSignOut();
                                        }}
                                        className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer shrink-0 ml-2"
                                        title="Sign Out"
                                    >
                                        <FiLogOut size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals & Drawers */}
            <RoutineBuilderModal isOpen={isRoutineOpen} onClose={() => setIsRoutineOpen(false)} />
            <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
        </>
    )
}
