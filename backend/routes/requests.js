import express from "express";
import pool from "../db.js";
import { upload, cloudinary } from "../cloudinaryConfig.js";

const router = express.Router();

/* GET /admin/requests
   optional query: ?admin_name=xxx
*/
router.get("/requests", async (req, res) => {
  try {
    const { admin_name } = req.query;
    let q;
    if (admin_name) {
      q = await pool.query("SELECT * FROM product_requests WHERE admin_name=$1 ORDER BY created_at DESC", [
        admin_name,
      ]);
    } else {
      q = await pool.query("SELECT * FROM product_requests ORDER BY created_at DESC");
    }
    res.json({ requests: q.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching requests" });
  }
});

/* POST /admin/request/add
   multipart/form-data: name, price, category, image, admin_name
*/
router.post("/request/add", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, admin_name } = req.body;
    const file = req.file;
    const product_data = {
      name,
      price: price ? parseFloat(price) : null,
      category,
      image: file?.path || null,
      public_id: file?.filename || null,
    };

    const q = await pool.query(
      "INSERT INTO product_requests (admin_name, request_type, product_data, status, created_at) VALUES ($1,$2,$3,$4, NOW()) RETURNING *",
      [admin_name || null, "add", product_data, "pending"]
    );

    res.status(201).json({ request: q.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating request" });
  }
});

/* POST /admin/request/update/:id
   multipart/form-data: name, price, category, image
   Updates an existing product_requests row's product_data and keeps it pending
*/
router.post("/request/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;
    const file = req.file;

    const q0 = await pool.query("SELECT * FROM product_requests WHERE id=$1", [id]);
    if (q0.rows.length === 0) return res.status(404).json({ message: "Request not found" });

    const existing = q0.rows[0];
    const pd = existing.product_data || {};

    const updatedData = {
      ...pd,
      name: name ?? pd.name,
      price: price ? parseFloat(price) : pd.price,
      category: category ?? pd.category,
      image: file?.path ?? pd.image,
      public_id: file?.filename ?? pd.public_id,
    };

    await pool.query(
      "UPDATE product_requests SET product_data=$1, status='pending', request_type='update' WHERE id=$2",
      [updatedData, id]
    );

    const updated = await pool.query("SELECT * FROM product_requests WHERE id=$1", [id]);
    res.json({ request: updated.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating request" });
  }
});

/* POST /admin/request/cancel/:id
   mark request cancelled
*/
router.post("/request/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q0 = await pool.query("SELECT * FROM product_requests WHERE id=$1", [id]);
    if (q0.rows.length === 0) return res.status(404).json({ message: "Request not found" });

    await pool.query("UPDATE product_requests SET status='cancelled' WHERE id=$1", [id]);
    res.json({ message: "Request cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error cancelling request" });
  }
});

export default router;
