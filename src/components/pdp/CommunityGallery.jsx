import React, { useState, useMemo, useEffect } from 'react';
import { FiStar, FiFilter, FiEdit3, FiCheckCircle, FiLock } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function CommunityGallery({ productId }) {
  const [filter, setFilter] = useState('All Skin Types');
  const [reviewsList, setReviewsList] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check auth status and fetch user profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setCurrentUserProfile(res.data))
      .catch(err => console.error("Failed to fetch user profile", err));
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Fetch reviews for this product from the backend
  useEffect(() => {
    if (!productId) return;
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/reviews/${productId}`)
      .then(res => setReviewsList(res.data))
      .catch(err => console.error("Failed to fetch reviews", err));
  }, [productId]);

  const averageRating = useMemo(() => {
    if (reviewsList.length === 0) return 0;
    const total = reviewsList.reduce((acc, curr) => acc + curr.rating, 0);
    return (total / reviewsList.length).toFixed(1);
  }, [reviewsList]);

  const filteredReviews = useMemo(() => {
    if (filter === 'All Skin Types') return reviewsList;
    return reviewsList.filter(r => r.skinType === filter);
  }, [reviewsList, filter]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewText.trim() === "") {
        toast.error("Please write a review before submitting.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        toast.error("Please sign in to write a review.");
        navigate("/login");
        return;
    }

    const userName = currentUserProfile
      ? `${currentUserProfile.firstName} ${currentUserProfile.lastName}`
      : "Anonymous";
    const userImage = currentUserProfile?.profilePic
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=e2e8f0&color=1a1a2e&bold=true`;

    const payload = {
      productId,
      userName,
      userImage,
      isVerified: true,
      skinType: filter !== "All Skin Types" ? filter : "Not Specified",
      rating: reviewRating,
      text: reviewText,
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewsList([res.data.review, ...reviewsList]);
      toast.success("Thank you! Your review has been submitted.");
      setShowReviewForm(false);
      setReviewText("");
      setReviewRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-20 px-4 md:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h3 className="font-serif text-3xl md:text-4xl text-primary-dark mb-4">Real Results</h3>
            <div className="flex items-center gap-2">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    fill={i < Math.round(averageRating) ? "currentColor" : "none"} 
                    color={i < Math.round(averageRating) ? "currentColor" : "#cbd5e1"}
                    size={18} 
                  />
                ))}
              </div>
              <span className="text-gray-600 font-medium">{averageRating} / 5 based on {reviewsList.length} reviews</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FiFilter /> Filter By:
            </span>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-white border border-gray-200 text-primary-dark text-sm rounded px-3 py-2 outline-none cursor-pointer focus:border-accent"
            >
              <option>All Skin Types</option>
              <option>Dry</option>
              <option>Oily</option>
              <option>Combination</option>
            </select>

            {/* Only show "Write Review" button for authenticated users */}
            {isLoggedIn ? (
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="ml-4 bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
              >
                <FiEdit3 /> Write Review
              </button>
            ) : (
              <Link 
                to="/login"
                className="ml-4 flex items-center gap-2 border border-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium hover:border-primary-dark hover:text-primary-dark transition-colors"
                title="Sign in to write a review"
              >
                <FiLock size={14} /> Sign In to Review
              </Link>
            )}
          </div>
        </div>

        {/* Review Form — only visible when logged in and button toggled */}
        {isLoggedIn && showReviewForm && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-5">
              {currentUserProfile?.profilePic ? (
                <img src={currentUserProfile.profilePic} alt="You" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-dark text-white flex items-center justify-center text-sm font-bold">
                  {currentUserProfile ? currentUserProfile.firstName?.[0] : "?"}
                </div>
              )}
              <div>
                <h4 className="font-serif text-xl text-primary-dark">Write your review</h4>
                <p className="text-xs text-gray-400">
                  Posting as <span className="font-medium text-gray-600">{currentUserProfile ? `${currentUserProfile.firstName} ${currentUserProfile.lastName}` : ""}</span>
                  <FiCheckCircle className="inline text-blue-500 ml-1 mb-0.5" size={12} />
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar 
                      key={star} 
                      size={28}
                      fill={star <= reviewRating ? "#d97706" : "none"}
                      color={star <= reviewRating ? "#d97706" : "#cbd5e1"}
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-125"
                    />
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea 
                  rows="4" 
                  className="w-full border border-gray-200 rounded-md p-3 outline-none focus:border-accent text-sm"
                  placeholder="Share your thoughts about this product..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-500 hover:text-primary-dark text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary-dark text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredReviews.map(review => (
            <div key={review._id || review.id} className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={review.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName || "U")}&background=e2e8f0&color=1a1a2e`} 
                    alt={review.userName} 
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                  <div>
                    <h5 className="font-medium text-primary-dark flex items-center gap-1.5">
                      {review.userName}
                      {review.isVerified && <FiCheckCircle className="text-blue-500" size={14} title="Verified Buyer" />}
                    </h5>
                    {review.skinType && review.skinType !== "Not Specified" && (
                      <p className="text-xs text-gray-500">{review.skinType} skin</p>
                    )}
                  </div>
                </div>
                <div className="flex text-accent text-sm">
                  {[...Array(review.rating)].map((_, i) => <FiStar key={i} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">"{review.text}"</p>
            </div>
          ))}
          {filteredReviews.length === 0 && (
            <div className="col-span-1 md:col-span-3 text-center py-12 text-gray-500">
              {reviewsList.length === 0 
                ? "No reviews yet. Be the first to share your experience!"
                : "No reviews match this filter."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
