import React from "react";
import "../styles/BuyNowButton.css";

function BuyNowButton({ productId, apiBase }) {
  const handleBuyNow = async () => {
    try {
      let cartID = localStorage.getItem("cartID");

      // If cart doesn't exist, create one
      if (!cartID) {
        const newCartRes = await fetch(`${apiBase}/cart/new`);
        const newCartData = await newCartRes.json();
        cartID = newCartData.cart_id;
        localStorage.setItem("cartID", cartID);
      }

      // Add product to cart
      const res = await fetch(`${apiBase}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: cartID,
          product_id: productId,
          quantity: 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to add item for buy now");

      // Redirect user to checkout page
      window.location.href = "/checkout";
    } catch (error) {
      console.error("Buy Now error:", error);
    }
  };

  return (
    <button className="buy-now-btn" onClick={handleBuyNow}>
      Buy Now
    </button>
  );
}

export default BuyNowButton;
