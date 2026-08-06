/**
 * Cart Utility Functions
 * Synchronously manages cart state in localStorage and dispatches window events for real-time UI updates.
 */

export function loadCart() {
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading cart from localStorage", e);
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event("aura_cart_updated"));
  } catch (e) {
    console.error("Error saving cart to localStorage", e);
  }
}

export function addToCart(productId, qty = 1) {
  const targetId = typeof productId === 'object' ? (productId.productId || productId._id || productId.id) : productId;
  const targetQty = typeof productId === 'object' ? (productId.qty || 1) : qty;

  if (!targetId) return;

  const currentCart = loadCart();
  const existingIndex = currentCart.findIndex((item) => item.productId === targetId);

  if (existingIndex > -1) {
    const newQty = (currentCart[existingIndex].qty || 1) + targetQty;
    if (newQty <= 0) {
      currentCart.splice(existingIndex, 1);
    } else {
      currentCart[existingIndex].qty = newQty;
    }
  } else {
    if (targetQty > 0) {
      currentCart.push({ productId: targetId, qty: targetQty });
    }
  }

  saveCart(currentCart);
}

export function clearCart() {
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event("aura_cart_updated"));
}

export function deleteItem(productId) {
  const targetId = typeof productId === 'object' ? (productId.productId || productId._id || productId.id) : productId;
  if (!targetId) return;

  const currentCart = loadCart();
  const updatedCart = currentCart.filter((item) => item.productId !== targetId);
  saveCart(updatedCart);
}