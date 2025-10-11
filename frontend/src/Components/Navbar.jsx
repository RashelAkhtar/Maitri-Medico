import React from "react";
import "../styles/Navbar.css";
import {
  FaOptinMonster,
  FaRegIdBadge,
  FaSearch,
  FaShopify,
  FaShoppingBag,
  FaShoppingBasket,
  FaShoppingCart,
  FaShopware,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-logo">
          Maitri Medico
        </Link>
      </div>

      <div className="navbar-links">
        <ul className="navbar-list">
          <li className="navbar-item">
            <Link to="/products" className="nav-link">
              <FaShoppingBag className="nav-icon" />
              <span>Category</span>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/cart" className="nav-link">
              <FaShoppingCart className="nav-icon" />
              <span>Cart</span>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/admin" className="nav-link">
              <FaUser className="nav-icon" />
              <span>Admin</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
