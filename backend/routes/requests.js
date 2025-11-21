import express from "express";
import pool from "../db.js";
import { upload } from "../cloudinaryConfig.js";
import { cloudinary } from "../cloudinaryConfig.js";

const router = express.Router();

// Admin creates Add / Update / Delete Request
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { admin_name, request_type, name, price, category, product_id } =
      req.body;

    let image = null;
    if (req.file) {
      image = req.file.path;
    }

    const productData = {
      id: product_id,
      name,
      price,
      category,
      image,
    };

    const result = await pool.query(
      `INSERT INTO product_requests (admin_name, request_type, product_id, product_data)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [admin_name, request_type, product_id || null, productData]
    );

    res.json({ message: "Request submitted 🎯", request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating request" });
  }
});

// Super Admin -> View all pending requests
router.get("/pending", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM product_requests WHERE status = 'pending' ORDER BY created_at DESC"
    );
    res.json({ requests: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});

// Approve a request
router.put("/approve/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const reqDetails = await pool.query(
      "SELECT * FROM product_requests WHERE id = $1",
      [id]
    );

    if (reqDetails.rows.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    const request = reqDetails.rows[0];
    const data = request.product_data;

    if (request.request_type === "add") {
      await pool.query(
        "INSERT INTO products (name, price, category, image) VALUES ($1, $2, $3, $4)",
        [data.name, data.price, data.category, data.image]
      );
    }

    if (request.request_type === "update") {
      await pool.query(
        "UPDATE products SET name=$1, price=$2, category=$3, image=$4 WHERE id=$5",
        [data.name, data.price, data.category, data.image, data.id]
      );
    }

    if (request.request_type === "delete") {
      await pool.query("DELETE FROM products WHERE id=$1", [data.id]);
    }

    await pool.query(
      "UPDATE product_requests SET status='approved' WHERE id=$1",
      [id]
    );

    res.json({ message: "Request Approved 🚀" });
  } catch (err) {
    res.status(500).json({ message: "Error approving request" });
  }
});

// Reject a request
router.put("/reject/:id", async (req, res) => {
  try {
    await pool.query(
      "UPDATE product_requests SET status='rejected' WHERE id=$1",
      [req.params.id]
    );
    res.json({ message: "Request Rejected ❌" });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting request" });
  }
});

export default router;
