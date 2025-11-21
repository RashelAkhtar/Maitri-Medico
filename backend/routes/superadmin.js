const express = require("express");
const router = express.Router();
const db = require("../db"); // your database connection

router.get("/stats", async (req, res) => {
  try {
    const products = await db.query("SELECT COUNT(*) FROM products");
    const categories = await db.query("SELECT COUNT(DISTINCT category) FROM products");
    const users = await db.query("SELECT COUNT(*) FROM users");
    const orders = await db.query("SELECT COUNT(*) FROM orders");

    res.json({
      products: Number(products.rows[0].count),
      categories: Number(categories.rows[0].count),
      users: Number(users.rows[0].count),
      orders: Number(orders.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching stats" });
  }
});

module.exports = router;
