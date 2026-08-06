import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiUser, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

export default function Header(){
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { darkMode, toggleDarkMode } = useTheme();

    const [userProfile, setUserProfile] = useState(null);

    // On the homepage, we might want it completely transparent at top, but let's stick to a clean glass look everywhere.
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
            .catch(err => console.error("Error fetching user profile for header", err));
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [token]);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return(
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'} px-6 md:px-12 flex items-center justify-between`}>
            
            <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" className="w-12 h-12 md:w-16 md:h-16 rounded-full cursor-pointer transition-all duration-300"/>
                <span className="font-serif font-semibold text-xl tracking-wide text-primary-dark dark:text-white hidden md:block">Aura Cosmetics</span>
            </Link>

            <div className="hidden md:flex gap-8 items-center">
                <Link to="/" className="text-primary-dark dark:text-gray-200 font-medium text-sm uppercase tracking-widest hover:text-accent transition-colors">Home</Link>
                <Link to="/product" className="text-primary-dark dark:text-gray-200 font-medium text-sm uppercase tracking-widest hover:text-accent transition-colors">Shop</Link>
                <Link to="/about" className="text-primary-dark dark:text-gray-200 font-medium text-sm uppercase tracking-widest hover:text-accent transition-colors">About</Link>
                <Link to="/contact" className="text-primary-dark dark:text-gray-200 font-medium text-sm uppercase tracking-widest hover:text-accent transition-colors">Contact</Link>
                {token && (
                    <>
                        <Link to="/track-order" className="text-primary-dark dark:text-gray-200 font-medium text-sm uppercase tracking-widest hover:text-accent transition-colors">Track Order</Link>
                        <Link to="/cart" className="text-primary-dark dark:text-gray-200 font-medium text-sm uppercase tracking-widest hover:text-accent transition-colors">Cart</Link>
                    </>
                )}
            </div>

            <div className="flex items-center gap-4 md:gap-6">
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
    )
}

