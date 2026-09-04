import express from "express";
import Category from "../models/Category.js";
import { requireAdminAuth } from "./auth.js";

const router = express.Router();

// Public: list active categories
router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort("name");
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: create category
router.post("/", requireAdminAuth, async (req, res) => {
  try {
    const { name, slug, description, coverImage, isActive } = req.body;
    if (!name || !slug) {
      return res
        .status(400)
        .json({ message: "Name and slug are required for category" });
    }
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Slug already in use" });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      coverImage,
      isActive: isActive ?? true,
    });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: update category
router.put("/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const category = await Category.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: delete category
router.delete("/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

