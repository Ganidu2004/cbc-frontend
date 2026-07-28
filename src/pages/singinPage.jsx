import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import uploadMediaToSupabase from "../utils/mediaUpload";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiUploadCloud, FiCheckCircle, FiXCircle, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

// --- Validation helpers ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "One number", test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignupPage() {
  const navigate = useNavigate();

  // Multi-step State
  const [step, setStep] = useState(1);

  // Form State
  const [fName, setFname] = useState("");
  const [lName, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);

  // UX State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validation error state
  const [touched, setTouched] = useState({ fName: false, lName: false, email: false, password: false, confirmPassword: false });
  const [emailError, setEmailError] = useState("");
  const [pwdErrors, setPwdErrors] = useState([]);
  const [showPwdChecklist, setShowPwdChecklist] = useState(false);

  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);

  // Preferences State
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [preferences, setPreferences] = useState([]);

  const PREFERENCE_OPTIONS = ["Skincare", "Makeup", "Fragrance", "Haircare", "Oily Skin", "Dry Skin"];
  const DISTRICTS = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

  // --- Derived validation ---
  const pwdRuleResults = PWD_RULES.map((r) => ({ ...r, passed: r.test(password) }));
  const passedCount = pwdRuleResults.filter((r) => r.passed).length;

  // Sync password strength (0-4 scale)
  useEffect(() => {
    setPasswordStrength(passedCount);
  }, [passedCount]);

  // Validate email on change
  useEffect(() => {
    if (!touched.email) return;
    if (!email) {
      setEmailError("Email is required.");
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address (e.g. jane@example.com).");
    } else {
      setEmailError("");
    }
  }, [email, touched.email]);

  // OTP Timer
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  const handleBlur = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      // Force-touch all fields to show errors
      setTouched({ fName: true, lName: true, email: true, password: true });

      // Client-side guard: email
      if (!EMAIL_REGEX.test(email)) {
        setEmailError("Please enter a valid email address.");
        return;
      }
      // Client-side guard: password strength
      if (passedCount < 4) {
        setShowPwdChecklist(true);
        toast.error("Please create a stronger password.");
        return;
      }
      // Client-side guard: confirm password
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      setStep(2);
      setCountdown(60);
    } else if (step === 2) {
      if (otp.join("").length !== 6) {
        toast.error("Please enter the 6-digit code.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      submitFinalRegistration();
    }
  };

  const submitFinalRegistration = async () => {
    setIsSubmitting(true);
    try {
      let imageUrl = "";
      if (file) {
        imageUrl = await uploadMediaToSupabase(file);
      }

      const newUser = {
        firstName: fName,
        lastName: lName,
        email: email,
        password: password,
        type: "customer",
        profilePic: imageUrl,
      };

      await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/register", newUser);
      toast.success("Account created successfully!");
      setStep(5);
    } catch (err) {
      // Surface the server's specific error message if available
      const serverMsg = err.response?.data?.message;
      toast.error(serverMsg || "Failed to create account. Please try again.");
      // If it's an email conflict, send user back to step 1
      if (err.response?.status === 409) {
        setStep(1);
        setEmailError(serverMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const togglePreference = (pref) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter(p => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-primary relative">

      {/* Gamified Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-primary-dark"
          initial={{ width: "20%" }}
          animate={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 bg-primary relative overflow-y-auto">

        <Link to="/" className="absolute top-8 left-8 text-sm uppercase tracking-widest text-gray-500 hover:text-primary-dark transition-colors font-medium z-10">
          ← Back
        </Link>

        <div className="w-full max-w-md mt-12 mb-12">

          <AnimatePresence mode="wait">

            {/* STEP 1: REGISTRATION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="font-serif text-3xl text-primary-dark mb-2">Join the Shop</h1>
                  <p className="text-gray-500 font-light text-sm">Create an account to unlock exclusive rewards and personalized routines.</p>
                </div>

                <div className="flex gap-4 mb-6">
                  <button type="button" className="flex-1 bg-white border border-gray-200 text-primary-dark py-3 rounded-xl flex justify-center items-center gap-2 hover:border-gray-400 transition-colors shadow-sm text-sm font-medium">
                    <FcGoogle className="text-lg" /> Google
                  </button>
                  <button type="button" className="flex-1 bg-white border border-gray-200 text-primary-dark py-3 rounded-xl flex justify-center items-center gap-2 hover:border-gray-400 transition-colors shadow-sm text-sm font-medium">
                    <FaApple className="text-lg" /> Apple
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">Or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <form onSubmit={handleNextStep} className="space-y-5">
                  <div className="flex gap-4">
                    <div className="space-y-1 flex-1">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">First Name</label>
                      <input
                        type="text" required
                        className={`w-full bg-transparent border-b py-2 text-primary-dark focus:outline-none transition-colors ${touched.fName && !fName ? 'border-red-400' : 'border-gray-300 focus:border-primary-dark'}`}
                        placeholder="Jane"
                        value={fName}
                        onChange={(e) => setFname(e.target.value)}
                        onBlur={() => handleBlur('fName')}
                      />
                      {touched.fName && !fName && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><FiAlertCircle size={11} /> First name is required.</p>
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Last Name</label>
                      <input
                        type="text" required
                        className={`w-full bg-transparent border-b py-2 text-primary-dark focus:outline-none transition-colors ${touched.lName && !lName ? 'border-red-400' : 'border-gray-300 focus:border-primary-dark'}`}
                        placeholder="Doe"
                        value={lName}
                        onChange={(e) => setLname(e.target.value)}
                        onBlur={() => handleBlur('lName')}
                      />
                      {touched.lName && !lName && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><FiAlertCircle size={11} /> Last name is required.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Email Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        className={`w-full bg-transparent border-b py-2 text-primary-dark focus:outline-none transition-colors pr-8 ${emailError ? 'border-red-400' : (email && !emailError ? 'border-green-400' : 'border-gray-300 focus:border-primary-dark')}`}
                        placeholder="jane@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur('email')}
                      />
                      {touched.email && (
                        email && !emailError
                          ? <FiCheckCircle className="absolute right-0 top-2.5 text-green-500" size={16} />
                          : emailError ? <FiAlertCircle className="absolute right-0 top-2.5 text-red-400" size={16} /> : null
                      )}
                    </div>
                    {emailError && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><FiAlertCircle size={11} /> {emailError}</p>
                    )}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"} required
                        className={`w-full bg-transparent border-b py-2 text-primary-dark focus:outline-none transition-colors pr-10 ${touched.password && passedCount < 4 ? 'border-red-400' : (passedCount === 4 ? 'border-green-400' : 'border-gray-300 focus:border-primary-dark')}`}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setShowPwdChecklist(true)}
                        onBlur={() => handleBlur('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${password.length === 0 ? 'bg-gray-200'
                            : passwordStrength >= level
                              ? (passwordStrength < 2 ? 'bg-red-400' : passwordStrength < 4 ? 'bg-amber-400' : 'bg-green-500')
                              : 'bg-gray-200'
                          }`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium tracking-wide">
                      {password.length === 0 ? '' : passwordStrength < 2 ? '⚠ Weak' : passwordStrength < 4 ? '⚡ Getting stronger' : '✓ Strong password'}
                    </p>

                    {/* Live password requirements checklist */}
                    <AnimatePresence>
                      {showPwdChecklist && password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
                        >
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Password Requirements</p>
                          <div className="space-y-1.5">
                            {pwdRuleResults.map((rule) => (
                              <div key={rule.id} className={`flex items-center gap-2 text-xs font-medium transition-colors ${rule.passed ? 'text-green-600' : 'text-gray-400'}`}>
                                {rule.passed
                                  ? <FiCheckCircle size={13} className="shrink-0" />
                                  : <FiXCircle size={13} className="shrink-0 text-gray-300" />}
                                {rule.label}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1 relative">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className={`w-full bg-transparent border-b py-2 text-primary-dark focus:outline-none transition-colors pr-10 ${
                          touched.confirmPassword && confirmPassword && password !== confirmPassword
                            ? 'border-red-400'
                            : touched.confirmPassword && confirmPassword && password === confirmPassword
                            ? 'border-green-400'
                            : 'border-gray-300 focus:border-primary-dark'
                        }`}
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                      {touched.confirmPassword && confirmPassword && (
                        password === confirmPassword
                          ? <FiCheckCircle className="absolute right-8 top-2.5 text-green-500" size={15} />
                          : <FiAlertCircle className="absolute right-8 top-2.5 text-red-400" size={15} />
                      )}
                    </div>
                    {touched.confirmPassword && confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <FiAlertCircle size={11} /> Passwords do not match.
                      </p>
                    )}
                    {touched.confirmPassword && confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <FiCheckCircle size={11} /> Passwords match!
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2 block">Profile Picture (Optional)</label>
                    <div className="relative overflow-hidden">
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-full bg-gray-50 border border-gray-200 border-dashed text-primary-dark text-sm rounded-xl px-4 py-3 outline-none flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                        <FiUploadCloud /> {file ? 'Image Selected' : 'Upload Avatar'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input type="checkbox" required className="accent-primary-dark cursor-pointer w-4 h-4 mt-0.5" />
                      <span className="text-gray-500 text-xs leading-relaxed group-hover:text-primary-dark transition-colors">I agree to the Terms of Service and Privacy Policy.</span>
                    </label>
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input type="checkbox" className="accent-primary-dark cursor-pointer w-4 h-4 mt-0.5" />
                      <span className="text-gray-500 text-xs leading-relaxed group-hover:text-primary-dark transition-colors">Send me exclusive offers, beauty tips, and rewards updates.</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-dark text-white py-4 rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black transition-colors flex justify-center items-center gap-2 group mt-8 shadow-md"
                  >
                    Continue <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-8">
                  Already have an account? <Link to="/login" className="text-primary-dark font-semibold hover:underline">Sign In</Link>
                </p>
              </motion.div>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                  <FiCheckCircle className="text-3xl text-green-500" />
                </div>
                <h2 className="font-serif text-3xl text-primary-dark mb-2">Verify Your Email</h2>
                <p className="text-gray-500 font-light text-sm mb-8">We've sent a 6-digit code to <br /><span className="font-medium text-primary-dark">{email}</span></p>

                <form onSubmit={handleNextStep}>
                  <div className="flex justify-center gap-3 mb-8">
                    {otp.map((data, index) => (
                      <input
                        className="w-12 h-14 text-center text-xl font-medium border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-primary-dark focus:ring-1 focus:ring-primary-dark transition-all"
                        type="text"
                        name="otp"
                        maxLength="1"
                        key={index}
                        value={data}
                        onChange={e => handleOtpChange(e.target, index)}
                        onFocus={e => e.target.select()}
                        required
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-dark text-white py-4 rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black transition-colors shadow-md mb-6"
                  >
                    Verify & Continue
                  </button>

                  <p className="text-gray-500 text-sm">
                    Didn't receive the code?{" "}
                    {countdown > 0 ? (
                      <span className="text-gray-400">Resend in {countdown}s</span>
                    ) : (
                      <button type="button" className="text-primary-dark font-medium hover:underline" onClick={() => setCountdown(60)}>Resend Code</button>
                    )}
                  </p>

                  <button type="button" onClick={() => setStep(1)} className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 mt-8 font-medium">
                    ← Change Email
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: SHIPPING SETUP */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Profile 60% Complete</span>
                  <h2 className="font-serif text-3xl text-primary-dark mb-2">Where to?</h2>
                  <p className="text-gray-500 font-light text-sm">Set up your default delivery address now for a faster checkout later. (You can skip this).</p>
                </div>

                <form onSubmit={handleNextStep} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Street Address</label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-gray-300 py-3 text-primary-dark focus:outline-none focus:border-primary-dark transition-colors"
                      placeholder="E.g. 123 Luxury Avenue"
                      value={address} onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2 block">District / Region</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 text-primary-dark text-sm rounded-xl px-4 py-3 outline-none cursor-pointer focus:border-primary-dark transition-colors shadow-sm"
                    >
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setStep(4)} className="flex-1 border border-gray-200 bg-white text-gray-500 py-4 rounded-xl uppercase tracking-widest text-xs font-medium hover:bg-gray-50 transition-colors">
                      Skip for now
                    </button>
                    <button type="submit" className="flex-[2] bg-primary-dark text-white py-4 rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black transition-colors shadow-md">
                      Save Address
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SHOPPING PREFERENCES */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Profile 80% Complete</span>
                  <h2 className="font-serif text-3xl text-primary-dark mb-2">Personalize Your Feed</h2>
                  <p className="text-gray-500 font-light text-sm">Select the categories you're most interested in so we can recommend the perfect products for you.</p>
                </div>

                <div className="flex flex-wrap gap-3 mb-10">
                  {PREFERENCE_OPTIONS.map(pref => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => togglePreference(pref)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${preferences.includes(pref) ? 'bg-primary-dark text-white shadow-md scale-105' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="w-full bg-primary-dark text-white py-4 rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black transition-colors flex justify-center items-center gap-2 shadow-md disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
                </button>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>

      {/* Right Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Luxury Skincare"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* STEP 5: WELCOME MODAL OVERLAY */}
      <AnimatePresence>
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-primary-dark p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <h3 className="font-serif text-3xl text-white relative z-10">Welcome to Aura, {fName}!</h3>
                <p className="text-white/80 mt-2 relative z-10">Your account is ready.</p>
              </div>
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-6">As a special welcome gift, enjoy 10% off your first purchase.</p>
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center mb-8">
                  <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Coupon Code</span>
                  <span className="text-2xl font-serif text-primary-dark tracking-wider">WELCOME10</span>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-primary-dark text-white py-4 rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black transition-colors"
                >
                  Go to My Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
