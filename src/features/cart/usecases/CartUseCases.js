export class GetCartUseCase {
  constructor(cartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute() {
    return await this.cartRepository.getCart();
  }
}

export class RemoveFromCartUseCase {
  constructor(cartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute(productId) {
    const currentCart = await this.cartRepository.getCart();
    const updatedCart = currentCart.filter((item) => item.productId !== productId);
    await this.cartRepository.saveCart(updatedCart);
    return updatedCart;
  }
}

export class ClearCartUseCase {
  constructor(cartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute() {
    await this.cartRepository.clearCart();
    return [];
  }
}
