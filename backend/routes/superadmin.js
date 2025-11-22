import express from "express";
import pool from "../db.js";
import { upload, cloudinary } from "../cloudinaryConfig.js";

const router = express.Router();

/* GET /superadmin/requests/pending */
router.get("/requests/pending", async (req, res) => {
  try {
    const q = await pool.query("SELECT * FROM product_requests WHERE status='pending' ORDER BY created_at DESC");
    res.json({ requests: q.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pending requests" });
  }
});

/* PUT /superadmin/approve/:id */
router.put("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = await pool.query("SELECT * FROM product_requests WHERE id=$1", [id]);
    if (q.rows.length === 0) return res.status(404).json({ message: "Request not found" });

    const reqRow = q.rows[0];
    if (reqRow.status !== "pending") return res.status(400).json({ message: "Request not pending" });

    const pd = reqRow.product_data || {};

    if (reqRow.request_type === "add") {
      await pool.query(
        "INSERT INTO products (name, price, image, public_id, category) VALUES ($1,$2,$3,$4,$5)",
        [pd.name, pd.price, pd.image, pd.public_id, pd.category]
      );
    } else if (reqRow.request_type === "update") {
      await pool.query(
        "UPDATE products SET name=$1, price=$2, image=$3, public_id=$4, category=$5 WHERE id=$6",
        [pd.name, pd.price, pd.image, pd.public_id, pd.category, pd.id]
      );
    } else if (reqRow.request_type === "delete") {
      if (pd.public_id) {
        try {
          await cloudinary.uploader.destroy(pd.public_id);
        } catch (e) {
          console.warn("Cloudinary delete failed", e);
        }
      }
      await pool.query("DELETE FROM products WHERE id=$1", [pd.id]);
    }

    await pool.query("UPDATE product_requests SET status='approved' WHERE id=$1", [id]);
    res.json({ message: "Request approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving request" });
  }
});

/* PUT /superadmin/reject/:id */
router.put("/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = await pool.query("SELECT * FROM product_requests WHERE id=$1", [id]);
    if (q.rows.length === 0) return res.status(404).json({ message: "Request not found" });

    const reqRow = q.rows[0];
    if (reqRow.status !== "pending") return res.status(400).json({ message: "Request not pending" });

    const pd = reqRow.product_data || {};
    if (pd.public_id) {
      try {
        await cloudinary.uploader.destroy(pd.public_id);
      } catch (e) {
        console.warn("Cloudinary cleanup failed", e);
      }
    }

    await pool.query("UPDATE product_requests SET status='rejected' WHERE id=$1", [id]);
    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting request" });
  }
});

/* --- product CRUD for superadmin --- */

/* GET /superadmin/products */
router.get("/products", async (req, res) => {
  try {
    const q = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json({ products: q.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

/* POST /superadmin/products */
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const file = req.file;
    const image = file?.path || null;
    const public_id = file?.filename || null;

    const q = await pool.query(
      "INSERT INTO products (name, price, image, public_id, category) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, price ? parseFloat(price) : null, image, public_id, category]
    );

    res.status(201).json({ product: q.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating product" });
  }
});

/* PUT /superadmin/products/:id */
router.put("/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;
    const file = req.file;

    const q0 = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
    if (q0.rows.length === 0) return res.status(404).json({ message: "Product not found" });
    const old = q0.rows[0];

    let image = old.image;
    let public_id = old.public_id;

    if (file) {
      const uploadResult = file.path ? await cloudinary.uploader.upload(file.path, { folder: "maitri_medico_products" }) : null;
      if (public_id) {
        try { await cloudinary.uploader.destroy(public_id); } catch (e) { console.warn(e); }
      }
      image = uploadResult?.secure_url || image;
      public_id = uploadResult?.public_id || public_id;
    }

    await pool.query(
      "UPDATE products SET name=$1, price=$2, image=$3, public_id=$4, category=$5 WHERE id=$6",
      [name ?? old.name, price ? parseFloat(price) : old.price, image, public_id, category ?? old.category, id]
    );

    const updated = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
    res.json({ product: updated.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product" });
  }
});

/* DELETE /superadmin/products/:id */
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q0 = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
    if (q0.rows.length === 0) return res.status(404).json({ message: "Product not found" });
    const p = q0.rows[0];

    if (p.public_id) {
      try { await cloudinary.uploader.destroy(p.public_id); } catch (e) { console.warn(e); }
    }

    await pool.query("DELETE FROM products WHERE id=$1", [id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting product" });
  }
});

export default router;
