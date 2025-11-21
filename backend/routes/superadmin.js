import express from "express";
import pool from "../db.js";
import { cloudinary } from "../cloudinaryConfig.js";

const router = express.Router();

/* ------------------------------------------------------
   SUPER ADMIN — VIEW ALL PENDING REQUESTS
------------------------------------------------------ */
router.get("/requests", async (req, res) => {
  try {
    const q = await pool.query(
      `SELECT * FROM product_requests WHERE status='pending' ORDER BY created_at DESC`
    );

    res.json({ requests: q.rows });
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending requests" });
  }
});

/* ------------------------------------------------------
   SUPER ADMIN — APPROVE REQUEST
------------------------------------------------------ */
router.post("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const q = await pool.query(
      "SELECT * FROM product_requests WHERE id=$1",
      [id]
    );
    if (q.rows.length === 0)
      return res.status(404).json({ message: "Request not found" });

    const request = q.rows[0];
    const data = request.product_data;

    if (request.request_type === "add") {
      await pool.query(
        `INSERT INTO products (name, price, category, image, public_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.name, data.price, data.category, data.image, data.public_id]
      );
    }

    if (request.request_type === "update") {
      // Delete old image if new one uploaded
      const oldProduct = await pool.query(
        "SELECT * FROM products WHERE id=$1",
        [data.id]
      );

      const old = oldProduct.rows[0];
      if (old.public_id && old.public_id !== data.public_id) {
        await cloudinary.uploader.destroy(old.public_id);
      }

      await pool.query(
        `UPDATE products
           SET name=$1, price=$2, category=$3, image=$4, public_id=$5
         WHERE id=$6`,
        [
          data.name,
          data.price,
          data.category,
          data.image,
          data.public_id,
          data.id,
        ]
      );
    }

    if (request.request_type === "delete") {
      const product = await pool.query(
        "SELECT * FROM products WHERE id=$1",
        [data.id]
      );

      if (product.rows.length > 0 && product.rows[0].public_id) {
        await cloudinary.uploader.destroy(product.rows[0].public_id);
      }

      await pool.query("DELETE FROM products WHERE id=$1", [data.id]);
    }

    await pool.query(
      "UPDATE product_requests SET status='approved' WHERE id=$1",
      [id]
    );

    res.json({ message: "Request approved ✔" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving request" });
  }
});

/* ------------------------------------------------------
   SUPER ADMIN — REJECT REQUEST
------------------------------------------------------ */
router.post("/reject/:id", async (req, res) => {
  try {
    await pool.query(
      "UPDATE product_requests SET status='rejected' WHERE id=$1",
      [req.params.id]
    );

    res.json({ message: "Request rejected ❌" });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting request" });
  }
});

/* ------------------------------------------------------
   SUPER ADMIN — DASHBOARD STATS
------------------------------------------------------ */
router.get("/stats", async (req, res) => {
  try {
    const products = await pool.query("SELECT COUNT(*) FROM products");
    const categories = await pool.query(
      "SELECT COUNT(DISTINCT category) FROM products"
    );
    const users = await pool.query("SELECT COUNT(*) FROM users");
    const orders = await pool.query("SELECT COUNT(*) FROM orders");

    res.json({
      products: Number(products.rows[0].count),
      categories: Number(categories.rows[0].count),
      users: Number(users.rows[0].count),
      orders: Number(orders.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

export default router;
