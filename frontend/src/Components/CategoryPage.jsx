import React, { useState, useEffect } from "react";
import "../styles/CategoryPage.css";

function CategoryPage({ categoryName }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${API_BASE}/products/category/${categoryName}`
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryName, API_BASE]);

  const addToCart = async (productId) => {
    try {
      let cartID = localStorage.getItem("cartID");

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

      setCartMessage("✅ Added to cart!");
      setTimeout(() => setCartMessage(""), 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (loading)
    return (
      <div className="dot-loading-container">
        <h2 className="loading-title">
          Loading {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}{" "}
          Products
        </h2>
        <div className="dot-loading">
          <div className="dot dot-1"></div>
          <div className="dot dot-2"></div>
          <div className="dot dot-3"></div>
        </div>
        <p className="loading-text">
          Finding the best products for your mind...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <h2>Error Loading Products</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );

  return (
    <div className="category-page">
      <div className="products-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image-container">
                <img src={product.image} alt={product.name} loading="lazy" />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="price">₹{product.price.toLocaleString()}</p>
                <button
                  className="add-to-cart"
                  onClick={() => addToCart(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <img src="/empty-category.svg" alt="No products" />
            <h3>No products found in this category</h3>
            <p>We couldn’t find any {categoryName} products at this time.</p>
          </div>
        )}
      </div>

      {cartMessage && <div className="cart-message">{cartMessage}</div>}
    </div>
  );
}

export default CategoryPage;
