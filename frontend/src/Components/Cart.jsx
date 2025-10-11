import React, { useEffect, useState } from "react";
import "../styles/Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({
    cartId: "",
    productId: "",
    productName: "",
  });

  const cartID = localStorage.getItem("cartID");
  const API_BASE = import.meta.env.VITE_API_URL;

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart/${cartID}`);
      if (!response.ok) throw new Error("Failed to fetch cart data");
      const data = await response.json();
      setCartItems(data.cartItems || []);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  useEffect(() => {
    if (cartID && cartID !== "null" && cartID !== "undefined") {
      fetchCart();
    }
  }, [cartID]);

  const confirmDelete = (cartId, productId, productName) => {
    setItemToDelete({ cartId, productId, productName });
    setShowPopup(true);
  };

  const cancelDelete = () => {
    setShowPopup(false);
    setItemToDelete({ cartId: "", productId: "", productName: "" });
  };

  const deleteCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/cart/${itemToDelete.cartId}/${itemToDelete.productId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to remove item");
      await response.json();
      fetchCart();
    } catch (error) {
      console.error("Error removing item from cart: ", error);
    } finally {
      setLoading(false);
      setShowPopup(false);
      setItemToDelete({ cartId: "", productId: "", productName: "" });
    }
  };

  if (!cartID || cartID === "null" || cartID === "undefined") {
    return (
      <div className="cart-page">
        <h1>Your Shopping Cart</h1>
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>You haven't added anything yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>

      {/* Delete Confirmation Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="confirmation-popup">
            <div className="popup-icon">🗑️</div>
            <h3>Remove Item</h3>
            <p>Remove "{itemToDelete.productName}" from your cart?</p>
            <div className="popup-actions">
              <button
                className="cancel-btn"
                onClick={cancelDelete}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={deleteCart}
                disabled={loading}
              >
                {loading ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="empty-cart-message">
          <h2>No items in your cart</h2>
          <p>Start shopping to add products for your wellness journey.</p>
        </div>
      ) : (
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">₹{item.price} each</div>
                <div className="cart-item-quantity">
                  Quantity: {item.quantity}
                </div>
              </div>
              <div className="cart-item-total">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
              <button
                className="delete-btn"
                onClick={() => confirmDelete(cartID, item.id, item.name)}
                disabled={loading}
              >
                {loading ? "Removing..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cart;
