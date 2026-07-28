import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function login(e) {
    e.preventDefault();
    axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/login", {
      email: email,
      password: password
    }).then(
      (res) => {
        if (res.data.user == null) {
          toast.error(res.data.message);
          return;
        }

        toast.success("Welcome back");

        localStorage.setItem("token", res.data.token);

        if (res.data.user.type === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    ).catch(() => {
      toast.error("Failed to login. Please try again.");
    });
  }

  return (
    <div className="w-full min-h-screen flex bg-primary">
      {/* Left Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Luxury Cosmetics" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="font-serif text-4xl mb-4">Unveil Your Radiance.</h2>
          <p className="font-light tracking-wide opacity-90">Discover the perfect harmony of nature and science in our new spring collection.</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-24 bg-primary relative">
        
        {/* Back to home absolute link */}
        <Link to="/" className="absolute top-8 left-8 text-sm uppercase tracking-widest text-gray-500 hover:text-primary-dark transition-colors font-medium">
          ← Back
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl text-primary-dark mb-2">Welcome Back</h1>
            <p className="text-gray-500 font-light">Sign in to access your exclusive offers and rewards.</p>
          </div>

          <form onSubmit={login} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Email Address</label>
              <input 
                type="email"
                required
                className="w-full bg-transparent border-b border-gray-300 py-3 text-primary-dark focus:outline-none focus:border-primary-dark transition-colors" 
                placeholder="Enter your email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-primary-dark focus:outline-none focus:border-primary-dark transition-colors pr-10" 
                  placeholder="Enter your password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="accent-primary-dark cursor-pointer w-4 h-4" />
                <span className="text-gray-600 group-hover:text-primary-dark transition-colors">Remember Me</span>
              </label>
              <a href="#" className="text-gray-500 hover:text-primary-dark underline transition-colors">Forgot Password?</a>
            </div>

            <button 
              type="submit"
              className="w-full bg-primary-dark text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-black transition-colors flex justify-center items-center gap-2 group mt-8"
            >
              Sign In <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">Or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-white border border-gray-200 text-primary-dark py-4 uppercase tracking-widest text-sm font-medium hover:border-gray-400 transition-colors flex justify-center items-center gap-3">
              <FcGoogle className="text-xl" /> Google
            </button>
            <button className="flex-1 bg-white border border-gray-200 text-primary-dark py-4 uppercase tracking-widest text-sm font-medium hover:border-gray-400 transition-colors flex justify-center items-center gap-3">
              <FaApple className="text-xl" /> Apple
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-10">
            Don't have an account?{" "}
            <Link to="/singin" className="text-primary-dark font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
