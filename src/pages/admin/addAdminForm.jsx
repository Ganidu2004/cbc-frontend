import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import uploadMediaToSupabase from "../../utils/mediaUpload";
import { motion } from "framer-motion";
import { FiArrowRight, FiUploadCloud, FiArrowLeft, FiUser, FiMail, FiLock } from "react-icons/fi";

export default function AddAdminForm() {
  const navigate = useNavigate();

  const [fName, setFname] = useState("");
  const [lName, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [comPassword, setComPassword] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  async function handleCreateAdmin(e) {
    e.preventDefault();

    if (password !== comPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "";
      if (file) {
        imageUrl = await uploadMediaToSupabase(file);
      } else {
        toast.error("Please select a profile picture");
        setIsSubmitting(false);
        return;
      }

      const newUser = {
        firstName: fName,
        lastName: lName,
        email: email,
        password: password,
        type: "admin",
        profilePic: imageUrl
      };

      const token = localStorage.getItem("token");

      const response = await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/register", newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.message === "user created") {
        toast.success("Admin account created successfully!");
        navigate("/admin/dashboard");
      } else {
        toast.error(response.data.message || "Failed to create admin");
      }
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to create admin account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const InputField = ({ label, icon: Icon, type, value, onChange, placeholder, id }) => (
    <div className="relative group">
      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-1 block group-hover:text-primary-dark transition-colors">
        {label}
      </label>
      <div className={`relative flex items-center border-b ${focusedField === id ? 'border-primary-dark' : 'border-gray-200'} transition-colors duration-300 pb-2`}>
        <Icon className={`absolute left-0 transition-colors duration-300 ${focusedField === id ? 'text-primary-dark' : 'text-gray-400'}`} size={16} />
        <input 
          type={type} required
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField("")}
          className="w-full pl-8 bg-transparent focus:outline-none text-sm text-primary-dark placeholder-gray-300" 
          placeholder={placeholder}
          value={value} 
          onChange={onChange} 
        />
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-full pb-10 text-primary-dark flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <Link to="/admin/dashboard" className="text-gray-400 hover:text-primary-dark flex items-center gap-2 text-sm mb-4 transition-colors w-fit group">
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-serif mb-1">Staff Access</h1>
          <p className="text-gray-500 text-sm font-light">Onboard a new administrator to the management system.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden max-w-5xl flex-1"
      >
        {/* Left Branding Side */}
        <div className="hidden md:flex w-2/5 bg-primary-dark relative items-center justify-center p-12 text-white overflow-hidden">
          {/* Abstract background image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 to-transparent"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-8 backdrop-blur-sm border border-accent/30">
                <FiUser className="text-accent" size={20} />
              </div>
              <h2 className="font-serif text-4xl mb-4 leading-tight">Elevate Your<br/>Management.</h2>
              <p className="font-light text-white/70 text-sm leading-relaxed max-w-xs">
                Grant secure administrative access to trusted team members. Streamline your operations by delegating inventory and order management.
              </p>
            </div>
            
            <div className="mt-12">
              <p className="text-xs uppercase tracking-widest text-white/50 font-medium mb-3">Current Staff</p>
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary-dark bg-gray-200 bg-[url('https://i.pravatar.cc/100?img=1')] bg-cover"></div>
                <div className="w-10 h-10 rounded-full border-2 border-primary-dark bg-gray-300 bg-[url('https://i.pravatar.cc/100?img=5')] bg-cover"></div>
                <div className="w-10 h-10 rounded-full border-2 border-primary-dark bg-accent flex items-center justify-center text-xs font-bold text-white shadow-lg">+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-3/5 p-8 lg:p-12 bg-white">
          <form onSubmit={handleCreateAdmin} className="h-full flex flex-col">
            <h3 className="font-serif text-2xl mb-8">Admin Details</h3>
            
            <div className="space-y-8 flex-1">
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex-1">
                  <InputField label="First Name" id="fname" icon={FiUser} type="text" placeholder="e.g. Jane" value={fName} onChange={(e) => setFname(e.target.value)} />
                </div>
                <div className="flex-1">
                  <InputField label="Last Name" id="lname" icon={FiUser} type="text" placeholder="e.g. Doe" value={lName} onChange={(e) => setLname(e.target.value)} />
                </div>
              </div>

              <InputField label="Email Address" id="email" icon={FiMail} type="email" placeholder="admin@auracosmetics.com" value={email} onChange={(e) => setEmail(e.target.value)} />

              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex-1">
                  <InputField label="Password" id="password" icon={FiLock} type="password" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="flex-1">
                  <InputField label="Confirm Password" id="comPassword" icon={FiLock} type="password" placeholder="Confirm password" value={comPassword} onChange={(e) => setComPassword(e.target.value)} />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-3 block">Profile Avatar</label>
                <div className="relative group overflow-hidden w-full h-32 bg-gray-50/50 border border-gray-200 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary-dark transition-all duration-300">
                  <input 
                    type="file" required
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className={`p-3 rounded-full ${file ? 'bg-green-50 text-green-500' : 'bg-white text-gray-400 group-hover:text-primary-dark shadow-sm'} transition-colors`}>
                    <FiUploadCloud size={20} />
                  </div>
                  <span className={`text-xs font-medium ${file ? 'text-green-600' : 'text-gray-500 group-hover:text-primary-dark'}`}>
                    {file ? file.name : "Drop image or browse files"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-10 mt-auto">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-primary-dark text-white px-10 py-4 uppercase tracking-[0.15em] text-xs font-bold hover:bg-black transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 group shadow-lg shadow-primary-dark/20 rounded-md"
              >
                {isSubmitting ? 'Provisioning Account...' : 'Create Admin Account'} 
                {!isSubmitting && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
