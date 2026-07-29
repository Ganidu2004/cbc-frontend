import { DomainError } from '../../../../core/errors/AppError';

export class CartItem {
  constructor({ productId, qty = 1, price = 0, name = '', image = '' }) {
    if (!productId) {
      throw new DomainError('CartItem must have a valid productId');
    }
    this.productId = productId;
    this.qty = Number(qty);
    this.price = Number(price);
    this.name = name;
    this.image = image;

    this.validate();
  }

  validate() {
    if (isNaN(this.qty) || this.qty < 0) {
      throw new DomainError('CartItem quantity cannot be negative or NaN');
    }
  }

  updateQuantity(newQty) {
    const updatedQty = Number(newQty);
    if (isNaN(updatedQty)) {
      throw new DomainError('Invalid quantity value');
    }
    return new CartItem({
      productId: this.productId,
      qty: updatedQty,
      price: this.price,
      name: this.name,
      image: this.image,
    });
  }

  get subtotal() {
    return this.qty * this.price;
  }

  toJSON() {
    return {
      productId: this.productId,
      qty: this.qty,
      price: this.price,
      name: this.name,
      image: this.image,
    };
  }
}
