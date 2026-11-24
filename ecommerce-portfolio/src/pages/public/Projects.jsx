import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Star,
  Check,
  ArrowUpDown,
  ChevronDown,
  MessageCircle,
} from "lucide-react";

import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import "./css/PublicProjects.css";

const fallbackStoreProducts = [
  {
    _id: "prod-1",
    id: "prod-1",
    slug: "aura-pro-wireless-headphones",
    title: "Aura Pro Wireless Noise-Cancelling Headphones",
    categoryName: "Electronics & Audio",
    shortDescription:
      "Studio-grade audio with active hybrid noise cancellation, 40-hour battery, and ultra-plush memory foam earcups.",
    price: 18500,
    salePrice: 14999,
    discountPercent: 19,
    stock: 25,
    inStock: true,
    rating: 4.9,
    numReviews: 38,
    isFeatured: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    ],
  },
  {
    _id: "prod-2",
    id: "prod-2",
    slug: "classic-chronograph-leather-watch",
    title: "Classic Chronograph Leather Watch",
    categoryName: "Watches & Accessories",
    shortDescription:
      "Timeless Japanese quartz movement encased in 316L stainless steel with genuine Italian leather strap.",
    price: 12500,
    salePrice: 9999,
    discountPercent: 20,
    stock: 18,
    inStock: true,
    rating: 4.8,
    numReviews: 24,
    isFeatured: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    ],
  },
  {
    _id: "prod-3",
    id: "prod-3",
    slug: "apex-velocity-running-shoes",
    title: "Apex Velocity Performance Running Shoes",
    categoryName: "Footwear & Sneakers",
    shortDescription:
      "Breathable engineered mesh with responsive carbon-infused foam sole for maximum energy return.",
    price: 14500,
    salePrice: 11999,
    discountPercent: 17,
    stock: 30,
    inStock: true,
    rating: 4.9,
    numReviews: 42,
    isFeatured: true,
    isNewArrival: true,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
  },
  {
    _id: "prod-4",
    id: "prod-4",
    slug: "oversized-heavyweight-hoodie",
    title: "Oversized Heavyweight Cotton Hoodie",
    categoryName: "Men's Apparel",
    shortDescription:
      "450 GSM French Terry 100% organic cotton hoodie with dropped shoulders and double-layered hood.",
    price: 6500,
    salePrice: 4999,
    discountPercent: 23,
    stock: 45,
    inStock: true,
    rating: 5.0,
    numReviews: 19,
    isFeatured: true,
    isNewArrival: true,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
    ],
  },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const SORT_OPTIONS = [
    { value: "default", label: "Sort by: Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      try {
        let response;
        try {
          response = await api.get("/products");
        } catch {
          response = await api.get("/projects/public");
        }

        const data = response?.data;
        const list = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];

        if (mounted) {
          if (list.length > 0) {
            setProducts(list);
          } else {
            setProducts(fallbackStoreProducts);
          }
        }
      } catch {
        if (mounted) {
          setProducts(fallbackStoreProducts);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const found = products
      .map((p) => p.categoryName || p.category?.name || p.category)
      .filter(Boolean);
    return ["All", ...new Set(found)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const list = products.filter((product) => {
      const cat = product.categoryName || product.category?.name || product.category || "";
      const matchesCategory =
        activeCategory === "All" ||
        cat.toLowerCase() === activeCategory.toLowerCase();

      const matchesSearch =
        !query ||
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        cat.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    if (sortBy === "price-low") {
      list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    return list;
  }, [products, activeCategory, search, sortBy]);

  return (
    <main className="public-products-page">
      {/* Hero Banner */}
      <section className="shop-header-banner">
        <div className="container">
          <div className="shop-header-inner">
            <span className="shop-eyebrow">OFFICIAL STORE CATALOG</span>
            <h1>Explore Premium Products</h1>
            <p>
              Hand-picked quality essentials with 7-day hassle-free returns and
              Cash on Delivery (COD) nationwide.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Toolbar */}
      <section className="container shop-content-section">
        {/* Search & Sort Toolbar */}
        <div className="shop-toolbar">
          <div className="shop-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="shop-sort-box-custom" ref={sortDropdownRef}>
            <button
              type="button"
              className={`shop-sort-trigger ${isSortOpen ? "active" : ""}`}
              onClick={() => setIsSortOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
            >
              <ArrowUpDown size={15} className="sort-icon-left" />
              <span className="sort-selected-label">
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Sort by: Featured"}
              </span>
              <ChevronDown size={14} className={`sort-chevron ${isSortOpen ? "open" : ""}`} />
            </button>

            {isSortOpen && (
              <div className="shop-sort-menu" role="listbox">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={sortBy === opt.value}
                    className={`shop-sort-item ${sortBy === opt.value ? "selected" : ""}`}
                    onClick={() => {
                      setSortBy(opt.value);
                      setIsSortOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value && <Check size={14} className="sort-check" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-pills-bar">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Count Indicator */}
        <div className="shop-meta-bar">
          <span>Showing <strong>{filteredProducts.length}</strong> products</span>
          <div className="shop-trust-indicator">
            <Check size={14} /> 100% Original Products • Fast Dispatch
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="shop-loading-state">
            <div className="spinner" />
            <p>Loading store collection...</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="shop-products-grid">
            {filteredProducts.map((product) => {
              const productId = product.slug || product._id || product.id;
              const imgUrl =
                product.images?.[0] ||
                product.image ||
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";

              const activePrice =
                product.salePrice && product.salePrice < product.price
                  ? product.salePrice
                  : product.price;

              const hasDiscount =
                product.salePrice && product.salePrice < product.price;

              const discount =
                product.discountPercent ||
                (hasDiscount
                  ? Math.round(
                      ((product.price - product.salePrice) / product.price) * 100
                    )
                  : 0);

              const whatsappText = `Hello EcoStore! I would like to inquire about: ${product.title} (Price: Rs. ${activePrice.toLocaleString()}). Is it in stock?`;
              const whatsappUrl = `https://wa.me/923213633473?text=${encodeURIComponent(
                whatsappText
              )}`;

              return (
                <article key={productId} className="product-card">
                  {/* Badges */}
                  <div className="product-badges">
                    {hasDiscount && (
                      <span className="badge-discount">-{discount}% OFF</span>
                    )}
                    {product.isBestSeller && (
                      <span className="badge-bestseller">Best Seller</span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <Link to={`/products/${productId}`} className="product-thumb">
                    <img src={imgUrl} alt={product.title} loading="lazy" />
                  </Link>

                  {/* Product Details */}
                  <div className="product-info">
                    <div className="product-category-row">
                      <span className="product-category">
                        {product.categoryName || product.category || "General"}
                      </span>
                      <span className="product-rating">
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        {product.rating || 5.0} ({product.numReviews || 12})
                      </span>
                    </div>

                    <h3 className="product-title">
                      <Link to={`/products/${productId}`}>
                        {product.title}
                      </Link>
                    </h3>

                    <p className="product-desc">
                      {product.shortDescription || product.description}
                    </p>

                    {/* Price Row */}
                    <div className="product-price-row">
                      <div className="price-stack">
                        <span className="current-price">
                          Rs. {activePrice.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="old-price">
                            Rs. {product.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <span className="stock-pill in-stock">
                        ✓ In Stock
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="product-card-actions">
                      <button
                        type="button"
                        className="btn-add-cart"
                        onClick={() => addToCart(product, 1)}
                      >
                        <ShoppingBag size={16} />
                        Add to Cart
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-whatsapp-mini"
                        title="Inquire via WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="shop-empty-state">
            <ShoppingBag size={54} />
            <h3>No products found</h3>
            <p>Try clearing your search filters to find what you're looking for.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
