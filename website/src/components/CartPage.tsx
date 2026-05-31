import React from "react";

export default function CartPage() {
  return (
    <div className="page-content">
      <h2 className="page-title">Your Cart</h2>

      <div className="cart-list">
        <div className="cart-item" id="cart-item">
          <span className="product-emoji">🎧</span>
          <div className="cart-item-info">
            <div className="product-name">Wireless Headphones</div>
            <div className="product-price">$89.99</div>
          </div>
          <div className="cart-item-controls" id="cart-qty-controls">
            <button className="btn btn-secondary btn-sm">−</button>
            <span className="qty-display">1</span>
            <button className="btn btn-secondary btn-sm">+</button>
          </div>
          <button className="btn btn-danger btn-sm" id="remove-item-btn">Remove</button>
        </div>
      </div>

      <div className="cart-summary" id="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>$89.99</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span className="free">Free</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>$89.99</span>
        </div>
        <button className="btn btn-primary" id="checkout-btn" style={{ width: "100%", marginTop: 12 }}>
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
