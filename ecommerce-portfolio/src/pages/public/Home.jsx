import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Star,
  Truck,
  RotateCcw,
  MessageCircle,
  Bot,
  Zap,
  CheckCircle2,
  Check,
  Heart,
  Eye,
  PhoneCall,
  Clock,
  PackageCheck,
  Award,
  X,
  Loader2,
} from "lucide-react";

import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import "./css/Home.css";

// High-end curated fallback products
const featuredProductsData = [
  {
    id: "prod-1",
    _id: "prod-1",
    slug: "aura-pro-wireless-headphones",
    title: "Aura Pro Wireless Hybrid ANC Headphones",
    category: "Electronics & Audio",
    categoryName: "Electronics & Audio",
    shortDescription:
      "Studio-grade 40mm neodymium drivers with active hybrid noise cancellation, 40-hour battery life, and ultra-plush memory foam ear cushions.",
    price: 18500,
    salePrice: 14999,
    discountPercent: 19,
    rating: 4.9,
    numReviews: 48,
    stock: 14,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    ],
    features: ["40h Battery", "ANC -40dB", "Memory Foam"],
    badge: "Best Seller",
  },
  {
    id: "prod-2",
    _id: "prod-2",
    slug: "classic-chronograph-leather-watch",
    title: "Classic Chronograph 316L Stainless Steel Watch",
    category: "Watches & Accessories",
    categoryName: "Watches & Accessories",
    shortDescription:
      "Precision Japanese quartz chronograph movement encased in 316L stainless steel with scratch-resistant sapphire crystal and genuine leather strap.",
    price: 12500,
    salePrice: 9999,
    discountPercent: 20,
    rating: 4.8,
    numReviews: 36,
    stock: 9,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    ],
    features: ["Sapphire Glass", "316L Steel", "5ATM Water"],
    badge: "Trending",
  },
  {
    id: "prod-3",
    _id: "prod-3",
    slug: "apex-velocity-running-shoes",
    title: "Apex Velocity Performance Athletic Sneakers",
    category: "Footwear & Sneakers",
    categoryName: "Footwear & Sneakers",
    shortDescription:
      "Breathable multi-layer engineered mesh with responsive carbon-plate energy cushioning and non-slip durable rubber traction.",
    price: 14500,
    salePrice: 11999,
    discountPercent: 17,
    rating: 4.9,
    numReviews: 52,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
    features: ["Carbon Plate", "Air-Mesh", "Anti-Skid Sole"],
    badge: "Popular",
  },
  {
    id: "prod-4",
    _id: "prod-4",
    slug: "minimalist-leather-bifold-wallet",
    title: "Minimalist Full-Grain Italian Leather Wallet",
    category: "Men's Fashion",
    categoryName: "Men's Fashion",
    shortDescription:
      "Handcrafted genuine full-grain leather with RFID-blocking lining, 8 card slots, and dual currency compartments for timeless elegance.",
    price: 4500,
    salePrice: 3499,
    discountPercent: 22,
    rating: 4.9,
    numReviews: 64,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
    ],
    features: ["Full Grain Leather", "RFID Blocking", "8 Card Slots"],
    badge: "Hot Deal",
  },
];

// Curated Category Collections
const curatedCategories = [
  {
    id: "electronics",
    name: "Audio & Electronics",
    tagline: "ANC Headphones, Earbuds & Tech",
    count: "12+ Items",
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&q=80",
    link: "/products?category=Electronics",
  },
  {
    id: "watches",
    name: "Luxury Timepieces",
    tagline: "Chronographs & Automatic Watches",
    count: "8+ Items",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=80",
    link: "/products?category=Watches",
  },
  {
    id: "footwear",
    name: "Premium Footwear",
    tagline: "Performance Running & Street Style",
    count: "15+ Items",
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&q=80",
    link: "/products?category=Footwear",
  },
  {
    id: "lifestyle",
    name: "Leather & Lifestyle",
    tagline: "Handcrafted Wallets & Accessories",
    count: "10+ Items",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=80",
    link: "/products?category=Apparel",
  },
];

// Interactive AI Quick Prompts
const aiQuickPrompts = [
  { label: "⌚ Best Watch under Rs. 10,000", prompt: "Show me watches under Rs. 10,000" },
  { label: "🎧 Aura Pro Headphones Details", prompt: "Aura Pro Wireless headphones ki details aur price kya hai?" },
  { label: "👟 Running Shoes Recommendations", prompt: "Best running shoes under Rs. 12,000 dikhao" },
  { label: "🚚 COD & Delivery Time", prompt: "Delivery charges kya hain aur parcel kitne din me milta hai?" },
  { label: "🔄 7-Day Return & Refund Process", prompt: "Agar product pasand na aye to return aur refund ka kya tareeqa hai?" },
];

// Verified Customer Reviews
const customerReviews = [
  {
    name: "Hamza Tariq",
    city: "Lahore, Punjab",
    product: "Aura Pro Wireless Headphones",
    rating: 5,
    message:
      "Ordered on Cash on Delivery. Parcel arrived via TCS in just 2 days. Sound quality, ANC, and packaging are 100% genuine and luxurious. Highly recommend EcoStore!",
  },
  {
    name: "Zainab Malik",
    city: "Islamabad, F-10",
    product: "Apex Velocity Sneakers",
    rating: 5,
    message:
      "I was skeptical about shoe sizing, so I asked the Store AI Assistant and confirmed on WhatsApp. Support team was super friendly, and the shoes fit like a glove. 7-Day return guarantee gives real peace of mind.",
  },
  {
    name: "Bilal Ahmed",
    city: "Karachi, DHA Phase 6",
    product: "Classic Chronograph Watch",
    rating: 5,
    message:
      "Extremely sleek build, heavy stainless steel finish, and accurate dial. The COD checkout was smooth without any upfront deposit. 5 stars for authentic quality!",
  },
];

export default function Home() {
  const [products, setProducts] = useState(featuredProductsData);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  // Dynamic Verified Reviews
  const [reviews, setReviews] = useState(customerReviews);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    city: "",
    product: "",
    rating: 5,
    message: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await api.get("/products");
        if (isMounted) {
          const list = res.data?.products || res.data?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setProducts(list.slice(0, 4));
          }
        }
      } catch {
        // Keeps fallback products
      }

      // Load approved live store reviews
      try {
        const revRes = await api.get("/testimonials/public?featured=true");
        const revList = revRes.data?.testimonials || revRes.data?.data || [];
        if (isMounted && Array.isArray(revList) && revList.length > 0) {
          setReviews(revList);
        }
      } catch {
        // Fallback to customerReviews
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.message.trim()) {
      setReviewError("Please provide your name and review feedback.");
      return;
    }
    setSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");
    try {
      const res = await api.post("/testimonials", {
        name: reviewForm.name.trim(),
        city: reviewForm.city.trim() || "Pakistan",
        product: reviewForm.product.trim() || "EcoStore Order",
        rating: reviewForm.rating,
        message: reviewForm.message.trim(),
      });
      setReviewSuccess(
        res.data?.message ||
          "Shukriya! Aapka review submit ho gaya hai. Store admin ki verification ke baad yeh site par live ho jayega."
      );
      setReviewForm({ name: "", city: "", product: "", rating: 5, message: "" });
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess("");
      }, 3500);
    } catch (err) {
      setReviewError(
        err.response?.data?.message || "Review submit nahi ho saka. Dobara koshish karein."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const triggerAIChat = (promptText) => {
    window.dispatchEvent(
      new CustomEvent("open-ai-chat", {
        detail: { prompt: promptText },
      })
    );
  };

  const handleAddToCart = (product) => {
    const prodId = product._id || product.id || product.slug;
    addToCart(
      {
        _id: prodId,
        id: prodId,
        slug: product.slug,
        title: product.title,
        price: product.price,
        salePrice: product.salePrice,
        images: product.images || (product.image ? [product.image] : []),
        stock: product.stock,
      },
      1,
      {}
    );
    setAddedId(prodId);
    setTimeout(() => setAddedId(null), 1800);
  };

  const activeHeroProduct = featuredProductsData[activeHeroIndex] || featuredProductsData[0];

  return (
    <div className="home-elegant-root">
      {/* 1. LUXURY HERO SECTION */}
      <section className="hero-elegant-section">
        <div className="hero-ambient-glow" aria-hidden="true" />

        <div className="container hero-elegant-container">
          {/* Left Column: Headline & Value Prop */}
          <div className="hero-text-block">
            <div className="hero-pill-badge">
              <span className="badge-sparkle-dot" />
              <span>NATIONWIDE CASH ON DELIVERY • 2-4 DAYS DISPATCH</span>
            </div>

            <h1 className="hero-main-title">
              Curated Luxury Goods,
              <span className="hero-gradient-text"> Crafted For Perfection.</span>
            </h1>

            <p className="hero-subtext">
              Discover studio-grade audio, Swiss-inspired chronographs, and
              performance athletic wear. Backed by our ironclad{" "}
              <strong>7-Day Doorstep Money-Back Guarantee</strong> and zero advance payment.
            </p>

            <div className="hero-cta-group">
              <Link to="/products" className="btn-luxury-primary">
                <span>Shop New Arrivals</span>
                <ArrowRight size={18} />
              </Link>

              <a
                href="https://wa.me/923213633473?text=Assalam-o-Alaikum%20EcoStore!%20I%20want%20to%20inquire%20about%20your%20products."
                target="_blank"
                rel="noreferrer"
                className="btn-luxury-whatsapp"
              >
                <MessageCircle size={18} />
                <span>WhatsApp (0321-3633473)</span>
              </a>

              <button
                type="button"
                className="btn-luxury-ai hide-mobile"
                onClick={() =>
                  triggerAIChat("Assalam-o-Alaikum! Mujhe products aur budget recommend karo.")
                }
                title="Ask Store AI Assistant"
              >
                <Bot size={17} />
                <span>Ask AI</span>
              </button>
            </div>

            {/* Social Proof Strip */}
            <div className="hero-social-proof">
              <div className="proof-avatars">
                <span className="avatar-dot av-1">H</span>
                <span className="avatar-dot av-2">Z</span>
                <span className="avatar-dot av-3">B</span>
                <span className="avatar-dot av-4">A</span>
              </div>
              <div className="proof-text">
                <div className="proof-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                  <strong>4.9/5 Rating</strong>
                </div>
                <span>Trusted by 2,800+ Shoppers Across Pakistan</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Showcase Card */}
          <div className="hero-showcase-block">
            <div className="luxury-product-showcase">
              {/* Top Tag */}
              <div className="showcase-top-bar">
                <span className="showcase-tag-sale">SAVE {activeHeroProduct.discountPercent}%</span>
                <span className="showcase-tag-stock">In Stock • Official Store</span>
              </div>

              {/* Showcase Image with Floating Badges */}
              <div className="showcase-img-wrap">
                <img
                  src={activeHeroProduct.images[0]}
                  alt={activeHeroProduct.title}
                  className="showcase-main-img"
                />

                {/* Floating Glass Badges */}
                <div className="showcase-float-badge badge-top">
                  <Truck size={15} />
                  <div>
                    <strong>Express Courier</strong>
                    <small>2-4 Days (TCS & Leopards)</small>
                  </div>
                </div>

                <div className="showcase-float-badge badge-bottom">
                  <RotateCcw size={15} />
                  <div>
                    <strong>7-Day Returns</strong>
                    <small>100% Money-Back</small>
                  </div>
                </div>
              </div>

              {/* Showcase Details */}
              <div className="showcase-info-bar">
                <span className="showcase-cat-name">{activeHeroProduct.category}</span>
                <h3 className="showcase-product-title">{activeHeroProduct.title}</h3>

                <div className="showcase-pricing-row">
                  <div className="showcase-prices">
                    <span className="current-price">
                      Rs. {Number(activeHeroProduct.salePrice).toLocaleString()}
                    </span>
                    <span className="old-price">
                      Rs. {Number(activeHeroProduct.price).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="showcase-btn-buy"
                    onClick={() => handleAddToCart(activeHeroProduct)}
                  >
                    <ShoppingBag size={15} />
                    <span>{addedId === activeHeroProduct.id ? "Added ✓" : "Quick Add to Bag"}</span>
                  </button>
                </div>
              </div>

              {/* Product Preview Selector Switcher */}
              <div className="showcase-switcher">
                {featuredProductsData.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`switcher-pill ${activeHeroIndex === idx ? "active" : ""}`}
                    onClick={() => setActiveHeroIndex(idx)}
                  >
                    <span>{p.badge || p.category.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION STRIP (PERKS) */}
      <section className="perks-strip-section">
        <div className="container perks-grid">
          <div className="perk-card">
            <div className="perk-icon-wrap icon-emerald">
              <Truck size={22} />
            </div>
            <div className="perk-text">
              <strong>Express Delivery</strong>
              <span>2-4 Days nationwide via TCS & Leopards</span>
            </div>
          </div>

          <div className="perk-card">
            <div className="perk-icon-wrap icon-indigo">
              <RotateCcw size={22} />
            </div>
            <div className="perk-text">
              <strong>7-Day Easy Return</strong>
              <span>Zero-risk doorstep inspection & full refund</span>
            </div>
          </div>

          <div className="perk-card">
            <div className="perk-icon-wrap icon-amber">
              <PackageCheck size={22} />
            </div>
            <div className="perk-text">
              <strong>Cash on Delivery (COD)</strong>
              <span>Pay cash upon parcel arrival at your home</span>
            </div>
          </div>

          <div className="perk-card">
            <div className="perk-icon-wrap icon-rose">
              <PhoneCall size={22} />
            </div>
            <div className="perk-text">
              <strong>24/7 WhatsApp Hotline</strong>
              <span>Direct support from our team (+92 321 3633473)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED DEPARTMENTS (CATEGORIES) */}
      <section className="categories-elegant-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-pill-tag">CURATED COLLECTIONS</span>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-desc">
                Explore handpicked luxury collections tailored for your lifestyle.
              </p>
            </div>
            <Link to="/products" className="section-view-all-btn">
              <span>View Full Catalog</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="categories-grid-container">
            {curatedCategories.map((cat) => (
              <Link to={cat.link} key={cat.id} className="category-modern-card">
                <div className="category-img-container">
                  <img src={cat.image} alt={cat.name} loading="lazy" />
                  <div className="category-gradient-mask" />
                </div>

                <div className="category-card-meta">
                  <span className="category-items-count">{cat.count}</span>
                  <h3 className="category-card-name">{cat.name}</h3>
                  <p className="category-card-tagline">{cat.tagline}</p>
                  <span className="category-card-explore">
                    <span>Explore Collection</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (FLAGSHIP CATALOG) */}
      <section className="products-elegant-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-pill-tag">HANDPICKED DEALS</span>
              <h2 className="section-title">Featured Store Collection</h2>
              <p className="section-desc">
                High-demand flagship items with authentic customer reviews and warranty.
              </p>
            </div>
            <Link to="/products" className="section-view-all-btn">
              <span>See All Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="products-modern-grid">
            {products.map((prod) => {
              const prodId = prod._id || prod.id || prod.slug;
              const activePrice =
                prod.salePrice && prod.salePrice < prod.price
                  ? prod.salePrice
                  : prod.price;
              const hasDiscount = prod.salePrice && prod.salePrice < prod.price;
              const discountPercent =
                prod.discountPercent ||
                (hasDiscount
                  ? Math.round(((prod.price - prod.salePrice) / prod.price) * 100)
                  : 0);

              const imgUrl =
                prod.images?.[0] ||
                prod.image ||
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";

              return (
                <article key={prodId} className="product-clean-card">
                  {/* Thumbnail Wrap */}
                  <div className="product-clean-thumb">
                    <img src={imgUrl} alt={prod.title} loading="lazy" />

                    {discountPercent > 0 && (
                      <span className="badge-discount-tag">-{discountPercent}% OFF</span>
                    )}

                    <span className="badge-category-tag">
                      {prod.categoryName || prod.category || "Store Item"}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="product-clean-body">
                    <div className="product-clean-meta">
                      <div className="product-rating-box">
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span>{prod.rating || 4.9}</span>
                        <small>({prod.numReviews || 36})</small>
                      </div>

                      <span className="product-stock-indicator">
                        {prod.stock > 0 ? "In Stock" : "Limited Stock"}
                      </span>
                    </div>

                    <h3 className="product-clean-title">
                      <Link to={`/products/${prod.slug || prodId}`}>{prod.title}</Link>
                    </h3>

                    <p className="product-clean-description">
                      {prod.shortDescription ||
                        prod.description ||
                        "Premium quality e-commerce product."}
                    </p>

                    <div className="product-clean-pricing">
                      <span className="price-bold">
                        Rs. {Number(activePrice).toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="price-muted">
                          Rs. {Number(prod.price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="product-clean-actions">
                      <button
                        type="button"
                        className="btn-card-add"
                        onClick={() => handleAddToCart(prod)}
                      >
                        <ShoppingBag size={15} />
                        <span>{addedId === prodId ? "Added to Cart! ✓" : "Add to Cart"}</span>
                      </button>

                      <Link
                        to={`/products/${prod.slug || prodId}`}
                        className="btn-card-view"
                        title="View Details & Reviews"
                      >
                        <Eye size={15} />
                        <span>Details</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE STORE AI CONCIERGE BANNER */}
      <section className="ai-concierge-teaser-section">
        <div className="container">
          <div className="ai-teaser-elegant-card">
            <div className="ai-teaser-content">
              <div className="ai-teaser-badge">
                <Bot size={18} />
                <span>24/7 LIVE STORE AI CONCIERGE</span>
              </div>

              <h2>Looking For Something Within Your Exact Budget?</h2>
              <p>
                Ask our intelligent Store AI in Roman Urdu or English. Instantly discover live product
                pricing, sizes, delivery time, and COD details!
              </p>

              <div className="ai-pills-container">
                {aiQuickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="ai-suggestion-chip"
                    onClick={() => triggerAIChat(item.prompt)}
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={13} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY SHOP WITH US (TRUST PILLARS) */}
      <section className="why-us-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-pill-tag">PEACE OF MIND</span>
            <h2 className="section-title">Why Thousands Choose EcoStore</h2>
            <p className="section-desc">
              We make shopping online across Pakistan 100% risk-free, transparent, and enjoyable.
            </p>
          </div>

          <div className="why-us-grid">
            <div className="why-us-card">
              <div className="why-icon-box">
                <ShieldCheck size={28} />
              </div>
              <h3>100% Authentic Products</h3>
              <p>
                Every single item in our catalog is inspected for quality, genuine materials, and
                durability before dispatch.
              </p>
            </div>

            <div className="why-us-card">
              <div className="why-icon-box">
                <RotateCcw size={28} />
              </div>
              <h3>7-Day Doorstep Returns</h3>
              <p>
                If you aren't completely thrilled with your order, simply reach out. We process
                swaps or full refunds within 24 hours.
              </p>
            </div>

            <div className="why-us-card">
              <div className="why-icon-box">
                <Truck size={28} />
              </div>
              <h3>Zero Advance Deposit</h3>
              <p>
                Pay via Cash on Delivery (COD) right at your doorstep. We never demand advance
                card payments or upfront deposits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. VERIFIED BUYER STORIES (CUSTOMER REVIEWS) */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-pill-tag">VERIFIED REVIEWS</span>
            <h2 className="section-title">Loved Across Pakistan</h2>
            <p className="section-desc">
              Real feedback from verified shoppers who ordered on Cash on Delivery.
            </p>
          </div>

          <div className="testimonials-grid">
            {reviews.map((rev, idx) => (
              <div key={rev.id || idx} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-stars">
                    {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                      <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  {rev.verified !== false && (
                    <span className="verified-badge">Verified Buyer</span>
                  )}
                </div>

                <p className="testimonial-text">"{rev.message}"</p>

                <div className="testimonial-author">
                  <div className="author-avatar">
                    {((rev.name || "C").charAt(0)).toUpperCase()}
                  </div>
                  <div>
                    <strong>{rev.name}</strong>
                    <span>
                      {[rev.city, rev.product ? `Purchased ${rev.product}` : null]
                        .filter(Boolean)
                        .join(" • ") || "Verified Customer"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="review-action-row">
            <button
              type="button"
              className="btn-write-review"
              onClick={() => {
                setShowReviewModal(true);
                setReviewSuccess("");
                setReviewError("");
              }}
            >
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>Write a Review / Share Your Experience</span>
            </button>
          </div>
        </div>
      </section>

      {/* Customer Review Submission Modal */}
      {showReviewModal && (
        <div className="review-modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <div>
                <span className="section-pill-tag" style={{ margin: 0 }}>CUSTOMER FEEDBACK</span>
                <h3>Share Your Experience</h3>
              </div>
              <button
                type="button"
                className="review-modal-close"
                onClick={() => setShowReviewModal(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {reviewSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 10px" }}>
                <CheckCircle2 size={42} color="#10b981" style={{ margin: "0 auto 12px" }} />
                <h4 style={{ color: "#ffffff", fontSize: 18, margin: "0 0 8px" }}>
                  Review Received!
                </h4>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>
                  {reviewSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                {reviewError && (
                  <div style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, color: "#fca5a5", fontSize: 12.5, marginBottom: 14 }}>
                    {reviewError}
                  </div>
                )}

                <div className="review-form-field">
                  <label>Your Overall Rating</label>
                  <div className="star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="star-pick-btn"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        aria-label={`${star} star`}
                      >
                        <Star
                          size={24}
                          fill={star <= reviewForm.rating ? "#f59e0b" : "transparent"}
                          color={star <= reviewForm.rating ? "#f59e0b" : "#475569"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="review-form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rayan Ali"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  />
                </div>

                <div className="review-form-field">
                  <label>City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    value={reviewForm.city}
                    onChange={(e) => setReviewForm({ ...reviewForm, city: e.target.value })}
                  />
                </div>

                <div className="review-form-field">
                  <label>Product Purchased (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Aura Pro Wireless Headphones"
                    value={reviewForm.product}
                    onChange={(e) => setReviewForm({ ...reviewForm, product: e.target.value })}
                  />
                </div>

                <div className="review-form-field">
                  <label>Your Review / Experience *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about the product quality, packaging, delivery speed, or overall experience..."
                    value={reviewForm.message}
                    onChange={(e) => setReviewForm({ ...reviewForm, message: e.target.value })}
                  />
                </div>

                <div className="review-notice-banner">
                  ℹ️ Store Policy: Genuine customer reviews are checked and approved by our store team to keep ratings authentic and spam-free.
                </div>

                <button
                  type="submit"
                  className="btn-submit-review"
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="btn-spinner" size={16} /> Submitting...
                    </>
                  ) : (
                    "Submit Review for Store"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 8. VIP DIRECT HOTLINE BANNER */}
      <section className="container vip-hotline-wrap">
        <div className="vip-banner-card">
          <div className="vip-banner-text">
            <span className="vip-badge-tag">DIRECT VIP ASSISTANCE</span>
            <h2>Need Sizing Advice or Have a Special Order?</h2>
            <p>
              Our team is live right now on WhatsApp. Talk directly with a human specialist
              for custom orders, bulk discounts, or tracking assistance.
            </p>

            <div className="vip-btn-row">
              <a
                href="https://wa.me/923213633473?text=Assalam-o-Alaikum%20EcoStore!%20I%20have%20an%20inquiry."
                target="_blank"
                rel="noreferrer"
                className="btn-vip-whatsapp"
              >
                <MessageCircle size={18} />
                <span>WhatsApp: +92 321 3633473</span>
              </a>

              <a
                href="mailto:rayanali0560@gmail.com?subject=EcoStore%20Customer%20Inquiry"
                className="btn-vip-email"
              >
                <span>Email: rayanali0560@gmail.com</span>
              </a>

              <Link to="/contact" className="btn-vip-contact">
                <span>Contact Page</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
