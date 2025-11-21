// src/Components/Admin.jsx
import React, { useEffect, useState } from "react";
import ProductForm from "./ProductForm";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Admin() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    category: "",
    image: null,
  });

  const [isEditing, setIsEditing] = useState(false);

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

  /** Cancel request edit */
  const cancelEdit = () => {
    setIsEditing(false);
    setForm({ id: "", name: "", price: "", category: "", image: null });
  };

  /** Cancel/withdraw request */
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

  /** Unified submit handler for ProductForm (add or update) */
  const handleSubmit = async (values, file) => {
    try {
      const formData = new FormData();
      formData.append("admin_name", adminName);
      formData.append("name", values.name);
      formData.append("price", values.price);
      formData.append("category", values.category);
      if (file) formData.append("image", file);

      if (isEditing && form.id) {
        // Update existing request
        await fetch(`${API_BASE}/admin/request/update/${form.id}`, {
          method: "POST",
          body: formData,
        });
      } else {
        // Create new request
        await fetch(`${API_BASE}/admin/request/add`, {
          method: "POST",
          body: formData,
        });
      }

      // Reset form / state
      cancelEdit();
      fetchRequests();
    } catch (err) {
      console.error("Submit request error", err);
    }
  };

  return (
    <div className="admin">
      <h2>Submit Product Request</h2>
      <ProductForm
        submitLabel={isEditing ? "Update Request" : "Send Request"}
        onSubmit={handleSubmit}
        initial={isEditing ? form : {}}
        onCancel={isEditing ? cancelEdit : undefined}
      />

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
