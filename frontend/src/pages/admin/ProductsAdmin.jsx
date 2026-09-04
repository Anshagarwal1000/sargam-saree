import { useEffect, useMemo, useState } from "react";
import { getAdminToken } from "../../lib/auth";
import {
  apiCreateProduct,
  apiDeleteProduct,
  apiGetCategories,
  apiGetProducts,
  apiUpdateCategory,
  apiUpdateProduct,
} from "../../lib/api";

export default function ProductsAdmin() {
  const token = getAdminToken();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    sku: "",
    modelNumber: "",
    batchSize: 3,
    priceMin: "",
    priceMax: "",
    description: "",
    images: [],
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [cats, prods] = await Promise.all([
        apiGetCategories(),
        apiGetProducts(),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch (e) {
      setError(e.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = new FormData();
    payload.append("categoryId", form.categoryId);
    payload.append("name", form.name);
    payload.append("sku", form.sku || "");
    payload.append("modelNumber", form.modelNumber);
    payload.append("batchSize", String(Number(form.batchSize)));
    payload.append("priceMin", String(Number(form.priceMin)));
    payload.append("priceMax", String(Number(form.priceMax)));
    payload.append("description", form.description || "");
    payload.append("isActive", String(Boolean(form.isActive)));
    if (isEditing) payload.append("images", JSON.stringify(form.existingImages || []));
    form.images.forEach((image) => payload.append("images", image));

    try {
      if (isEditing) {
        await apiUpdateProduct({ token, id: editingId, data: payload });
      } else {
        await apiCreateProduct({ token, data: payload });
      }

      setEditingId(null);
      setForm({
        categoryId: "",
        name: "",
        sku: "",
        modelNumber: "",
        batchSize: 3,
        priceMin: "",
        priceMax: "",
        description: "",
        images: [],
        existingImages: [],
        isActive: true,
      });
      await loadAll();
    } catch (err) {
      setError(err.message || "Save failed");
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    setError("");
    try {
      await apiDeleteProduct({ token, id });
      if (editingId === id) setEditingId(null);
      await loadAll();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  async function makeCategoryCover(categoryId, imageUrl) {
    setError("");
    try {
      await apiUpdateCategory({ token, id: categoryId, data: { coverImage: imageUrl } });
      await loadAll();
    } catch (err) {
      setError(err.message || "Could not update category cover");
    }
  }

  return (
    <main style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2>Admin - Products</h2>
        <a
          href="/admin/categories"
          style={{ color: "#0b57d0", fontWeight: 700, alignSelf: "center" }}
        >
          Go to Categories
        </a>
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          marginTop: 14,
          display: "grid",
          gap: 10,
          padding: 14,
          border: "1px solid #eee",
          borderRadius: 12,
          background: "white",
        }}
      >
        <h3 style={{ margin: 0 }}>{isEditing ? "Edit Product" : "Add Product"}</h3>

        <label style={{ display: "grid", gap: 6 }}>
          Category
          <select
            value={form.categoryId}
            onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Product Name
          <input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          SKU / Code
          <input
            value={form.sku}
            onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Model Number
          <input
            value={form.modelNumber}
            onChange={(e) => setForm((s) => ({ ...s, modelNumber: e.target.value }))}
            required
            placeholder="e.g. SS-104"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Wholesale Batch Size
          <input
            value={form.batchSize}
            onChange={(e) => setForm((s) => ({ ...s, batchSize: e.target.value }))}
            required
            type="number"
            min="1"
            step="1"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Wholesale Price Range
          <input
            value={form.priceMin}
            onChange={(e) => setForm((s) => ({ ...s, priceMin: e.target.value }))}
            required
            type="number"
            min="0"
            step="1"
            placeholder="Minimum, e.g. 500"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <input
            value={form.priceMax}
            onChange={(e) => setForm((s) => ({ ...s, priceMax: e.target.value }))}
            required
            type="number"
            min="0"
            step="1"
            placeholder="Maximum, e.g. 700"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Saree Photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setForm((s) => ({ ...s, images: Array.from(e.target.files || []) }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <small>Choose up to 8 photos from your phone. Each photo can be up to 8 MB.</small>
          {form.existingImages?.length ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {form.existingImages.map((image, index) => (
                <div key={image} style={{ position: "relative" }}>
                  <img src={image} alt={`Product photo ${index + 1}`} style={{ width: 90, height: 70, objectFit: "cover", borderRadius: 8 }} />
                  <button
                    type="button"
                    onClick={() => setForm((s) => ({ ...s, existingImages: s.existingImages.filter((_, imageIndex) => imageIndex !== index) }))}
                    style={{ position: "absolute", top: 3, right: 3, border: 0, borderRadius: "50%", background: "#fff", color: "crimson", cursor: "pointer" }}
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Description
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((s) => ({ ...s, description: e.target.value }))
            }
            rows={3}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={Boolean(form.isActive)}
            onChange={(e) =>
              setForm((s) => ({ ...s, isActive: e.target.checked }))
            }
          />
          Active
        </label>

        {error ? <div style={{ color: "crimson" }}>{error}</div> : null}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#111",
              color: "white",
              cursor: "pointer",
            }}
          >
            {isEditing ? "Update" : "Create"}
          </button>
          {isEditing ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  categoryId: "",
                  name: "",
                  sku: "",
                  modelNumber: "",
                  batchSize: 3,
                  priceMin: "",
                  priceMax: "",
                  description: "",
                  images: [],
                  existingImages: [],
                  isActive: true,
                });
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 10 }}>Product List</h3>

        {loading ? <p>Loading...</p> : null}
        {!loading && products.length === 0 ? <p>No products yet.</p> : null}

        {!loading && products.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {products.map((p) => (
              <div
                key={p._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 12,
                  background: "white",
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <div>
                    {p.images && p.images.length > 0 ? (
                      <div>
                        <div style={{ position: "relative" }}>
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            style={{ width: 110, height: 80, objectFit: "cover", borderRadius: 10 }}
                          />
                          {p.categoryId?.coverImage === p.images[0] ? (
                            <span style={{ position: "absolute", left: 5, bottom: 5, padding: "2px 5px", borderRadius: 4, background: "#912d43", color: "white", fontSize: 10, fontWeight: 700 }}>
                              COVER
                            </span>
                          ) : null}
                        </div>
                        {p.images.length > 1 ? (
                          <div style={{ display: "flex", gap: 5, marginTop: 7, maxWidth: 110, overflowX: "auto" }}>
                            {p.images.map((image, imageIndex) => (
                              <button
                                key={image}
                                type="button"
                                title="Make this photo the category cover"
                                aria-label={`Make photo ${imageIndex + 1} the category cover`}
                                onClick={() => makeCategoryCover(p.categoryId?._id || p.categoryId, image)}
                                style={{ flex: "0 0 auto", position: "relative", padding: 0, border: p.categoryId?.coverImage === image ? "2px solid #912d43" : "2px solid transparent", borderRadius: 5, background: "transparent", cursor: "pointer" }}
                              >
                                <img src={image} alt={`Photo ${imageIndex + 1}`} style={{ display: "block", width: 30, height: 25, objectFit: "cover", borderRadius: 3 }} />
                              </button>
                            ))}
                          </div>
                        ) : null}
                        <small style={{ display: "block", marginTop: 5, color: "#666", fontSize: 11 }}>Tap a thumbnail to set cover</small>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 110,
                          height: 80,
                          borderRadius: 10,
                          background: "#fafafa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#888",
                        }}
                      >
                        No image
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 900 }}>{p.name}</div>
                        {p.sku ? (
                          <div style={{ color: "#666", fontSize: 13 }}>SKU: {p.sku}</div>
                        ) : null}
                        <div style={{ color: "#666", fontSize: 13 }}>
                          Model: {p.modelNumber || p.sku || "-"} · Pack of {p.batchSize || 1}
                        </div>
                        <div style={{ marginTop: 6, fontWeight: 900 }}>
                          ₹{Number(p.priceMin ?? p.price).toLocaleString("en-IN")}
                          {p.priceMax != null && Number(p.priceMax) !== Number(p.priceMin ?? p.price)
                            ? ` - ₹${Number(p.priceMax).toLocaleString("en-IN")}`
                            : ""}
                        </div>
                        {p.description ? (
                          <div style={{ marginTop: 6, color: "#666", fontSize: 14 }}>
                            {p.description.length > 120
                              ? p.description.slice(0, 120) + "..."
                              : p.description}
                          </div>
                        ) : null}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(p._id);
                            const categoryId =
                              typeof p.categoryId === "string"
                                ? p.categoryId
                                : p.categoryId?._id || "";
                            setForm({
                              categoryId,
                              name: p.name || "",
                              sku: p.sku || "",
                              modelNumber: p.modelNumber || p.sku || "",
                              batchSize: p.batchSize ?? 1,
                              priceMin: p.priceMin ?? p.price ?? "",
                              priceMax: p.priceMax ?? p.price ?? "",
                              description: p.description || "",
                              images: [],
                              existingImages: p.images || [],
                              isActive: Boolean(p.isActive),
                            });
                          }}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "1px solid #ddd",
                            background: "white",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(p._id)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "1px solid #ddd",
                            background: "white",
                            cursor: "pointer",
                            color: "crimson",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}

