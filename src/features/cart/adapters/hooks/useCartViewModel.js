import { useState, useEffect, useCallback } from 'react';
import { defaultCartRepository } from '../repositories/LocalStorageCartRepository';
import { AddToCartUseCase } from '../../usecases/AddToCartUseCase';
import { GetCartUseCase, RemoveFromCartUseCase, ClearCartUseCase } from '../../usecases/CartUseCases';

export function useCartViewModel(cartRepository = defaultCartRepository) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Instantiating Use Cases with injected repository dependency
  const getCartUseCase = new GetCartUseCase(cartRepository);
  const addToCartUseCase = new AddToCartUseCase(cartRepository);
  const removeFromCartUseCase = new RemoveFromCartUseCase(cartRepository);
  const clearCartUseCase = new ClearCartUseCase(cartRepository);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    const items = await getCartUseCase.execute();
    setCart(items);
    setLoading(false);
  }, [cartRepository]);

  useEffect(() => {
    refreshCart();

    // Listen to storage events for cross-tab synchronisation
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        refreshCart();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshCart]);

  const addToCart = async (productDetails, qty = 1) => {
    const payload = typeof productDetails === 'object'
      ? { ...productDetails, qty }
      : { productId: productDetails, qty };
    const updated = await addToCartUseCase.execute(payload);
    setCart(updated);
  };

  const removeItem = async (productId) => {
    const updated = await removeFromCartUseCase.execute(productId);
    setCart(updated);
  };

  const clearCart = async () => {
    const updated = await clearCartUseCase.execute();
    setCart(updated);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const totalItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return {
    cart,
    loading,
    cartTotal,
    totalItemCount,
    addToCart,
    removeItem,
    clearCart,
    refreshCart,
  };
}
