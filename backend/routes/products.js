import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { requireAdminAuth } from "./auth.js";

const router = express.Router();

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 8, fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) callback(null, true);
    else callback(new Error("Only image files are allowed"));
  },
});

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function uploadToCloudinary(file) {
  configureCloudinary();
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return Promise.reject(new Error("Cloudinary environment variables are not configured"));
  }
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: "sargam-sarees/products", resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    upload.end(file.buffer);
  });
}

async function uploadedImageUrls(req) {
  return Promise.all((req.files || []).map(uploadToCloudinary));
}

function parseImages(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => parseImages(item));
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Public: list products (optionally by category slug)
router.get("/", async (req, res) => {
  try {
    const { category: categorySlug, search, sort = "newest" } = req.query;

    let filter = { isActive: true };

    if (categorySlug) {
      const category = await Category.findOne({
        slug: categorySlug,
        isActive: true,
      });
      if (!category) {
        return res.json([]);
      }
      filter.categoryId = category._id;
    }

    if (search) {
      const modelSearch = { $regex: search.trim(), $options: "i" };
      filter.$or = [{ modelNumber: modelSearch }, { sku: modelSearch }];
    }

    const sortOrder = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      model: { modelNumber: 1 },
    };

    const products = await Product.find(filter)
      .populate("categoryId", "name slug coverImage")
      .sort(sortOrder[sort] || sortOrder.newest);

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: create product
router.post("/", requireAdminAuth, imageUpload.array("images", 8), async (req, res) => {
  try {
    const {
      categoryId,
      name,
      sku,
      modelNumber,
      batchSize,
      price,
      priceMin,
      priceMax,
      description,
      images,
      isActive,
    } = req.body;

    const minimumPrice = Number(priceMin);
    const maximumPrice = Number(priceMax);
    if (!categoryId || !name || !modelNumber || priceMin == null || priceMax == null || batchSize == null) {
      return res
        .status(400)
        .json({ message: "categoryId, name, modelNumber, price range, and batchSize are required" });
    }
    if (!Number.isFinite(minimumPrice) || !Number.isFinite(maximumPrice) || minimumPrice < 0 || maximumPrice < minimumPrice) {
      return res.status(400).json({ message: "Enter a valid price range where the maximum is not less than the minimum" });
    }

    const product = await Product.create({
      categoryId,
      name,
      sku,
      modelNumber,
      batchSize,
      price: minimumPrice,
      priceMin: minimumPrice,
      priceMax: maximumPrice,
      description,
      images: [...parseImages(images), ...(await uploadedImageUrls(req))],
      isActive: isActive ?? true,
    });

    if (product.images[0]) {
      await Category.findOneAndUpdate(
        { _id: categoryId, $or: [{ coverImage: { $exists: false } }, { coverImage: "" }] },
        { coverImage: product.images[0] }
      );
    }

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: update product
router.put("/:id", requireAdminAuth, imageUpload.array("images", 8), async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (update.priceMin != null) update.price = update.priceMin;
    if (update.images != null) update.images = parseImages(update.images);
    if (req.files?.length) update.images = [...(update.images || []), ...(await uploadedImageUrls(req))];
    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: delete product
router.delete("/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

