import React from "react";

const products = [
  { id: 1, name: "Wireless Headphones", price: "$89.99", rating: "★★★★☆", img: "🎧" },
  { id: 2, name: "Mechanical Keyboard", price: "$129.99", rating: "★★★★★", img: "⌨️" },
  { id: 3, name: "USB-C Hub",           price: "$39.99",  rating: "★★★☆☆", img: "🔌" },
];

export default function ProductsPage() {
  return (
    <div className="page-content">
      <h2 className="page-title">Products</h2>

      <div className="product-grid">
        {products.map((p, i) => (
          <div
            key={p.id}
            className="product-card"
            id={i === 0 ? "product-card" : undefined}
          >
            <div className="product-emoji">{p.img}</div>
            <div className="product-info">
              <div className="product-name">{p.name}</div>
              <div className="product-rating">{p.rating}</div>
              <div className="product-price">{p.price}</div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              id={i === 0 ? "add-to-cart-btn" : undefined}
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
