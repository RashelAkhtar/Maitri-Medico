import React, { useState, useEffect } from "react";
import "../styles/Admin.css";

const API_BASE = import.meta.env.VITE_API_URL;

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    image: "",
    category: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [productToDelete, setProductToDelete] = useState({ id: "", name: "" });

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add product
  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          image: form.image,
          category: form.category,
        }),
      });
      if (!response.ok) throw new Error("Failed to add product");
      setForm({ id: "", name: "", price: "", image: "", category: "" });
      fetchProducts();
    } catch (err) {
      console.error("Error adding product", err);
    } finally {
      setLoading(false);
    }
  };

  // Update product
  const updateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: form.price,
          image: form.image,
          category: form.category,
        }),
      });
      if (!response.ok) throw new Error("Failed to update product");
      setForm({ id: "", name: "", price: "", image: "", category: "" });
      setIsEditing(false);
      fetchProducts();
    } catch (err) {
      console.error("Error updating product", err);
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete
  const confirmDelete = (id, name) => {
    setProductToDelete({ id, name });
    setShowDeletePopup(true);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeletePopup(false);
    setProductToDelete({ id: "", name: "" });
  };

  // Delete product
  const deleteProduct = async () => {
    try {
      await fetch(`${API_BASE}/products/${productToDelete.id}`, {
        method: "DELETE",
      });
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product", err);
    } finally {
      setShowDeletePopup(false);
      setProductToDelete({ id: "", name: "" });
    }
  };

  // Start edit mode
  const startEdit = (product) => {
    setForm(product);
    setIsEditing(true);
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">🧠 Maitri Admin Dashboard</h1>
      <p className="admin-subtitle">
        Manage your mental wellness products with ease 💜
      </p>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="confirmation-popup">
            <div className="popup-icon">🗑️</div>
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete "{productToDelete.name}"?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="popup-actions">
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={deleteProduct}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={isEditing ? updateProduct : addProduct}
        className="product-form"
      >
        {isEditing && (
          <input
            type="text"
            name="id"
            value={form.id}
            disabled
            className="form-input id-input"
          />
        )}
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          className="form-input"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="form-input"
          required
          min="0"
          step="0.01"
        />
        <input
          type="url"
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
          className="form-input"
          required
        />
        <select
          name="category"
          value={form.category || ""}
          onChange={handleChange}
          className="form-input"
          required
        >
          <option value="">Select Category</option>
          <option value="antidepressants">Antidepressants</option>
          <option value="antiAnxiety">Anti-Anxiety</option>
          <option value="moodStabilizers">Mood Stabilizers</option>
          <option value="antipsychotics">Antipsychotics</option>
          <option value="sleepRelaxationAids">Sleep & Relaxation Aids</option>
          <option value="cognitiveFocusEnhancers">
            Cognitive & Focus Enhancers
          </option>
          <option value="naturalHerbalMentalWellness">
            Natural & Herbal Mental Wellness
          </option>
          <option value="vitaminsNutritionalSupport">
            Vitamins & Nutritional Support
          </option>
        </select>

        <button
          type="submit"
          className="form-button primary"
          disabled={loading}
        >
          {loading ? "Saving..." : isEditing ? "Update" : "Add"} Product
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setForm({ id: "", name: "", price: "", image: "", category: "" });
            }}
            className="form-button secondary"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>₹{parseFloat(p.price).toFixed(2)}</td>
                  <td className="category-cell">{p.category}</td>
                  <td className="image-cell">
                    <img src={p.image} alt={p.name} />
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => startEdit(p)}
                      className="action-button edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(p.id, p.name)}
                      className="action-button delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-products">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
