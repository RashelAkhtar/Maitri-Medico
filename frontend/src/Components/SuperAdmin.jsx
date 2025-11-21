// src/Components/SuperAdmin.jsx
import React, { useEffect, useState } from "react";
import ProductForm from "./ProductForm";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function SuperAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

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

  const handleAdd = async (values, file) => {
    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("price", values.price);
    fd.append("category", values.category);
    if (file) fd.append("image", file);

    try {
      await fetch(`${API_BASE}/superadmin/products`, {
        method: "POST",
        body: fd,
      });
      fetchProducts();
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  const handleUpdate = async (values, file) => {
    if (!editingId) return;
    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("price", values.price);
    fd.append("category", values.category);
    if (file) fd.append("image", file);

    try {
      await fetch(`${API_BASE}/superadmin/products/${editingId}`, {
        method: "PUT",
        body: fd,
      });
      setEditingId(null);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditingProduct(p);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingProduct(null);
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

  return (
    <div className="superadmin">
      <h2>Products</h2>

      {/* Reusable ProductForm used for Add and Edit */}
      {editingId ? (
        <ProductForm
          initial={editingProduct || {}}
          submitLabel="Update"
          onSubmit={handleUpdate}
          onCancel={cancelEdit}
        />
      ) : (
        <ProductForm submitLabel="Add" onSubmit={handleAdd} />
      )}

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
