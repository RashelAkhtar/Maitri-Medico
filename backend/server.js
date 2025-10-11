import express from "express";
import path from "path";
import pool from "./db.js";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Allow requests from frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // if sending cookies/auth headers
  })
);

app.use(express.json());

/* ================== 🛒 CART API ================== */

// Create new cart ID (for new visitor)
app.get("/cart/new", (req, res) => {
  const newCartID = uuidv4();
  res.json({ cart_id: newCartID });
});

// Add item to cart
app.post("/cart", async (req, res) => {
  try {
    const { cart_id, product_id, quantity = 1 } = req.body;

    if (!cart_id || !product_id) {
      return res
        .status(400)
        .json({ message: "Cart ID and Product ID are required" });
    }

    // Check if product exists
    const productCheck = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [product_id]
    );
    if (productCheck.rows.length === 0) {
      return res.status(400).json({ message: "Product does not exist" });
    }

    // Check if item exists in cart
    const existing = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cart_id, product_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3",
        [quantity || 1, cart_id, product_id]
      );
    } else {
      await pool.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
        [cart_id, product_id, quantity || 1]
      );
    }

    res.json({ message: "Item added to cart", cart_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get cart items
app.get("/cart/:cartId", async (req, res) => {
  const { cartId } = req.params;

  try {
    const cart = await pool.query(
      `SELECT p.id, p.name, p.price, p.image, c.quantity
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.cart_id = $1`,
      [cartId]
    );

    res.json({ cartItems: cart.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove item from cart
app.delete("/cart/:cartId/:productId", async (req, res) => {
  const { cartId, productId } = req.params;

  try {
    await pool.query(
      "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, productId]
    );

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================== 🛠 ADMIN PRODUCT CRUD ================== */

// Get all products
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY name ASC");
    res.json({ products: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Category section
app.get("/products/category/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE category = $1 ORDER BY name ASC",
      [category]
    );

    res.json({ products: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Add a new product
app.post("/products", async (req, res) => {
  const { name, price, image, category } = req.body;
  if (!name || !price || !image || !category) {
    return res.status(400).json({ message: "All fields required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO products (name, price, image, category) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, parseFloat(price), image, category]
    );
    res.json({ message: "Product added", product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding product" });
  }
});

// Update a product
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, image, category } = req.body;

  try {
    await pool.query(
      "UPDATE products SET name = $1, price = $2, image = $3, category = $4 WHERE id = $5",
      [name, price, image, category, id]
    );

    res.json({ message: "Product updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product" });
  }
});

// Delete a product
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);

    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
