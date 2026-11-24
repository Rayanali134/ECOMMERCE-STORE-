
import { useEffect, useState } from "react";
import {
  Check,
  ArrowRight,
  Sparkles,
  Clock3,
  RefreshCw,
  Package as PackageIcon,
  LoaderCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./css/PublicPackages.css";

const parseFeatures = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // A plain text feature list is also supported.
    }
    return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const normalizePackage = (item) => ({
  id: item.id,
  name: item.name || "Business Package",
  description: item.description || "",
  price: Number(item.price) || 0,
  discount: Number(item.discount) || 0,
  currency: item.currency || "USD",
  billingType: item.billingType || item.billing_type || "one-time",
  deliveryDays: item.deliveryDays ?? item.delivery_days ?? "",
  revisions: item.revisions ?? "",
  features: parseFeatures(item.features),
  highlighted: Boolean(item.highlighted),
  seoTitle: item.seoTitle || item.seo_title || "",
});

const formatPrice = (amount, currency) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadPackages = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/packages/public");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.packages || response.data?.data || [];

        if (active) {
          setPackages(
            data
              .filter((item) => item.active === true || item.active === 1)
              .map(normalizePackage)
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Packages load nahi ho sake. Backend API check karein."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPackages();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="public-packages">
      <section className="pp-hero">
        <div className="pp-glow pp-glow-one" />
        <div className="pp-glow pp-glow-two" />

        <div className="pp-container pp-hero-content">
          <span className="pp-eyebrow">
            <PackageIcon size={16} />
            SIMPLE, TRANSPARENT PRICING
          </span>

          <h1>
            The right plan for
            <br />
            <span>your next big idea.</span>
          </h1>

          <p>
            Apne business ki requirements ke mutabiq package choose karein.
            Clear pricing, useful features aur professional development.
          </p>

          <a className="pp-hero-link" href="#available-packages">
            Explore packages <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section className="pp-pricing-section" id="available-packages">
        <div className="pp-container">
          <div className="pp-section-heading">
            <span className="pp-section-label">OUR PACKAGES</span>
            <h2>Choose your growth plan</h2>
            <p>
              Har package ko aapke project aur business goals ko madde
              nazar rakh kar design kiya gaya hai.
            </p>
          </div>

          {loading ? (
            <div className="pp-state">
              <LoaderCircle className="pp-spinner" size={32} />
              <p>Packages load ho rahe hain...</p>
            </div>
          ) : error ? (
            <div className="pp-state pp-error">
              <PackageIcon size={30} />
              <p>{error}</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="pp-state">
              <PackageIcon size={34} />
              <h3>Packages coming soon</h3>
              <p>Abhi koi active package available nahi hai.</p>
              <Link to="/contact" className="pp-button pp-button-primary">
                Request a custom quote <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="pp-grid">
              {packages.map((item) => {
                const finalPrice =
                  item.discount > 0 && item.discount <= 100
                    ? item.price * (1 - item.discount / 100)
                    : item.price;

                return (
                  <article
                    className={`pp-card ${
                      item.highlighted ? "pp-card-highlighted" : ""
                    }`}
                    key={item.id}
                  >
                    {item.highlighted && (
                      <div className="pp-popular">
                        <Sparkles size={13} />
                        MOST POPULAR
                      </div>
                    )}

                    <div className="pp-card-heading">
                      <div className="pp-package-icon">
                        <PackageIcon size={21} />
                      </div>

                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                    </div>

                    <div className="pp-price-block">
                      {item.discount > 0 && item.discount <= 100 && (
                        <span className="pp-discount">
                          {item.discount}% OFF
                        </span>
                      )}

                      <div className="pp-price">
                        <strong>
                          {formatPrice(finalPrice, item.currency)}
                        </strong>
                        {item.discount > 0 && item.discount <= 100 && (
                          <del>{formatPrice(item.price, item.currency)}</del>
                        )}
                      </div>

                      <span className="pp-billing">
                        {item.billingType === "monthly"
                          ? "Billed monthly"
                          : item.billingType === "yearly"
                          ? "Billed yearly"
                          : "One-time payment"}
                      </span>
                    </div>

                    <div className="pp-package-meta">
                      <div>
                        <Clock3 size={16} />
                        <span>
                          {item.deliveryDays !== "" &&
                          item.deliveryDays !== null
                            ? `${item.deliveryDays} day${Number(item.deliveryDays) === 1 ? "" : "s"} delivery`
                            : "Delivery as agreed"}
                        </span>
                      </div>

                      <div>
                        <RefreshCw size={16} />
                        <span>
                          {item.revisions !== "" &&
                          item.revisions !== null
                            ? `${item.revisions} revision${Number(item.revisions) === 1 ? "" : "s"}`
                            : "Revisions as agreed"}
                        </span>
                      </div>
                    </div>

                    <div className="pp-features-heading">WHAT'S INCLUDED</div>

                    <ul className="pp-features">
                      {item.features.length ? (
                        item.features.map((feature, index) => (
                          <li key={`${item.id}-${index}`}>
                            <span className="pp-check">
                              <Check size={14} />
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li>
                          <span className="pp-check">
                            <Check size={14} />
                          </span>
                          <span>Project requirements discussed with you</span>
                        </li>
                      )}
                    </ul>

                    <Link
                      to={`/contact?package=${encodeURIComponent(item.name)}`}
                      className={`pp-button ${
                        item.highlighted
                          ? "pp-button-primary"
                          : "pp-button-secondary"
                      }`}
                    >
                      Choose this package <ArrowRight size={16} />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="pp-custom-section">
        <div className="pp-container pp-custom-card">
          <div className="pp-custom-icon">
            <Sparkles size={25} />
          </div>

          <div className="pp-custom-copy">
            <span className="pp-section-label">NEED SOMETHING DIFFERENT?</span>
            <h2>Let’s create a custom package.</h2>
            <p>
              Agar aapki requirements kisi standard package mein fit nahi
              hotin, apna project discuss karein.
            </p>
          </div>

          <Link to="/contact" className="pp-button pp-button-primary">
            Get a custom quote <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Packages;
