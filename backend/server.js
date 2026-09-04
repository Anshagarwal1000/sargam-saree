import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import connectDB from "./database/db.js";
import authRouter from "./routes/auth.js";
import categoriesRouter from "./routes/categories.js";
import productsRouter from "./routes/products.js";

const app = express();
const port = process.env.PORT || 3000;
const uploadsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "uploads");

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

app.use("/api/admin", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Each image must be 8 MB or smaller" });
  }
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Upload failed. Please try again." });
});

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Sargam Saree API" });
});

app.listen(port, () => {
  connectDB();
  console.log(`Server listening at port ${port}`);
});
