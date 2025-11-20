import React, { useEffect, useState } from "react";
import "../styles/ProductShowcasePage.css";
import { Link } from "react-router-dom";
import BuyNowButton from "./BuyNowButton";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      let cartID = localStorage.getItem("cartID");

      // Create new cart if none exists
      if (!cartID) {
        const newCartRes = await fetch(`${API_BASE}/cart/new`);
        const newCartData = await newCartRes.json();
        cartID = newCartData.cart_id;
        localStorage.setItem("cartID", cartID);
      }

      const res = await fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: cartID,
          product_id: productId,
          quantity: 1,
        }),
      });

      if (!res.ok) throw new Error(`Failed to add to cart`);

      // Display add to cart message
      setCartMessage("✅ Added to cart!");
      setTimeout(() => setCartMessage(""), 3000); // Hide after 3 sec
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="dots-loading-container">
        <div className="dots-loading">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        <p>Loading products</p>
      </div>
    );
  }

  return (
    <div>
      <div className="products-page">
        <h1>Our Products</h1>
        <div className="category-links">
          <Link to="/products/antidepressants">Antidepressants</Link>
          <Link to="/products/antiAnxiety">Anti-Anxiety</Link>
          <Link to="/products/moodStabilizers">Mood Stabilizers</Link>
          <Link to="/products/antipsychotics">Antipsychotics</Link>
          <Link to="/products/sleepRelaxationAids">
            Sleep & Relaxation Aids
          </Link>
          <Link to="/products/cognitiveFocusEnhancers">
            Cognitive & Focus Enhancers
          </Link>
          <Link to="/products/naturalHerbalMentalWellness">
            Natural & Herbal Mental Wellness
          </Link>
          <Link to="/products/vitaminsNutritionalSupport">
            Vitamins & Nutritional Support
          </Link>
        </div>

        <div className="products-grid">
          {products.length === 0 ? (
            <div className="no-products-message">
              <h2>No products available</h2>
              <p>We couldn’t find any products at this time.</p>
            </div>
          ) : (
            products.map((product) => (
              <div className="product-card" key={product.id}>
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p>₹{product.price}</p>
                <button onClick={() => addToCart(product.id)}>
                  Add to Cart
                </button>
                <BuyNowButton productId={product.id} apiBase={API_BASE} />
              </div>
            ))
          )}
        </div>
      </div>
      {cartMessage && <div className="cart-message">{cartMessage}</div>}
    </div>
  );
}

export default ProductsPage;
