const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(url, { method = "GET", token, body } = {}) {
  const isFormData = body instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    let details = "";
    try {
      details = await res.text();
    } catch {
      // ignore
    }
    throw new Error(`Request failed: ${res.status} ${details}`.trim());
  }

  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

export async function apiLogin({ email, password }) {
  return request("/api/admin/login", { method: "POST", body: { email, password } });
}

export async function apiGetCategories() {
  return request("/api/categories");
}

export async function apiGetProducts({ categorySlug, search, sort } = {}) {
  const params = new URLSearchParams();
  if (categorySlug) params.set("category", categorySlug);
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  const query = params.toString();
  const qs = query ? `?${query}` : "";
  return request(`/api/products${qs}`);
}

export async function apiCreateCategory({ token, data }) {
  return request("/api/categories", { method: "POST", token, body: data });
}

export async function apiUpdateCategory({ token, id, data }) {
  return request(`/api/categories/${id}`, { method: "PUT", token, body: data });
}

export async function apiDeleteCategory({ token, id }) {
  return request(`/api/categories/${id}`, { method: "DELETE", token });
}

export async function apiCreateProduct({ token, data }) {
  return request("/api/products", { method: "POST", token, body: data });
}

export async function apiUpdateProduct({ token, id, data }) {
  return request(`/api/products/${id}`, { method: "PUT", token, body: data });
}

export async function apiDeleteProduct({ token, id }) {
  return request(`/api/products/${id}`, { method: "DELETE", token });
}

