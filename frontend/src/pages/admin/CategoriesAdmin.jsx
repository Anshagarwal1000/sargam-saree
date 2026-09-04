import { useEffect, useMemo, useState } from "react";
import { getAdminToken } from "../../lib/auth";
import {
  apiCreateCategory,
  apiDeleteCategory,
  apiGetCategories,
  apiUpdateCategory,
} from "../../lib/api";

export default function CategoriesAdmin() {
  const token = getAdminToken();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    coverImage: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  async function loadCategories() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetCategories();
      setCategories(data || []);
    } catch (e) {
      setError(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (isEditing) {
        await apiUpdateCategory({
          token,
          id: editingId,
          data: {
            ...form,
            isActive: Boolean(form.isActive),
          },
        });
      } else {
        await apiCreateCategory({
          token,
          data: {
            ...form,
            isActive: Boolean(form.isActive),
          },
        });
      }
      setForm({
        name: "",
        slug: "",
        description: "",
        coverImage: "",
        isActive: true,
      });
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err.message || "Save failed");
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this category?")) return;
    setError("");
    try {
      await apiDeleteCategory({ token, id });
      if (editingId === id) setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  return (
    <main style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Admin - Categories</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <a
            href="/admin/products"
            style={{ color: "#0b57d0", fontWeight: 700, alignSelf: "center" }}
          >
            Go to Products
          </a>
        </div>
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
        <h3 style={{ margin: 0 }}>{isEditing ? "Edit Category" : "Add Category"}</h3>
        <label style={{ display: "grid", gap: 6 }}>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          Slug (used in URL)
          <input
            value={form.slug}
            onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>
        <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
          The first photo added to a product in this category becomes its cover automatically.
          You can choose a different product photo from Products.
        </p>
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
            onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
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
                  name: "",
                  slug: "",
                  description: "",
                  coverImage: "",
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
        <h3 style={{ marginBottom: 10 }}>Category List</h3>

        {loading ? <p>Loading...</p> : null}
        {!loading && categories.length === 0 ? <p>No categories yet.</p> : null}

        {!loading && categories.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {categories.map((c) => (
              <div
                key={c._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 12,
                  background: "white",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{c.name}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      slug: {c.slug}
                      {c.description ? ` • ${c.description}` : ""}
                    </div>
                    {c.coverImage ? (
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={c.coverImage}
                          alt={c.name}
                          style={{
                            width: 120,
                            height: 70,
                            objectFit: "cover",
                            borderRadius: 10,
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(c._id);
                        setForm({
                          name: c.name || "",
                          slug: c.slug || "",
                          description: c.description || "",
                          coverImage: c.coverImage || "",
                          isActive: Boolean(c.isActive),
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
                      onClick={() => onDelete(c._id)}
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
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}

