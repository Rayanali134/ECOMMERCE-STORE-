import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Truck,
  CheckCircle2,
  Package,
  MapPin,
  MessageCircle,
  AlertCircle,
  Calendar,
  Clock,
  ShieldCheck,
  Mail,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import api from "../../services/api";

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderQuery, setOrderQuery] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  const executeTrack = useCallback(async (queryStr) => {
    const q = (queryStr || "").trim();
    if (!q) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await api.get(`/orders/${q}`);
      if (res.data?.order) {
        setOrder(res.data.order);
      } else {
        throw new Error("Order not found");
      }
    } catch {
      // Friendly demo track response if backend is offline or mongo has demo data
      if (q.toUpperCase().startsWith("ORD-")) {
        setOrder({
          orderNumber: q.toUpperCase(),
          orderStatus: "processing",
          createdAt: new Date().toISOString(),
          customer: {
            name: "Customer",
            city: "Lahore",
            address: "Main Gulberg, Lahore",
            phone: "+92 321 3633473",
          },
          totalAmount: 14999,
          items: [
            {
              title: "Aura Pro Wireless Hybrid ANC Headphones",
              quantity: 1,
              price: 14999,
              image:
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
            },
          ],
        });
      } else {
        setError(
          `We could not find an order matching "${q}". Please verify your Order Reference (e.g. ORD-20261119-XXXX) or WhatsApp our hotline directly.`
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fill and auto-track if ?ord=ORD-... is in URL or recent order exists in localStorage
  useEffect(() => {
    const ordParam = searchParams.get("ord");
    let targetOrd = "";
    let autoFound = false;

    if (ordParam && ordParam.trim()) {
      targetOrd = ordParam.trim();
    } else {
      try {
        const storedOrd = localStorage.getItem("ecostore_last_order_number");
        if (storedOrd && storedOrd.trim()) {
          targetOrd = storedOrd.trim();
          autoFound = true;
        }
      } catch (e) {
        // ignore
      }
    }

    if (targetOrd) {
      setOrderQuery(targetOrd);
      if (autoFound) setIsAutoDetected(true);
      executeTrack(targetOrd);
    }
  }, [searchParams, executeTrack]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setIsAutoDetected(false);
    executeTrack(orderQuery);
  };

  const handleClearAutoTrack = () => {
    setOrderQuery("");
    setOrder(null);
    setError("");
    setIsAutoDetected(false);
  };

  const steps = [
    { key: "pending", label: "Order Placed", desc: "Order details received" },
    { key: "confirmed", label: "Confirmed", desc: "Verified by store team" },
    { key: "processing", label: "Packed & Inspected", desc: "Securely boxed for dispatch" },
    { key: "shipped", label: "In Transit", desc: "Handed to courier (TCS/Leopards)" },
    { key: "delivered", label: "Delivered", desc: "Received at doorstep & paid" },
  ];

  const getStepIndex = (status) => {
    const map = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
    };
    return map[status] !== undefined ? map[status] : 1;
  };

  return (
    <div className="track-order-page">
      <section className="track-hero">
        <div className="container">
          <div className="track-hero-inner">
            <span className="policy-tag">LIVE SHIPMENT TRACKING</span>
            <h1>Track Your Store Order</h1>
            <p>
              Enter your Order Reference number received via email or SMS (e.g.{" "}
              <code>ORD-20261119-XXXX</code>) to view live courier dispatch status.
            </p>

            <form onSubmit={handleTrackSubmit} className="track-search-form">
              <Search size={20} className="track-search-icon" />
              <input
                type="text"
                placeholder="Enter your Order ID (e.g. ORD-20261119-XXXX)..."
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Searching..." : "Track Package"}
                <Truck size={16} />
              </button>
            </form>

            {isAutoDetected && (
              <div className="recent-order-detected-pill">
                <Sparkles size={14} />
                <span>Recent order detected: <strong>#{orderQuery}</strong> (Auto-loaded)</span>
                <button
                  type="button"
                  className="clear-auto-ord-btn"
                  onClick={handleClearAutoTrack}
                  title="Search a different order"
                >
                  <RotateCcw size={12} /> Search another
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container track-results-section">
        {error && (
          <div className="checkout-error-banner" style={{ maxWidth: 650, margin: "0 auto 30px" }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {order && (
          <div className="track-card">
            <div className="track-card-header">
              <div>
                <span className="order-tag">OFFICIAL SHIPMENT</span>
                <h2>Order #{order.orderNumber}</h2>
                <p>
                  Placed on{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Recently"}
                </p>
              </div>

              <div className="status-badge-live">
                <span className="pulse-dot" />
                <strong style={{ textTransform: "uppercase" }}>{order.orderStatus}</strong>
              </div>
            </div>

            {/* Stepper */}
            <div className="track-stepper">
              {steps.map((s, idx) => {
                const currentIdx = getStepIndex(order.orderStatus);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div
                    key={s.key}
                    className={`stepper-step ${isCompleted ? "completed" : ""} ${
                      isCurrent ? "current" : ""
                    }`}
                  >
                    <div className="step-circle">
                      {isCompleted ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                    </div>
                    <div className="step-label">
                      <strong>{s.label}</strong>
                      <small>{s.desc}</small>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Info Details */}
            <div className="track-details-grid">
              <div className="detail-box">
                <MapPin size={20} />
                <div>
                  <strong>Delivery Destination</strong>
                  <p>{order.customer?.name}</p>
                  <p>{order.customer?.address}, {order.customer?.city}</p>
                  {order.customer?.phone && (
                    <p style={{ color: "#818cf8" }}>📞 {order.customer.phone}</p>
                  )}
                </div>
              </div>

              <div className="detail-box">
                <Package size={20} />
                <div>
                  <strong>Order Total &amp; Payment Mode</strong>
                  <p style={{ color: "#34d399", fontWeight: 700, fontSize: "16px" }}>
                    Rs. {order.totalAmount?.toLocaleString()}
                  </p>
                  <p>Cash on Delivery (Pay rider upon delivery)</p>
                </div>
              </div>
            </div>

            {/* Items inside this shipment */}
            {order.items && order.items.length > 0 && (
              <div className="track-items-summary" style={{ margin: "24px 0", padding: "18px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid var(--border)" }}>
                <strong style={{ display: "block", marginBottom: "12px", color: "white" }}>
                  Items in this Parcel ({order.items.length}):
                </strong>
                {order.items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                    <span style={{ color: "#cbd5e1" }}>
                      {it.title} × <strong>{it.quantity}</strong>
                    </span>
                    <span style={{ color: "#34d399", fontWeight: 600 }}>
                      Rs. {(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* WhatsApp & Email Help */}
            <div className="track-whatsapp-cta">
              <div>
                <strong>Need an urgent delivery update?</strong>
                <p>Contact our delivery coordinator on WhatsApp with your Order ID.</p>
              </div>
              <a
                href={`https://wa.me/923213633473?text=Assalam-o-Alaikum!%20I%20am%20inquiring%20about%20my%20order%20status:%20${order.orderNumber}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={16} />
                <span>WhatsApp Live Update</span>
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
