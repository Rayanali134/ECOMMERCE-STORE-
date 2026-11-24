import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Loader2,
  Search,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import api from "../../services/api";

function formatPrice(val) {
  return "Rs. " + Number(val || 0).toLocaleString();
}

export default function Projects() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products", { params: { all: "true" } });
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : data.products || data.data || [];

      setProducts(list);
    } catch (err) {
      console.error("Fetch Products Error:", err);
      setError(
        err.response?.data?.message || "Failed to load products from store."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete product "${title || "this product"}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(id);
      await api.delete(`/products/${id}`);

      setProducts((current) =>
        current.filter((item) => (item._id || item.id) !== id)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete product.");
    } finally {
      setDeleting(null);
    }
  };

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const cat = p.categoryName || (typeof p.category === "string" ? p.category : p.category?.name);
      if (cat) set.add(cat);
    });
    return ["all", ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase().trim();
      const cat = (p.categoryName || (typeof p.category === "string" ? p.category : p.category?.name) || "").toLowerCase();
      const matchesCat = categoryFilter === "all" || cat === categoryFilter.toLowerCase();
      const matchesSearch =
        !q ||
        (p.title || p.name || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [products, search, categoryFilter]);

  const getStockStatus = (stock) => {
    const s = Number(stock || 0);
    if (s <= 0) {
      return (
        <span className="stock-pill out-of-stock">
          <AlertTriangle size={12} /> Out of Stock (0)
        </span>
      );
    }
    if (s <= 5) {
      return (
        <span className="stock-pill low-stock">
          <AlertTriangle size={12} /> Low Stock ({s})
        </span>
      );
    }
    return (
      <span className="stock-pill in-stock">
        <CheckCircle size={12} /> In Stock ({s})
      </span>
    );
  };

  return (
    <div className="admin-page">
      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <span className="dashboard-label">STORE INVENTORY</span>
          <h1>Products & Catalog</h1>
          <p>
            Manage store products, regular and sale pricing, stock counts, and variants.
          </p>
        </div>

        <Link to="/admin/products/create" className="admin-primary-btn">
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Filter & Search Bar */}
      <div className="orders-filter-bar">
        <div className="orders-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products by title, SKU, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="status-pills-row">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-pill ${categoryFilter === c ? "active" : ""}`}
              onClick={() => setCategoryFilter(c)}
            >
              <Filter size={12} /> {c === "all" ? "All Categories" : c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <Loader2 className="spin" size={28} />
          <span>Loading products catalog...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <Package size={44} />
          <h2>No Products Found</h2>
          <p>
            {search || categoryFilter !== "all"
              ? "No products match your search or filter."
              : "Get started by adding your first product to the store."}
          </p>

          <Link to="/admin/products/create" className="admin-primary-btn">
            <Plus size={17} />
            Create Product
          </Link>
        </div>
      ) : (
        <div className="project-admin-grid">
          {filteredProducts.map((p) => {
            const id = p._id || p.id;
            const img = p.images?.[0] || p.image;
            const categoryTitle =
              p.categoryName || (typeof p.category === "string" ? p.category : p.category?.name);

            return (
              <article className="project-admin-card" key={id}>
                <div className="project-admin-image">
                  {img ? (
                    <img
                      src={
                        img.startsWith("http")
                          ? img
                          : `http://localhost:5000${img}`
                      }
                      alt={p.title || p.name}
                    />
                  ) : (
                    <ShoppingBag size={40} />
                  )}

                  {/* Discount / Badges */}
                  <div className="card-floating-badges">
                    {p.salePrice && p.salePrice < p.price && (
                      <span className="badge-sale">
                        SAVE {Math.round(((p.price - p.salePrice) / p.price) * 100)}%
                      </span>
                    )}
                    {p.isFeatured && <span className="badge-feat">Featured</span>}
                    {p.isBestSeller && <span className="badge-best">Best Seller</span>}
                  </div>
                </div>

                <div className="project-admin-body">
                  <div className="product-card-top-row">
                    <span className="project-category">
                      {categoryTitle || "General"}
                    </span>
                    {getStockStatus(p.stock)}
                  </div>

                  <h3>{p.title || p.name}</h3>

                  {p.sku && <span className="product-sku">SKU: {p.sku}</span>}

                  <div className="product-price-display">
                    {p.salePrice && p.salePrice < p.price ? (
                      <>
                        <span className="sale-price">{formatPrice(p.salePrice)}</span>
                        <span className="old-price">{formatPrice(p.price)}</span>
                      </>
                    ) : (
                      <span className="regular-price">{formatPrice(p.price)}</span>
                    )}
                  </div>

                  <p>
                    {p.shortDescription ||
                      p.description?.slice(0, 90) ||
                      "No description provided."}
                  </p>

                  {/* Variants preview */}
                  {Array.isArray(p.variants) && p.variants.length > 0 && (
                    <div className="variants-preview-tags">
                      {p.variants.map((v, idx) => {
                        const opts = Array.isArray(v.options)
                          ? v.options
                          : typeof v.options === "string"
                          ? v.options.split(/[, ]+/).filter(Boolean)
                          : [];
                        if (opts.length === 0) return null;
                        return (
                          <span key={idx} className="variant-tag-pill">
                            {v.name}: {opts.slice(0, 3).join(", ")}
                            {opts.length > 3 ? "..." : ""}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="project-admin-actions">
                    <Link
                      to={`/admin/products/edit/${id}`}
                      className="icon-action edit"
                      title="Edit Product"
                    >
                      <Pencil size={17} />
                    </Link>

                    <Link
                      to={`/products/${id}`}
                      target="_blank"
                      className="icon-action"
                      title="View in Store"
                    >
                      <ExternalLink size={17} />
                    </Link>

                    <button
                      className="icon-action delete"
                      onClick={() => deleteProduct(id, p.title || p.name)}
                      disabled={deleting === id}
                      title="Delete Product"
                    >
                      {deleting === id ? (
                        <Loader2 className="spin" size={17} />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
