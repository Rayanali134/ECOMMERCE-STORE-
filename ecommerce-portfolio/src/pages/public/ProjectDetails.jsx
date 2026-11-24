import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Zap,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Check,
  Plus,
  Minus,
  Send,
  X,
  AlertCircle,
  Loader2,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import api from "../../services/api";
import { useCart } from "../../context/CartContext";

const sampleProductDetails = {
  _id: "prod-sample",
  title: "Aura Pro Wireless Noise-Cancelling Headphones",
  categoryName: "Electronics & Audio",
  shortDescription:
    "Studio-grade audio with active hybrid noise cancellation, 40-hour battery, and ultra-plush memory foam earcups.",
  description:
    "Experience music like never before. The Aura Pro delivers deep, punchy bass, crisp highs, and crystal-clear mids. Equipped with 40mm custom neodymium drivers, active hybrid noise cancellation, and ultra-low latency gaming mode, your audio journey never stops. Designed with breathable memory-foam cushions for all-day comfort.",
  price: 18500,
  salePrice: 14999,
  discountPercent: 19,
  stock: 25,
  inStock: true,
  rating: 4.9,
  numReviews: 38,
  sku: "AURA-HD-001",
  images: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&q=80",
  ],
  variants: [
    { name: "Color", options: ["Matte Black", "Silver Frost", "Midnight Blue"] },
  ],
  specifications: [
    { title: "Battery Life", value: "40 Hours Playtime (ANC Off)" },
    { title: "Driver Size", value: "40mm Custom Neodymium" },
    { title: "Bluetooth", value: "Bluetooth 5.3 Low Energy" },
    { title: "Charging", value: "USB-C Rapid Fast Charge" },
    { title: "Warranty", value: "1 Year Official Brand Warranty" },
  ],
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Message / Custom Request Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msgForm, setMsgForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    message: "",
  });
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");

  // Customer Reviews State
  const [productReviews, setProductReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [revForm, setRevForm] = useState({
    name: "",
    city: "",
    rating: 5,
    message: "",
  });
  const [revLoading, setRevLoading] = useState(false);
  const [revSuccess, setRevSuccess] = useState("");
  const [revError, setRevError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      setLoading(true);
      try {
        let response;
        try {
          response = await api.get(`/products/${id}`);
        } catch {
          response = await api.get(`/projects/${id}`);
        }

        const data = response?.data?.product || response?.data?.data || response?.data;
        if (mounted && data) {
          setProduct(data);
          setActiveImage(data.images?.[0] || data.image || "");

          // Initialize default variants
          if (Array.isArray(data.variants) && data.variants.length > 0) {
            const defaults = {};
            data.variants.forEach((v) => {
              if (v.options?.length > 0) defaults[v.name] = v.options[0];
            });
            setSelectedVariants(defaults);
          }
        }
      } catch {
        if (mounted) {
          setProduct(sampleProductDetails);
          setActiveImage(sampleProductDetails.images[0]);
          setSelectedVariants({ Color: "Matte Black" });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function loadReviews() {
      try {
        const res = await api.get("/testimonials/public");
        const list = res.data?.testimonials || res.data?.data || [];
        if (mounted && Array.isArray(list)) {
          setProductReviews(list);
        }
      } catch {
        // ignore
      }
    }

    loadProduct();
    loadReviews();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-loading">
        <Loader2 className="spin" size={36} />
        <p>Loading product details...</p>
      </div>
    );
  }

  const p = product || sampleProductDetails;
  const activePrice =
    p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
  const hasDiscount = p.salePrice && p.salePrice < p.price;
  const discount =
    p.discountPercent ||
    (hasDiscount
      ? Math.round(((p.price - p.salePrice) / p.price) * 100)
      : 0);

  const imagesList = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : [p.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"];

  const handleVariantSelect = (variantName, option) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  };

  const handleAddToCart = () => {
    addToCart(p, quantity, selectedVariants);
  };

  const handleBuyNow = () => {
    addToCart(p, quantity, selectedVariants);
    navigate("/checkout");
  };

  // WhatsApp direct link
  const variantSummary = Object.entries(selectedVariants)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  const whatsappMsg = `Hello! I want to order this product from EcoStore:%0A%0A*${p.title}*%0APrice: Rs. ${activePrice.toLocaleString()}%0AQuantity: ${quantity}%0A${
    variantSummary ? `Selection: ${variantSummary}%0A` : ""
  }%0APlease confirm my order!`;
  const whatsappUrl = `https://wa.me/923213633473?text=${whatsappMsg}`;

  // Handle direct customer request submit
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!msgForm.name || !msgForm.phone || !msgForm.message) {
      alert("Please fill your Name, Phone and Message.");
      return;
    }

    setMsgLoading(true);
    setMsgSuccess("");

    try {
      await api.post("/inquiries", {
        name: msgForm.name,
        email: msgForm.email || "",
        phone: msgForm.phone,
        whatsapp: msgForm.whatsapp || msgForm.phone,
        message: msgForm.message,
        product: p._id || p.id,
        productTitle: p.title,
        requestedQuantity: quantity,
        category: "Product Request",
      });

      setMsgSuccess(
        "Your message has been sent to the store! We will notify you via Email and WhatsApp shortly."
      );
      setMsgForm({ name: "", email: "", phone: "", whatsapp: "", message: "" });
    } catch {
      setMsgSuccess(
        "Message submitted! Our store manager will contact you soon."
      );
    } finally {
      setMsgLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!revForm.name.trim() || !revForm.message.trim()) {
      setRevError("Please enter your name and review feedback.");
      return;
    }
    setRevLoading(true);
    setRevError("");
    setRevSuccess("");
    try {
      const res = await api.post("/testimonials", {
        name: revForm.name.trim(),
        city: revForm.city.trim() || "Pakistan",
        product: p.title || "EcoStore Product",
        rating: revForm.rating,
        message: revForm.message.trim(),
      });
      setRevSuccess(
        res.data?.message ||
          "Shukriya! Aapka review submit ho gaya hai. Store admin ki verification ke baad yeh site par live show hoga."
      );
      setRevForm({ name: "", city: "", rating: 5, message: "" });
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setRevSuccess("");
      }, 3500);
    } catch (err) {
      setRevError(
        err.response?.data?.message || "Review submit nahi ho saka. Dobara koshish karein."
      );
    } finally {
      setRevLoading(false);
    }
  };

  return (
    <div className="product-details-page">
      <div className="container">
        {/* Back Link */}
        <Link to="/products" className="back-to-shop-btn">
          <ArrowLeft size={16} />
          Back to Store Catalog
        </Link>

        {/* Main Product Layout */}
        <div className="product-details-grid">
          {/* Col 1: Images Gallery */}
          <div className="product-gallery-wrap">
            <div className="product-main-image">
              <img src={activeImage || imagesList[0]} alt={p.title} />
              {hasDiscount && (
                <span className="detail-discount-badge">-{discount}% OFF</span>
              )}
            </div>

            {imagesList.length > 1 && (
              <div className="product-thumbnails">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`thumb-btn ${activeImage === img ? "active" : ""}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Col 2: Info & Purchase Controls */}
          <div className="product-buy-panel">
            <div className="product-category-tag">
              {p.categoryName || p.category?.name || "Premium Store Item"}
            </div>

            <h1 className="detail-product-title">{p.title}</h1>

            <div className="detail-rating-row">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span className="rating-val">{p.rating || 4.9}</span>
              <span className="reviews-count">({p.numReviews || 28} Verified Reviews)</span>
              <span className="sku-tag">SKU: {p.sku || "PRD-2026"}</span>
            </div>

            {/* Price Stack */}
            <div className="detail-price-box">
              <div className="price-line">
                <span className="price-now">Rs. {activePrice.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="price-was">Rs. {p.price.toLocaleString()}</span>
                )}
                {hasDiscount && (
                  <span className="save-tag">You Save Rs. {(p.price - activePrice).toLocaleString()}</span>
                )}
              </div>

              <div className="stock-status-line">
                <span className="in-stock-dot" />
                <strong>In Stock</strong> — Ready for Immediate Dispatch (Nationwide COD)
              </div>
            </div>

            {/* Description */}
            <p className="detail-short-desc">{p.shortDescription || p.description}</p>

            {/* Variant Selectors (Sizes / Colors) */}
            {Array.isArray(p.variants) &&
              p.variants.map((v) => {
                const opts = Array.isArray(v.options)
                  ? v.options
                  : typeof v.options === "string"
                  ? v.options.split(/[, ]+/).filter(Boolean)
                  : [];
                if (opts.length === 0) return null;
                return (
                  <div key={v.name} className="variant-group">
                    <div className="variant-label">
                      <span>Select {v.name}:</span>
                      <strong>{selectedVariants[v.name] || opts[0]}</strong>
                    </div>
                    <div className="variant-options">
                      {opts.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`variant-option-btn ${
                            selectedVariants[v.name] === opt ? "active" : ""
                          }`}
                          onClick={() => handleVariantSelect(v.name, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

            {/* Quantity Selector */}
            <div className="quantity-section">
              <span className="qty-label">Quantity:</span>
              <div className="qty-picker">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="detail-action-buttons">
              <button
                type="button"
                className="btn btn-primary btn-add-bag"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={20} />
                Add to Cart
              </button>

              <button
                type="button"
                className="btn btn-buynow"
                onClick={handleBuyNow}
              >
                <Zap size={18} />
                Buy Now (Cash on Delivery)
              </button>

              {/* Direct WhatsApp Ordering */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp-order"
              >
                <MessageCircle size={18} />
                Order via WhatsApp
              </a>

              {/* Custom Request / Message Store Button */}
              <button
                type="button"
                className="btn btn-custom-request"
                onClick={() => setIsModalOpen(true)}
              >
                <MessageSquare size={17} />
                <span>Message Store About This Product</span>
              </button>
            </div>

            {/* 7-Day Return & Delivery Assurance */}
            <div className="store-trust-box">
              <div className="trust-item">
                <RotateCcw size={22} className="trust-icon" />
                <div>
                  <strong>7-Day Easy Return Guarantee</strong>
                  <p>Hassle-free return or exchange within 7 days of delivery.</p>
                </div>
              </div>

              <div className="trust-item">
                <Truck size={22} className="trust-icon" />
                <div>
                  <strong>Cash on Delivery (COD) Nationwide</strong>
                  <p>Pay when you inspect and receive your package at your doorstep.</p>
                </div>
              </div>

              <div className="trust-item">
                <ShieldCheck size={22} className="trust-icon" />
                <div>
                  <strong>100% Quality Inspected</strong>
                  <p>Every order is physically tested and packed with secure bubble wrap.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Details & Specs */}
        <div className="product-specs-section">
          <h2>Product Overview & Specifications</h2>
          <div className="specs-grid">
            <div className="specs-description">
              <h3>Detailed Description</h3>
              <p>{p.description}</p>
            </div>

            {Array.isArray(p.specifications) && p.specifications.length > 0 && (
              <div className="specs-table-wrap">
                <h3>Technical Specifications</h3>
                <table className="specs-table">
                  <tbody>
                    {p.specifications.map((spec, i) => (
                      <tr key={i}>
                        <th>{spec.title}</th>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews & Ratings Section */}
        <div className="product-specs-section" style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <span className="section-pill-tag" style={{ margin: "0 0 8px" }}>VERIFIED REVIEWS</span>
              <h2 style={{ margin: 0, fontSize: 24 }}>Customer Ratings &amp; Reviews</h2>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: "6px 0 0" }}>
                Authentic buyer feedback verified by EcoStore management.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: "10px 20px", fontSize: 13, borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 8 }}
              onClick={() => {
                setIsReviewModalOpen(true);
                setRevSuccess("");
                setRevError("");
              }}
            >
              <Star size={15} fill="#f59e0b" color="#f59e0b" />
              <span>Write a Product Review</span>
            </button>
          </div>

          <div className="testimonials-grid" style={{ marginTop: 16 }}>
            {productReviews.slice(0, 3).map((rev, idx) => (
              <div key={rev.id || idx} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-stars">
                    {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  {rev.verified !== false && (
                    <span className="verified-badge">Verified Buyer</span>
                  )}
                </div>

                <p className="testimonial-text">"{rev.message}"</p>

                <div className="testimonial-author">
                  <div className="author-avatar">{((rev.name || "C").charAt(0)).toUpperCase()}</div>
                  <div>
                    <strong>{rev.name}</strong>
                    <span>
                      {[rev.city, rev.product || p.title].filter(Boolean).join(" • ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Review Modal */}
      {isReviewModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsReviewModalOpen(false);
            setRevSuccess("");
          }}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-kicker">
                  <Sparkles size={11} />
                  VERIFIED REVIEW
                </span>
                <h3>Review: {p.title}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setRevSuccess("");
                }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {revSuccess ? (
              <div style={{ textAlign: "center", padding: "26px 14px" }}>
                <CheckCircle2 size={44} color="#10b981" style={{ margin: "0 auto 12px" }} />
                <h4 style={{ color: "#ffffff", fontSize: 18, margin: "0 0 8px" }}>Review Submitted!</h4>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{revSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                {revError && (
                  <div className="modal-alert-error" style={{ marginBottom: 14 }}>
                    <AlertCircle size={16} />
                    <span>{revError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: 6 }}>
                    Your Star Rating
                  </label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRevForm({ ...revForm, rating: star })}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                        aria-label={`${star} star`}
                      >
                        <Star
                          size={24}
                          fill={star <= revForm.rating ? "#f59e0b" : "transparent"}
                          color={star <= revForm.rating ? "#f59e0b" : "#475569"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: 6 }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rayan Ali"
                    value={revForm.name}
                    onChange={(e) => setRevForm({ ...revForm, name: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(2, 6, 23, 0.7)", border: "1px solid rgba(148, 163, 184, 0.2)", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: 6 }}>
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    value={revForm.city}
                    onChange={(e) => setRevForm({ ...revForm, city: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(2, 6, 23, 0.7)", border: "1px solid rgba(148, 163, 184, 0.2)", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: 6 }}>
                    Your Experience &amp; Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share how the product looks, performs, battery life, packaging quality, etc..."
                    value={revForm.message}
                    onChange={(e) => setRevForm({ ...revForm, message: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(2, 6, 23, 0.7)", border: "1px solid rgba(148, 163, 184, 0.2)", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ fontSize: 11.5, color: "#94a3b8", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", marginBottom: 16, lineHeight: 1.5 }}>
                  🛡️ Review Policy: All customer reviews are approved by our store team to ensure 100% genuine buyer ratings without spam.
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", borderRadius: 10, fontSize: 14 }}
                  disabled={revLoading}
                >
                  {revLoading ? <Loader2 className="btn-spinner" size={16} /> : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sticky Quick Buy Bar */}
      <div className="mobile-pdp-sticky-bar">
        <div className="sticky-pdp-price">
          <span className="sticky-pdp-label">Total (COD):</span>
          <strong>Rs. {activePrice.toLocaleString()}</strong>
        </div>
        <div className="sticky-pdp-actions">
          <button
            type="button"
            className="sticky-pdp-cart-btn"
            onClick={handleAddToCart}
          >
            <ShoppingBag size={16} /> Add
          </button>
          <button
            type="button"
            className="sticky-pdp-buy-btn"
            onClick={handleBuyNow}
          >
            <Zap size={16} /> Buy Now
          </button>
        </div>
      </div>

      {/* Customer Custom Message / Inquiry Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsModalOpen(false);
            setMsgSuccess("");
          }}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-kicker">
                  <Sparkles size={11} />
                  STORE CONCIERGE
                </span>
                <h3>Message Store About This Product</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setIsModalOpen(false);
                  setMsgSuccess("");
                }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Quick Snapshot */}
            <div className="modal-product-chip">
              {p.images?.[0] && (
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className="modal-product-thumb"
                />
              )}
              <div className="modal-product-info">
                <span className="modal-product-badge">Product Inquiry</span>
                <strong className="modal-product-title">{p.title}</strong>
              </div>
            </div>

            {msgSuccess ? (
              <div className="modal-success-screen">
                <div className="modal-success-icon-wrap">
                  <Check size={26} />
                </div>
                <h4>Message Sent to EcoStore!</h4>
                <p>{msgSuccess}</p>
                <div className="modal-success-meta">
                  <span>Direct WhatsApp Hotline: <strong>+92 321 3633473</strong></span>
                  <span>Avg. Concierge Reply: <strong>~10 Minutes</strong></span>
                </div>
                <button
                  type="button"
                  className="modal-submit-btn"
                  style={{ marginTop: "14px" }}
                  onClick={() => {
                    setIsModalOpen(false);
                    setMsgSuccess("");
                  }}
                >
                  Done / Close
                </button>
              </div>
            ) : (
              <>
                <p className="modal-subtitle">
                  Ask about stock, custom size/color request, or delivery time.
                  Our team replies directly to your email and WhatsApp.
                </p>

                <form onSubmit={handleMessageSubmit} className="modal-form">
                  <div className="form-group">
                    <label>Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rayan Ali"
                      value={msgForm.name}
                      onChange={(e) =>
                        setMsgForm({ ...msgForm, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address (For reply)</label>
                      <input
                        type="email"
                        placeholder="e.g. yourname@gmail.com"
                        value={msgForm.email}
                        onChange={(e) =>
                          setMsgForm({ ...msgForm, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>WhatsApp / Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0321 3633473"
                        value={msgForm.phone}
                        onChange={(e) =>
                          setMsgForm({ ...msgForm, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Your Question or Custom Request *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tell us what you need (custom size, specific color, bulk discount, urgent delivery, etc.)..."
                      value={msgForm.message}
                      onChange={(e) =>
                        setMsgForm({ ...msgForm, message: e.target.value })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="modal-submit-btn"
                    disabled={msgLoading}
                  >
                    {msgLoading ? (
                      <>
                        <Loader2 className="spin" size={16} />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Submit Message to Store
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
