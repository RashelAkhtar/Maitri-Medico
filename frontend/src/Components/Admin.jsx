// src/Components/Admin.jsx
import React, { useState, useEffect } from "react";
import "../styles/Admin.css";

const API_BASE = import.meta.env.VITE_API_URL;

function Admin() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    image: null,
    category: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // admin name from your auth or localStorage (fallback)
  const adminName = localStorage.getItem("adminName") || "admin";

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/requests?admin_name=${encodeURIComponent(adminName)}`);
      const data = await res.json();
      // data.requests is expected
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) =>
    setForm({ ...form, image: e.target.files[0] });

  // Submit new add request
  const submitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("admin_name", adminName);
      formData.append("request_type", isEditing ? "update" : "add");
      if (isEditing && form.id) formData.append("product_id", form.id);
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      if (form.image) formData.append("image", form.image);

      // POST to /requests (your backend request.js POST /)
      const url = `${API_BASE}/requests`;
      await fetch(url, {
        method: "POST",
        body: formData,
      });

      setForm({ id: "", name: "", price: "", image: null, category: "" });
      setIsEditing(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prepareEdit = (r) => {
    // r.product_data has stored values
    setIsEditing(true);
    setForm({
      id: r.product_id || r.product_data?.id || "",
      name: r.product_data?.name || "",
      price: r.product_data?.price || "",
      image: null,
      category: r.product_data?.category || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const withdrawRequest = async (id) => {
    try {
      await fetch(`${API_BASE}/requests/cancel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_name: adminName }), // backend should verify owner
      });
      fetchRequests();
    } catch (err) {
      console.error("Error cancelling request", err);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin: Product Requests</h1>

      <form onSubmit={submitRequest} className="product-form two-column-form">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="antidepressants">Antidepressants</option>
            <option value="antiAnxiety">Anti-Anxiety</option>
            <option value="moodStabilizers">Mood Stabilizers</option>
            <option value="antipsychotics">Antipsychotics</option>
            <option value="sleepRelaxationAids">Sleep & Relaxation Aids</option>
            <option value="cognitiveFocusEnhancers">Cognitive & Focus Enhancers</option>
            <option value="naturalHerbalMentalWellness">Natural & Herbal Mental Wellness</option>
            <option value="vitaminsNutritionalSupport">Vitamins & Nutritional Support</option>
          </select>
        </div>

        <div className="file-input-wrapper">
          <input type="file" onChange={handleFileChange} />
        </div>

        <button className="form-button primary" disabled={loading}>
          {isEditing ? "Submit Update Request" : "Submit Add Request"}
        </button>
      </form>

      <h2>Your Requests</h2>

      <table className="products-table">
        <thead>
          <tr>
            <th>Req ID</th>
            <th>Name</th>
            <th>Action</th>
            <th>Status</th>
            <th>Created</th>
            <th>Withdraw / Edit</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.product_data?.name || "-"}</td>
              <td>{r.request_type}</td>
              <td className={`status-${r.status.toLowerCase()}`}>{r.status}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>
                {r.status === "pending" && (
                  <>
                    <button className="cancel-btn" onClick={() => withdrawRequest(r.id)}>
                      Cancel
                    </button>
                    <button className="edit-btn" onClick={() => prepareEdit(r)}>
                      Edit
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan="6">No requests yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
