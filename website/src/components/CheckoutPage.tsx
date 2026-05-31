import React from "react";

export default function CheckoutPage() {
  return (
    <div className="page-content">
      <h2 className="page-title">Checkout</h2>

      <div className="checkout-grid">
        <div className="checkout-section" id="shipping-form">
          <h3 className="section-title">Shipping address</h3>
          <div className="form-row">
            <input className="form-input" placeholder="First name" />
            <input className="form-input" placeholder="Last name" />
          </div>
          <input className="form-input full" placeholder="Address" />
          <div className="form-row">
            <input className="form-input" placeholder="City" />
            <input className="form-input" placeholder="ZIP code" />
          </div>
        </div>

        <div className="checkout-section" id="payment-section">
          <h3 className="section-title">Payment</h3>
          <input className="form-input full" placeholder="Card number" />
          <div className="form-row">
            <input className="form-input" placeholder="MM / YY" />
            <input className="form-input" placeholder="CVV" />
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Wireless Headphones × 1</span>
              <span>$89.99</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>$89.99</span>
            </div>
          </div>

          <button className="btn btn-primary" id="pay-btn" style={{ width: "100%", marginTop: 16 }}>
            Pay $89.99
          </button>
        </div>
      </div>
    </div>
  );
}
