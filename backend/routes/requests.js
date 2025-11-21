import express from "express";
import pool from "../db.js";
import { upload } from "../cloudinaryConfig.js";
import { cloudinary } from "../cloudinaryConfig.js";

const router = express.Router();

/* ------------------------------------------------------
   ADMIN — SUBMIT ADD REQUEST
   POST /admin/request/add
------------------------------------------------------ */
router.post("/request/add", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const admin_name = "admin"; // Replace with JWT later

    let image_url = null;
    let public_id = null;

    if (req.file) {
      image_url = req.file.path;
      public_id = req.file.filename;
    }

    const productData = {
      name,
      price,
      category,
      image: image_url,
      public_id,
    };

    const q = await pool.query(
      `INSERT INTO product_requests (admin_name, request_type, product_data)
       VALUES ($1, 'add', $2) RETURNING *`,
      [admin_name, productData]
    );

    res.json({ message: "Add Request Submitted 🎯", request: q.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting add request" });
  }
});

/* ------------------------------------------------------
   ADMIN — SUBMIT UPDATE REQUEST
   POST /admin/request/update/:id
------------------------------------------------------ */
router.post(
  "/request/update/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, category } = req.body;
      const admin_name = "admin";

      // Fetch existing product
      const product = await pool.query("SELECT * FROM products WHERE id=$1", [
        id,
      ]);
      if (product.rows.length === 0)
        return res.status(404).json({ message: "Product not found" });

      const existing = product.rows[0];

      let image_url = existing.image;
      let public_id = existing.public_id;

      if (req.file) {
        image_url = req.file.path;
        public_id = req.file.filename;
      }

      const productData = {
        id,
        name,
        price,
        category,
        image: image_url,
        public_id,
      };

      const q = await pool.query(
        `INSERT INTO product_requests (admin_name, request_type, product_id, product_data)
         VALUES ($1, 'update', $2, $3) RETURNING *`,
        [admin_name, id, productData]
      );

      res.json({
        message: "Update Request Submitted 🎯",
        request: q.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error submitting update request" });
    }
  }
);

/* ------------------------------------------------------
   ADMIN — SUBMIT DELETE REQUEST
   POST /admin/request/delete/:id
------------------------------------------------------ */
router.post("/request/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const admin_name = "admin";

    const product = await pool.query("SELECT * FROM products WHERE id=$1", [
      id,
    ]);

    if (product.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    const existing = product.rows[0];

    const productData = {
      id,
      name: existing.name,
      price: existing.price,
      category: existing.category,
      image: existing.image,
      public_id: existing.public_id,
    };

    const q = await pool.query(
      `INSERT INTO product_requests (admin_name, request_type, product_id, product_data)
       VALUES ($1, 'delete', $2, $3) RETURNING *`,
      [admin_name, id, productData]
    );

    res.json({ message: "Delete Request Submitted ❗", request: q.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Error submitting delete request" });
  }
});

/* ------------------------------------------------------
   ADMIN — VIEW OWN REQUESTS
   GET /admin/requests
------------------------------------------------------ */
router.get("/requests", async (req, res) => {
  try {
    const q = await pool.query(
      `SELECT * FROM product_requests ORDER BY created_at DESC`
    );
    res.json({ requests: q.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching requests" });
  }
});

/* ------------------------------------------------------
   ADMIN — CANCEL REQUEST
   POST /admin/request/cancel/:id
------------------------------------------------------ */
router.post("/request/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const q = await pool.query("SELECT * FROM product_requests WHERE id=$1", [
      id,
    ]);
    if (q.rows.length === 0)
      return res.status(404).json({ message: "Request not found" });

    const reqData = q.rows[0];

    if (reqData.status !== "pending")
      return res.status(400).json({ message: "Only pending requests can be cancelled" });

    const pd = reqData.product_data;

    // Delete cloudinary image uploaded as request (optional)
    if (pd.public_id) {
      try {
        await cloudinary.uploader.destroy(pd.public_id);
      } catch (err) {
        console.warn("Cloudinary cleanup failed", err);
      }
    }

    await pool.query(
      "UPDATE product_requests SET status='rejected' WHERE id=$1",
      [id]
    );

    res.json({ message: "Request cancelled ❌" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling request" });
  }
});

export default router;
