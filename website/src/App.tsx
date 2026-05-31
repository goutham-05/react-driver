import React from "react";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import { TourProvider, useTour } from "@oqlet/react-driver";
import Nav           from "./components/Nav";
import HomePage      from "./pages/HomePage";
import DocsPage      from "./pages/DocsPage";
import ExamplesPage  from "./pages/ExamplesPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import ProductsPage  from "./components/ProductsPage";
import CartPage      from "./components/CartPage";
import CheckoutPage  from "./components/CheckoutPage";
import AuthTourPage  from "./components/AuthTourPage";

// ── Shopping tour (lives outside <Routes> so it persists across navigation) ──

function ShoppingTour() {
  const navigate = useNavigate();

  const { start, stop, isActive } = useTour({
    steps: [
      { target: "#product-card",   title: "Step 1 — Browse",      content: "Find something you like.", side: "right" },
      { target: "#add-to-cart-btn",title: "Step 2 — Add to cart", content: "Add it — we'll head to your cart next.", side: "bottom",
        beforeNext: () => navigate("/examples/shopping/cart") },
      { target: "#cart-item",      title: "Step 3 — Cart",         content: "Your item is here.", side: "bottom",
        beforePrev: () => navigate("/examples/shopping") },
      { target: "#cart-qty-controls", title: "Step 4 — Quantity",  content: "Adjust with + and −.", side: "top" },
      { target: "#checkout-btn",   title: "Step 5 — Checkout",    content: "Proceed when ready.", side: "top",
        beforeNext: () => navigate("/examples/shopping/checkout") },
      { target: "#shipping-form",  title: "Step 6 — Shipping",    content: "Enter your address.", side: "right",
        beforePrev: () => navigate("/examples/shopping/cart") },
      { target: "#payment-section",title: "Step 7 — Payment",     content: "Card details — always encrypted.", side: "left" },
      { target: "#pay-btn",        title: "Step 8 — Place order", content: "That's it! 🎉", side: "top" },
    ],
    showProgress: true,
    waitForTarget: 4000,
    onStart: () => navigate("/examples/shopping"),
  });

  return (
    <div className="tour-launcher">
      {!isActive ? (
        <button className="btn btn-primary btn-sm" onClick={() => start()}>▶ Start shopping tour</button>
      ) : (
        <button className="btn btn-danger btn-sm" onClick={stop}>✕ End tour</button>
      )}
      <span className="text-sm text-blue-600 dark:text-blue-400">
        8-step tour across Products → Cart → Checkout
      </span>
    </div>
  );
}

function ShoppingShell() {
  const location = useLocation();
  const tabs = [
    { to: "/examples/shopping",          label: "🛍  Products" },
    { to: "/examples/shopping/cart",     label: "🛒  Cart"     },
    { to: "/examples/shopping/checkout", label: "💳  Checkout" },
  ];
  return (
    <div>
      <ShoppingTour />
      <nav className="tab-nav">
        {tabs.map(t => (
          <Link key={t.to} to={t.to}
            className={`tab-link ${location.pathname === t.to ? "active" : ""}`}>
            {t.label}
          </Link>
        ))}
      </nav>
      <Routes>
        <Route path="/"        element={<ProductsPage />} />
        <Route path="/cart"     element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <TourProvider>
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
        <Nav />
        <Routes>
          <Route path="/"                          element={<HomePage />} />
          <Route path="/docs"                      element={<DocsPage />} />
          <Route path="/examples"                  element={<ExamplesPage />} />
          <Route path="/playground"               element={<PlaygroundPage />} />
          <Route path="/examples/shopping/*"       element={<ShoppingShell />} />
          <Route path="/examples/auth"             element={<AuthTourPage />} />
        </Routes>
      </div>
    </TourProvider>
  );
}
