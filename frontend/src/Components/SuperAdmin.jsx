import React, { useEffect, useState } from "react";
import "../styles/SuperAdmin.css"

const API_BASE = import.meta.env.VITE_API_URL;

function SuperAdmin() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    users: 0,
    orders: 0,
  });

  const [recentProducts, setRecentProducts] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/stats`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats", error);
    }
  };

  const fetchRecentProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?limit=5`);
      const data = await res.json();
      setRecentProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching recent products", error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentProducts();
  }, []);

  return (
    <div className="super-admin-container">
      <h1>Super Admin Dashboard</h1>

      <div className="stats-cards">
        <div className="card">Products: {stats.products}</div>
        <div className="card">Categories: {stats.categories}</div>
        <div className="card">Users: {stats.users}</div>
        <div className="card">Orders: {stats.orders}</div>
      </div>

      <h2>Recently Added Products</h2>
      <ul>
        {recentProducts.map((p) => (
          <li key={p.id}>{p.name} — ₹{p.price}</li>
        ))}
      </ul>
    </div>
  );
}

export default SuperAdmin;
