// src/Components/SuperAdmin.jsx
import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function SuperAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // add / edit form state
  const [form, setForm] = useState({ name: "", price: "", category: "" });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/superadmin/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = (e) => setFile(e.target.files[0]);

  const submitAdd = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", form.price);
    fd.append("category", form.category);
    if (file) fd.append("image", file);

    try {
      await fetch(`${API_BASE}/superadmin/products`, {
        method: "POST",
        body: fd,
      });
      setForm({ name: "", price: "", category: "" });
      setFile(null);
      fetchProducts();
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name || "", price: String(p.price || ""), category: p.category || "" });
    setFile(null);
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", form.price);
    fd.append("category", form.category);
    if (file) fd.append("image", file);

    try {
      await fetch(`${API_BASE}/superadmin/products/${editingId}`, {
        method: "PUT",
        body: fd,
      });
      setEditingId(null);
      setForm({ name: "", price: "", category: "" });
      setFile(null);
      fetchProducts();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    try {
      await fetch(`${API_BASE}/superadmin/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: "", category: "" });
    setFile(null);
  };

  return (
    <div className="superadmin">
      <h2>Products</h2>

      {/* Add / Edit form */}
      <form onSubmit={editingId ? submitUpdate : submitAdd} style={{ marginBottom: 20 }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
        <input type="file" accept="image/*" onChange={handleFile} />
        <button type="submit">{editingId ? "Update" : "Add"}</button>
        {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
      </form>

      {loading ? <div>Loading...</div> : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && <tr><td colSpan="6">No products</td></tr>}
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.image ? <img src={p.image} alt={p.name} style={{ width: 60 }} /> : "—"}</td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.category}</td>
                <td>
                  <button onClick={() => startEdit(p)}>Edit</button>
                  <button onClick={() => deleteProduct(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
