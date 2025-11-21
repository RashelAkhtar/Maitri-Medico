import express from "express";
import pool from "../db.js";
import { upload, cloudinary } from "../cloudinaryConfig.js";

const router = express.Router();

/* ------------------------------------------------------
   ADMIN — SUBMIT ADD REQUEST
------------------------------------------------------ */
router.post("/request/add", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const admin_name = req.body.admin_name || "admin";

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
------------------------------------------------------ */
router.post("/request/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const admin_name = req.body.admin_name || "admin";
    const { name, price, category } = req.body;

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

    res.json({ message: "Update Request Submitted 🎯", request: q.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting update request" });
  }
});

/* ------------------------------------------------------
   ADMIN — SUBMIT DELETE REQUEST
------------------------------------------------------ */
router.post("/request/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const admin_name = req.body.admin_name || "admin";

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
------------------------------------------------------ */
router.get("/requests", async (req, res) => {
  try {
    const q = await pool.query(
      `SELECT * FROM product_requests ORDER BY created_at DESC`
    );

    res.json({ requests: q.rows });
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});

/* ------------------------------------------------------
   ADMIN — CANCEL REQUEST
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
      return res
        .status(400)
        .json({ message: "Only pending requests can be cancelled" });

    const pd = reqData.product_data;

    // Delete Cloudinary image if it was uploaded for request
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

/* ------------------------------------------------------
   ADMIN — GET PENDING REQUESTS
------------------------------------------------------ */
router.get("/requests/pending", async (req, res) => {
  try {
    const q = await pool.query(
      `SELECT * FROM product_requests WHERE status = 'pending' ORDER BY created_at DESC`
    );
    res.json({ requests: q.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pending requests" });
  }
});

/* ------------------------------------------------------
   ADMIN — APPROVE REQUEST
------------------------------------------------------ */
router.put("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = await pool.query("SELECT * FROM product_requests WHERE id=$1", [
      id,
    ]);
    if (q.rows.length === 0)
      return res.status(404).json({ message: "Request not found" });

    const reqData = q.rows[0];
    if (reqData.status !== "pending")
      return res.status(400).json({ message: "Request is not pending" });

    const pd = reqData.product_data || {};

    if (reqData.request_type === "add") {
      await pool.query(
        "INSERT INTO products (name, price, image, public_id, category) VALUES ($1,$2,$3,$4,$5)",
        [pd.name, parseFloat(pd.price), pd.image, pd.public_id, pd.category]
      );
    } else if (reqData.request_type === "update") {
      await pool.query(
        "UPDATE products SET name=$1, price=$2, image=$3, public_id=$4, category=$5 WHERE id=$6",
        [pd.name, parseFloat(pd.price), pd.image, pd.public_id, pd.category, pd.id]
      );
    } else if (reqData.request_type === "delete") {
      if (pd.public_id) {
        try {
          await cloudinary.uploader.destroy(pd.public_id);
        } catch (err) {
          console.warn("Cloudinary delete failed", err);
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

/* ------------------------------------------------------
   ADMIN — REJECT REQUEST
------------------------------------------------------ */
router.put("/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = await pool.query("SELECT * FROM product_requests WHERE id=$1", [
      id,
    ]);
    if (q.rows.length === 0)
      return res.status(404).json({ message: "Request not found" });

    const reqData = q.rows[0];
    if (reqData.status !== "pending")
      return res.status(400).json({ message: "Request is not pending" });

    const pd = reqData.product_data || {};

    if (pd.public_id) {
      try {
        await cloudinary.uploader.destroy(pd.public_id);
      } catch (err) {
        console.warn("Cloudinary cleanup failed", err);
      }
    }

    await pool.query("UPDATE product_requests SET status='rejected' WHERE id=$1", [id]);

    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting request" });
  }
});

export default router;
