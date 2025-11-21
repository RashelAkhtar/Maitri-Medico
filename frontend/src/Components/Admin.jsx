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
    category: "",
    image: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Admin name from localStorage or fallback
  const adminName = localStorage.getItem("adminName") || "admin";

  /** Fetch admin’s own requests */
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/requests`);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) =>
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));

  /** Submit Add or Update request */
  const submitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("admin_name", adminName);
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      if (form.image) formData.append("image", form.image);

      let url = "";

      if (isEditing) {
        // UPDATE Request
        url = `${API_BASE}/admin/request/update/${form.id}`;
      } else {
        // ADD Request
        url = `${API_BASE}/admin/request/add`;
      }

      await fetch(url, {
        method: "POST",
        body: formData,
      });

      // Reset form
      setForm({
        id: "",
        name: "",
        price: "",
        category: "",
        image: null,
      });
      setIsEditing(false);
      fetchRequests();
    } catch (err) {
      console.error("Submit request error", err);
    } finally {
      setLoading(false);
    }
  };

  /** Prepare update request editing */
  const prepareEdit = (req) => {
    const pd = req.product_data || {};

    setIsEditing(true);
    setForm({
      id: req.product_id || pd.id || "",
      name: pd.name || "",
      price: pd.price || "",
      category: pd.category || "",
      image: null,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Cancel request */
  const withdrawRequest = async (id) => {
    try {
      await fetch(`${API_BASE}/admin/request/cancel/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_name: adminName }),
      });

      fetchRequests();
    } catch (err) {
      console.error("Error cancelling request", err);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard — Product Requests</h1>

      {/* --- FORM --- */}
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
            <option value="antpsycotics">Antipsychotics</option>
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
        </div>

        <div className="file-input-wrapper">
          <input type="file" onChange={handleFileChange} />
        </div>

        <button className="form-button primary" disabled={loading}>
          {loading
            ? "Submitting..."
            : isEditing
            ? "Submit Update Request"
            : "Submit Add Request"}
        </button>
      </form>

      {/* --- REQUEST LIST --- */}
      <h2>Your Requests</h2>

      <table className="products-table">
        <thead>
          <tr>
            <th>Req ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.product_data?.name || "-"}</td>
              <td>{r.request_type}</td>
              <td className={`status-${r.status}`}>{r.status}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>

              <td>
                {r.status === "pending" && (
                  <>
                    <button
                      className="cancel-btn"
                      onClick={() => withdrawRequest(r.id)}
                    >
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
              <td colSpan="6">No requests found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
