import { CartItem } from '../domain/entities/CartItem';

export class AddToCartUseCase {
  constructor(cartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute({ productId, qty = 1, price = 0, name = '', image = '' }) {
    const currentCart = await this.cartRepository.getCart();
    
    const existingIndex = currentCart.findIndex((item) => item.productId === productId);

    let updatedCart = [...currentCart];

    if (existingIndex === -1) {
      if (qty > 0) {
        const newItem = new CartItem({ productId, qty, price, name, image });
        updatedCart.push(newItem);
      }
    } else {
      const existingItem = currentCart[existingIndex];
      const newQty = existingItem.qty + qty;

      if (newQty <= 0) {
        updatedCart.splice(existingIndex, 1);
      } else {
        updatedCart[existingIndex] = existingItem.updateQuantity(newQty);
      }
    }

    await this.cartRepository.saveCart(updatedCart);
    return updatedCart;
  }
}
