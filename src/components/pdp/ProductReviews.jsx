import React, { useState, useEffect } from "react";
import { FiStar, FiCheckCircle, FiThumbsUp, FiFilter, FiUser, FiSend, FiLock, FiAlertCircle, FiShoppingBag, FiMessageSquare, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProductReviews({ productId, productName }) {
  const primaryStorageKey = `aura_product_reviews_${productId || productName || 'default'}`;

  const [selectedSkinFilter, setSelectedSkinFilter] = useState("All");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // User & Purchase Verification State
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userProfile, setUserProfile] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // Form states
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerSkinType, setReviewerSkinType] = useState("Combination");
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Real Reviews state (stored per product in localStorage)
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadReviews = () => {
      try {
        const keysToTry = [
          productId,
          productName,
          'PROD-1',
          'mock-1',
          'default'
        ].filter(Boolean);

        let loaded = [];
        for (const key of keysToTry) {
          const keyString = `aura_product_reviews_${key}`;
          const saved = localStorage.getItem(keyString);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loaded = parsed;
              break;
            }
          }
        }
        setReviews(loaded);
      } catch (e) {
        setReviews([]);
      }
    };

    loadReviews();
    window.addEventListener("aura_reviews_updated", loadReviews);
    window.addEventListener("storage", loadReviews);
    return () => {
      window.removeEventListener("aura_reviews_updated", loadReviews);
      window.removeEventListener("storage", loadReviews);
    };
  }, [productId, productName]);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);

    if (!currentToken) {
      setIsVerifying(false);
      setHasPurchased(false);
      return;
    }

    const checkVerification = async () => {
      try {
        // Fetch User Profile
        const profileRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        setUserProfile(profileRes.data);
        const fullName = `${profileRes.data.firstName || ''} ${profileRes.data.lastName || ''}`.trim() || profileRes.data.name || "Aura Customer";
        setReviewerName(fullName);

        let userOrdersList = [];
        try {
          const ordersRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${currentToken}` }
          });
          if (Array.isArray(ordersRes.data) && ordersRes.data.length > 0) {
            userOrdersList = ordersRes.data;
          }
        } catch (e) {}

        if (userOrdersList.length === 0) {
          try {
            const savedLocal = localStorage.getItem("aura_user_orders");
            if (savedLocal) userOrdersList = JSON.parse(savedLocal);
          } catch (e) {}
        }

        if (userOrdersList.length > 0) {
          const bought = userOrdersList.some(order => {
            const status = String(order.status || '').toLowerCase();
            if (status !== 'completed' && status !== 'delivered') return false;
            const items = order.orderItems || order.items || [];
            return items.some(item => {
              const itemPId = String(item.productId || item._id || item.id || '');
              const itemPName = String(item.name || '').toLowerCase();
              const targetPId = String(productId || '');
              const targetPName = String(productName || '').toLowerCase();

              return (
                (itemPId && targetPId && itemPId === targetPId) ||
                (itemPName && targetPName && itemPName === targetPName) ||
                (itemPName && targetPId && itemPName.includes(targetPId.toLowerCase())) ||
                (targetPName && itemPId && targetPName.includes(itemPId.toLowerCase()))
              );
            });
          });

          setHasPurchased(bought);
        } else {
          setHasPurchased(false);
        }
      } catch (e) {
        console.warn("Purchase verification error:", e.message);
        setHasPurchased(false);
      } finally {
        setIsVerifying(false);
      }
    };

    checkVerification();
  }, [productId]);

  const skinFilterOptions = ["All", "Combination", "Oily", "Dry", "Sensitive"];

  const filteredReviews = selectedSkinFilter === "All" 
    ? reviews 
    : reviews.filter(r => String(r.skinType).toLowerCase() === selectedSkinFilter.toLowerCase());

  // Dynamic Rating Calculations
  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)
    : "0.0";

  const getStarPercentage = (starCount) => {
    if (totalReviewsCount === 0) return 0;
    const count = reviews.filter(r => Math.round(Number(r.rating)) === starCount).length;
    return Math.round((count / totalReviewsCount) * 100);
  };

  const handleHelpfulClick = (reviewId) => {
    const updated = reviews.map(r => r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r);
    setReviews(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch(e) {}
    toast.success("Thank you for your feedback!");
  };

  const handleDeleteReview = (reviewId) => {
    const updated = reviews.filter(r => r.id !== reviewId);
    setReviews(updated);
    try {
      const keysToSave = [primaryStorageKey, `aura_product_reviews_${productId}`, `aura_product_reviews_${productName}`].filter(Boolean);
      keysToSave.forEach(k => localStorage.setItem(k, JSON.stringify(updated)));
      window.dispatchEvent(new Event("aura_reviews_updated"));
    } catch(e) {}
    toast.success("🗑️ Review deleted successfully");
  };

  const handleOpenReviewForm = () => {
    if (!token) {
      toast.error("Please Sign In to leave a review for your purchased items.");
      return;
    }
    if (!hasPurchased) {
      toast.error("Verified Purchase Required: You can only review products you have purchased from Aura Cosmetics.");
      return;
    }
    setShowReviewForm(!showReviewForm);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: reviewerName,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      rating: Number(rating),
      skinType: reviewerSkinType,
      verified: true,
      comment: reviewComment,
      helpfulCount: 0,
      authorToken: token || 'guest'
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      const keysToSave = [primaryStorageKey, `aura_product_reviews_${productId}`, `aura_product_reviews_${productName}`].filter(Boolean);
      keysToSave.forEach(k => localStorage.setItem(k, JSON.stringify(updated)));
      window.dispatchEvent(new Event("aura_reviews_updated"));
    } catch (err) {
      console.error("Error saving review:", err);
    }

    toast.success("✨ Thank you! Your real verified purchase review has been published.");
    setReviewComment("");
    setShowReviewForm(false);
  };

  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4 md:px-12 font-sans border-t border-gray-100 dark:border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-accent block mb-1">Customer Reviews</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-dark dark:text-white flex items-center gap-3">
            Real Customer Reviews ({totalReviewsCount})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real verified customer reviews submitted for this product.
          </p>
        </div>

        <div>
          {!token ? (
            <Link
              to="/login"
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-primary-dark dark:text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              <FiLock size={14} /> Sign In to Review
            </Link>
          ) : !hasPurchased ? (
            <button
              onClick={() => toast.error("Only customers who have purchased this product can leave a verified review.")}
              className="px-6 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              <FiAlertCircle size={14} /> Verified Buyer Required
            </button>
          ) : (
            <button
              onClick={handleOpenReviewForm}
              className="px-6 py-3 bg-primary-dark dark:bg-accent text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <FiCheckCircle size={14} className="text-emerald-400" /> {showReviewForm ? "Close Form" : "Write Verified Review"}
            </button>
          )}
        </div>
      </div>

      {/* VERIFIED PURCHASE LOCK BANNER FOR NON-BUYERS */}
      {token && !hasPurchased && !isVerifying && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <FiCheckCircle size={22} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-amber-600 dark:text-amber-400 text-base">Verified Buyer Policy</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                To guarantee 100% authentic ratings, only customers who have placed an order for this product can publish a review.
              </p>
            </div>
          </div>
          <Link
            to="/product"
            className="px-5 py-2.5 bg-primary-dark dark:bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-accent/80 transition-all shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <FiShoppingBag size={14} /> Shop Products
          </Link>
        </div>
      )}

      {/* Review Form Modal/Drawer */}
      {showReviewForm && hasPurchased && (
        <form onSubmit={handleAddReview} className="bg-gray-50 dark:bg-gray-800/60 p-6 md:p-8 rounded-3xl border border-emerald-500/30 mb-12 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full w-max border border-emerald-500/20">
            <FiCheckCircle size={12} /> Verified Customer Purchase Verified
          </div>

          <h3 className="font-serif text-xl font-bold text-primary-dark dark:text-white">Write Your Product Review</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                placeholder="Your Name"
                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-primary-dark dark:text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">Your Skin Type</label>
              <select
                value={reviewerSkinType}
                onChange={e => setReviewerSkinType(e.target.value)}
                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-primary-dark dark:text-white focus:outline-none focus:border-accent"
              >
                <option value="Combination">Combination Skin</option>
                <option value="Oily">Oily Skin</option>
                <option value="Dry">Dry Skin</option>
                <option value="Sensitive">Sensitive Skin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">Star Rating</label>
            <div className="flex gap-2 text-amber-400">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-lg cursor-pointer transition-transform hover:scale-125"
                >
                  <FiStar className={star <= rating ? "fill-current" : "text-gray-300 dark:text-gray-700"} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">Detailed Review</label>
            <textarea
              rows={3}
              required
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Tell others about texture, finish, and skin benefits..."
              className="w-full p-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-primary-dark dark:text-white focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-accent text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <FiSend /> Publish Verified Review
          </button>
        </form>
      )}

      {/* Ratings Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-gray-50 dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center justify-center space-y-2">
          <span className="font-serif font-bold text-5xl text-primary-dark dark:text-white">{avgRating}</span>
          <div className="flex text-amber-400 text-lg">
            {[1, 2, 3, 4, 5].map(i => (
              <FiStar key={i} className={i <= Math.round(Number(avgRating) || 0) ? "fill-current" : "text-gray-300 dark:text-gray-700"} />
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Based on {totalReviewsCount} Real Customer {totalReviewsCount === 1 ? 'Rating' : 'Ratings'}
          </p>
        </div>

        <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-2 justify-center flex flex-col">
          {[5, 4, 3, 2, 1].map(starNum => {
            const pct = getStarPercentage(starNum);
            return (
              <div key={starNum} className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-12 font-bold flex items-center gap-1">{starNum} <FiStar className="text-amber-400 fill-current" size={12} /></span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right font-medium">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skin Type Filter Buttons */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-widest shrink-0 flex items-center gap-1 mr-2">
            <FiFilter size={14} /> Filter by Skin:
          </span>
          {skinFilterOptions.map(option => (
            <button
              key={option}
              onClick={() => setSelectedSkinFilter(option)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer shrink-0 ${
                selectedSkinFilter === option 
                  ? "bg-primary-dark dark:bg-accent text-white shadow-sm" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <FiMessageSquare size={24} />
          </div>
          <h3 className="font-serif font-bold text-lg text-primary-dark dark:text-white">
            {totalReviewsCount === 0 ? "No Customer Reviews Yet" : `No Reviews for ${selectedSkinFilter} Skin`}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {totalReviewsCount === 0 
              ? "Be the first verified customer to leave a review for this product!" 
              : "Try switching the skin type filter to view all customer feedback."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review.id} className="p-6 rounded-3xl bg-white dark:bg-[#181824] border border-gray-100 dark:border-gray-800 space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent font-bold text-sm flex items-center justify-center">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm text-primary-dark dark:text-white">{review.name}</h4>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <FiCheckCircle size={10} /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">{review.date}</p>
                  </div>
                </div>

                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {review.skinType} Skin
                </span>
              </div>

              <div className="flex text-amber-400 text-xs gap-0.5">
                {[...Array(review.rating)].map((_, i) => <FiStar key={i} className="fill-current" />)}
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                "{review.comment}"
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-50 dark:border-gray-800/60">
                <button
                  onClick={() => handleHelpfulClick(review.id)}
                  className="flex items-center gap-1.5 hover:text-accent transition-colors cursor-pointer"
                >
                  <FiThumbsUp size={12} /> Helpful ({review.helpfulCount || 0})
                </button>

                <div className="flex items-center gap-3">
                  {(token && (review.authorToken === token || review.name?.toLowerCase() === reviewerName?.toLowerCase() || !review.authorToken)) && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="flex items-center gap-1 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer font-semibold text-[11px]"
                      title="Delete your review"
                    >
                      <FiTrash2 size={12} /> Delete Review
                    </button>
                  )}
                  <span>Aura Verified Review</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
