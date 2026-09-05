import { useEffect, useState } from "react";
import { apiGetCategories, apiGetProducts } from "../lib/api";
import { useCart } from "../lib/cartContext";

function formatPriceRange(product) {
  const minimum = product.priceMin ?? product.price;
  const maximum = product.priceMax;
  const formattedMinimum = Number(minimum).toLocaleString("en-IN");
  return maximum != null && Number(maximum) !== Number(minimum)
    ? `₹${formattedMinimum} - ₹${Number(maximum).toLocaleString("en-IN")}`
    : `₹${formattedMinimum}`;
}

function ProductCard({ product }) {
  const images = product.images?.length ? product.images : [];
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();

  function showPreviousImage() {
    setActiveImage((current) => (current - 1 + images.length) % images.length);
  }

  function showNextImage() {
    setActiveImage((current) => (current + 1) % images.length);
  }

  return (
    <article className="product-card">
      {images.length ? (
        <div className="product-gallery">
          <img src={images[activeImage]} alt={`${product.name} photo ${activeImage + 1}`} />
          {images.length > 1 ? (
            <>
              <button type="button" className="gallery-arrow gallery-previous" onClick={showPreviousImage} aria-label="Previous photo">
                ‹
              </button>
              <button type="button" className="gallery-arrow gallery-next" onClick={showNextImage} aria-label="Next photo">
                ›
              </button>
              <div className="gallery-dots" aria-label={`${images.length} product photos`}>
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={index === activeImage ? "gallery-dot active" : "gallery-dot"}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show photo ${index + 1}`}
                  />
                ))}
              </div>
              <span className="gallery-counter">{activeImage + 1} / {images.length}</span>
            </>
          ) : null}
        </div>
      ) : (
        <div className="product-image-placeholder">Sargam Sarees</div>
      )}
      <div className="product-card-body">
        <div className="product-category">{product.categoryId?.name}</div>
        <h3>{product.name}</h3>
        <p className="model-number">Model {product.modelNumber || product.sku || "-"}</p>
        <div className="product-meta">
          <strong>{formatPriceRange(product)}</strong>
          <span>Pack of {product.batchSize || 1}</span>
        </div>
        {product.description ? <p className="product-description">{product.description}</p> : null}
        <button className="add-cart-button" type="button" onClick={() => addItem(product)}>
          Add {product.batchSize || 1} to cart <span>+</span>
        </button>
      </div>
    </article>
  );
}

export default function Catalog({ categorySlug = "", title = "Sargam Sarees" }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGetCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    apiGetProducts({ categorySlug, search, sort })
      .then((data) => mounted && setProducts(data || []))
      .catch((err) => mounted && setError(err.message || "Failed to load sarees"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [categorySlug, search, sort]);

  return (
    <section className="catalog-section">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow"><span /> SARGAM SAREES / WHOLESALE COLLECTION</p>
          <h1>{title}</h1>
          <p className="catalog-intro">Curated sarees, ready to ship in practical wholesale packs.</p>
        </div>
        <div className="catalog-count"><strong>{loading ? "..." : products.length}</strong> styles</div>
      </div>

      <div className="catalog-tools">
        <label className="search-field">
          <span>Search model number</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try SS-104"
          />
        </label>
        <label>
          <span>Category</span>
          <select
            value={categorySlug}
            onChange={(event) => {
              window.location.href = event.target.value ? `/category/${event.target.value}` : "/";
            }}
          >
            <option value="">All sarees</option>
            {categories.map((category) => (
              <option key={category._id} value={category.slug}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest arrivals</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="model">Model number</option>
          </select>
        </label>
      </div>

      {error ? <p className="catalog-message error-message">{error}</p> : null}
      {loading ? <p className="catalog-message">Loading sarees...</p> : null}
      {!loading && !error && products.length === 0 ? (
        <p className="catalog-message">No sarees match those filters.</p>
      ) : null}
      <div className="product-grid">
        {products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </section>
  );
}
