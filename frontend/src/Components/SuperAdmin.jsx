// src/Components/SuperAdmin.jsx
import React, { useEffect, useState } from "react";
import "../styles/SuperAdmin.css";

const API_BASE = import.meta.env.VITE_API_URL;

function SuperAdmin() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  /** Fetch all pending requests */
  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/requests/pending`);
      const data = await res.json();
      setPending(data.requests || []);
    } catch (err) {
      console.error("Error fetching pending requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  /** Approve request */
  const approve = async (id) => {
    try {
      await fetch(`${API_BASE}/superadmin/approve/${id}`, {
        method: "PUT",
      });
      fetchPending();
    } catch (err) {
      console.error("Approve error", err);
    }
  };

  /** Reject request */
  const reject = async (id) => {
    try {
      await fetch(`${API_BASE}/superadmin/reject/${id}`, {
        method: "PUT",
      });
      fetchPending();
    } catch (err) {
      console.error("Reject error", err);
    }
  };

  return (
    <div className="super-admin-container">
      <h1>Super Admin — Pending Product Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : pending.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <div className="requests-list">
          {pending.map((r) => {
            const pd = r.product_data || {};
            return (
              <div className="request-card" key={r.id}>
                <div className="left">
                  <h3>{pd.name || "Unnamed Product"}</h3>

                  <p>
                    <strong>Type:</strong> {r.request_type}
                  </p>

                  <p>
                    <strong>By:</strong> {r.admin_name}
                  </p>

                  <p>
                    <strong>Price:</strong> {pd.price || "--"}
                  </p>

                  <p>
                    <strong>Category:</strong> {pd.category || "--"}
                  </p>

                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Image */}
                <div className="middle">
                  {pd.image ? (
                    <img
                      src={pd.image}
                      alt={pd.name}
                      style={{ maxWidth: 150 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 150,
                        height: 100,
                        background: "#eee",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      No Image
                    </div>
                  )}
                </div>

                <div className="right">
                  <button className="approve" onClick={() => approve(r.id)}>
                    Approve
                  </button>
                  <button className="reject" onClick={() => reject(r.id)}>
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SuperAdmin;
