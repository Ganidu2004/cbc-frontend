/**
 * Abstract ICartRepository defining operations for cart persistence.
 */
export class ICartRepository {
  async getCart() {
    throw new Error('ICartRepository.getCart must be implemented');
  }

  async saveCart(cartItems) {
    throw new Error('ICartRepository.saveCart must be implemented');
  }

  async clearCart() {
    throw new Error('ICartRepository.clearCart must be implemented');
  }
}
