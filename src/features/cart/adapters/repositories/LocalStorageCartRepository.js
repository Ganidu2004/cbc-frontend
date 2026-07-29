import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { CartItem } from '../../domain/entities/CartItem';

export class LocalStorageCartRepository extends ICartRepository {
  constructor(storageKey = 'cart') {
    super();
    this.storageKey = storageKey;
  }

  async getCart() {
    try {
      const rawData = localStorage.getItem(this.storageKey);
      if (!rawData) return [];
      const parsed = JSON.parse(rawData);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => new CartItem(item));
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  }

  async saveCart(cartItems) {
    try {
      const rawList = cartItems.map((item) => item.toJSON());
      localStorage.setItem(this.storageKey, JSON.stringify(rawList));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  async clearCart() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear cart from localStorage:', error);
    }
  }
}

export const defaultCartRepository = new LocalStorageCartRepository();
