/**
 * Wishlist Utility Functions
 * Synchronously manages wishlist state in localStorage and dispatches window events for real-time UI updates.
 */

export function loadWishlist() {
  try {
    const raw = localStorage.getItem('aura_wishlist');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading wishlist from localStorage", e);
    return [];
  }
}

export function saveWishlist(wishlist) {
  try {
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event("aura_wishlist_updated"));
  } catch (e) {
    console.error("Error saving wishlist to localStorage", e);
  }
}

export function toggleWishlist(product) {
  if (!product) return false;
  const prodId = typeof product === 'object' ? (product.productId || product._id || product.id) : product;
  if (!prodId) return false;

  const current = loadWishlist();
  const existingIdx = current.findIndex(item => (typeof item === 'object' ? (item.productId || item._id || item.id) : item) === prodId);

  let isAdded = false;
  if (existingIdx > -1) {
    current.splice(existingIdx, 1);
  } else {
    // Save full object if provided, else just store string ID
    current.push(typeof product === 'object' ? product : { productId: prodId });
    isAdded = true;
  }

  saveWishlist(current);
  return isAdded;
}

export function isInWishlist(productId) {
  if (!productId) return false;
  const prodId = typeof productId === 'object' ? (productId.productId || productId._id || productId.id) : productId;
  const current = loadWishlist();
  return current.some(item => (typeof item === 'object' ? (item.productId || item._id || item.id) : item) === prodId);
}

export function removeFromWishlist(productId) {
  if (!productId) return;
  const prodId = typeof productId === 'object' ? (productId.productId || productId._id || productId.id) : productId;
  const current = loadWishlist();
  const updated = current.filter(item => (typeof item === 'object' ? (item.productId || item._id || item.id) : item) !== prodId);
  saveWishlist(updated);
}
