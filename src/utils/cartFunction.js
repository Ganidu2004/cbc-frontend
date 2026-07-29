/**
 * Legacy Cart Utility Facade
 * Refactored to delegate call execution to Clean Architecture Domain Use Cases & Repositories.
 */
import { defaultCartRepository } from '../features/cart/adapters/repositories/LocalStorageCartRepository';
import { AddToCartUseCase } from '../features/cart/usecases/AddToCartUseCase';
import { RemoveFromCartUseCase, ClearCartUseCase } from '../features/cart/usecases/CartUseCases';

const addToCartUseCase = new AddToCartUseCase(defaultCartRepository);
const removeFromCartUseCase = new RemoveFromCartUseCase(defaultCartRepository);
const clearCartUseCase = new ClearCartUseCase(defaultCartRepository);

export function loadCart() {
  const raw = localStorage.getItem('cart');
  return raw ? JSON.parse(raw) : [];
}

export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export async function addToCart(productId, qty) {
  const payload = typeof productId === 'object' ? productId : { productId, qty };
  await addToCartUseCase.execute(payload);
}

export async function clearCart() {
  await clearCartUseCase.execute();
}

export async function deleteItem(productId) {
  await removeFromCartUseCase.execute(productId);
}