import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Truck,
  RotateCcw,
  ShoppingBag,
  Package,
  MessageSquare,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Send,
  Loader2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Ticket,
} from "lucide-react";

import api from "../../services/api";
import StoreAIAssistant from "../../components/Contact/StoreAIAssistant";
import "./css/Contact.css";

const SUPPORT_TOPICS = [
  {
    id: "Order & Delivery",
    label: "Order & Delivery",
    desc: "Track shipment, address change, or courier help",
    icon: Truck,
    badge: "Fast Track",
  },
  {
    id: "Return / Exchange",
    label: "7-Day Return",
    desc: "Easy replacement, size exchange, or refund",
    icon: RotateCcw,
    badge: "Priority",
  },
  {
    id: "Product Request",
    label: "Request a Product",
    desc: "Tell us what you want — custom item or restock",
    icon: ShoppingBag,
    badge: "Custom",
  },
  {
    id: "Bulk / Wholesale",
    label: "Bulk & Wholesale",
    desc: "Special pricing for large or corporate orders",
    icon: Package,
    badge: "Deals",
  },
  {
    id: "General Support",
    label: "General Question",
    desc: "Payment options, sizing guide, or store info",
    icon: MessageSquare,
    badge: "24/7",
  },
];

const DEFAULT_STORE_INFO = {
  storeName: "EcoStore",
  contactEmail: "rayanali0560@gmail.com",
  contactPhone: "+92 321 3633473",
  whatsappNumber: "+92 321 3633473",
  returnPolicyDays: 7,
  faqs: [
    {
      question: "How fast will I get a reply?",
      answer:
        "Our support team replies within 10–30 minutes on WhatsApp during business hours (Mon–Sat, 10 AM – 10 PM). Return & order tickets get top priority.",
    },
    {
      question: "How does the 7-Day Return & Exchange work?",
      answer:
        "Select '7-Day Return' above with your Order ID, or message us on WhatsApp. Keep the original packaging intact and we'll arrange an exchange or refund.",
    },
    {
      question: "Can I request a product that's not listed in the store?",
      answer:
        "Yes! Choose 'Request a Product' above, tell us the item name, color, size, or quantity you need, and our team will source it for you.",
    },
    {
      question: "Do you offer Cash on Delivery (COD) nationwide?",
      answer:
        "Yes! We deliver all across Pakistan in 2–4 working days with Cash on Delivery and real-time order tracking.",
    },
  ],
};

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function Contact() {
  const [storeInfo, setStoreInfo] = useState(DEFAULT_STORE_INFO);

  // Main form state
  const [form, setForm] = useState({
    category: "Product Request",
    name: "",
    phone: "",
    email: "",
    preferredContact: "whatsapp",
    orderNumber: "",
    productTitle: "",
    requestedQuantity: "1",
    budget: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [hasAutoOrder, setHasAutoOrder] = useState(false);

  // Auto-detect previous order placed on this device
  useEffect(() => {
    try {
      const storedOrderNumber = localStorage.getItem("ecostore_last_order_number");
      const storedName = localStorage.getItem("ecostore_customer_name");
      const storedEmail = localStorage.getItem("ecostore_customer_email");
      const storedPhone = localStorage.getItem("ecostore_customer_phone");

      if (storedOrderNumber && storedOrderNumber.trim()) {
        const cleanOrd = storedOrderNumber.trim();
        setHasAutoOrder(true);
        setForm((prev) => ({
          ...prev,
          orderNumber: cleanOrd,
          category: prev.category === "Product Request" ? "Order & Delivery" : prev.category,
          name: prev.name || (storedName ? storedName.trim() : ""),
          email: prev.email || (storedEmail ? storedEmail.trim() : ""),
          phone: prev.phone || (storedPhone ? storedPhone.trim() : ""),
        }));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Live ticket status checker state
  const [searchParams] = useSearchParams();
  const [ticketQuery, setTicketQuery] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);
  const [ticketError, setTicketError] = useState("");

  useEffect(() => {
    const ticketParam = searchParams.get("ticket") || searchParams.get("ticketNumber");
    if (ticketParam) {
      const cleaned = ticketParam.trim();
      setTicketQuery(cleaned);
      (async () => {
        setTicketLoading(true);
        setTicketError("");
        try {
          const res = await api.get(`/contact/ticket/${encodeURIComponent(cleaned)}`);
          const found = res.data?.ticket || res.data?.data;
          if (found) {
            setTicketResult(found);
          }
        } catch {
          // Ignore auto-lookup silent errors
        } finally {
          setTicketLoading(false);
        }
      })();
    }
  }, [searchParams]);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);
  const formPanelRef = useRef(null);

  const handlePrefillFromAI = ({ productTitle, budget, message }) => {
    setSubmittedTicket(null);
    setForm((prev) => ({
      ...prev,
      category: "Product Request",
      productTitle: productTitle || prev.productTitle,
      budget: budget || prev.budget,
      subject: productTitle ? `Product Inquiry: ${productTitle}` : prev.subject,
      message: message || prev.message,
    }));
    formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Load live store settings (WhatsApp, phone, email, return days, FAQs)
  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const res = await api.get("/settings");
        const s = res.data?.settings || res.data?.data;
        if (mounted && s) {
          setStoreInfo({
            storeName: s.storeName || DEFAULT_STORE_INFO.storeName,
            contactEmail: s.contactEmail || DEFAULT_STORE_INFO.contactEmail,
            contactPhone: s.contactPhone || DEFAULT_STORE_INFO.contactPhone,
            whatsappNumber: s.whatsappNumber || DEFAULT_STORE_INFO.whatsappNumber,
            returnPolicyDays: s.returnPolicyDays || 7,
            faqs:
              Array.isArray(s.faqs) && s.faqs.length > 0
                ? s.faqs
                : DEFAULT_STORE_INFO.faqs,
          });
        }
      } catch {
        // Fallback to DEFAULT_STORE_INFO silently
      }
    };
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const cleanStoreWhatsApp = (storeInfo.whatsappNumber || "+923213633473").replace(
    /[^0-9]/g,
    ""
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTopicSelect = (topicId) => {
    setForm((prev) => ({ ...prev, category: topicId }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setError("Please fill in your name, phone/WhatsApp number, and message.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        category: form.category,
        name: form.name.trim(),
        phone: form.phone.trim(),
        whatsapp: form.phone.trim(),
        email: form.email.trim(),
        preferredContact: form.preferredContact,
        orderNumber: form.orderNumber.trim(),
        productTitle: form.productTitle.trim(),
        requestedQuantity: Number(form.requestedQuantity) || 1,
        budget: form.budget.trim(),
        subject:
          form.subject.trim() ||
          (form.productTitle.trim()
            ? `${form.category}: ${form.productTitle.trim()}`
            : form.category),
        message: form.message.trim(),
      };

      const res = await api.post("/contact", payload);
      const created = res.data?.inquiry || res.data?.data || {};
      const ticketNumber =
        res.data?.ticketNumber || created.ticketNumber || "SUP-RECEIVED";

      setSubmittedTicket({
        ticketNumber,
        category: payload.category,
        name: payload.name,
        message: payload.message,
        orderNumber: payload.orderNumber,
        productTitle: payload.productTitle,
        priority: created.priority || "normal",
        preferredContact: payload.preferredContact,
      });

      // Reset form fields except category
      setForm({
        category: form.category,
        name: "",
        phone: "",
        email: "",
        preferredContact: "whatsapp",
        orderNumber: "",
        productTitle: "",
        requestedQuantity: "1",
        budget: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not send your message right now. You can also reach us directly on WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (!submittedTicket?.ticketNumber) return;
    navigator.clipboard?.writeText(submittedTicket.ticketNumber);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2500);
  };

  const handleTicketLookup = async (e) => {
    e.preventDefault();
    const cleaned = ticketQuery.trim();
    if (!cleaned) return;

    setTicketLoading(true);
    setTicketError("");
    setTicketResult(null);

    try {
      const res = await api.get(`/contact/ticket/${encodeURIComponent(cleaned)}`);
      const found = res.data?.ticket || res.data?.data;
      if (found) {
        setTicketResult(found);
      } else {
        setTicketError("Ticket not found. Please check your Ticket ID.");
      }
    } catch (err) {
      setTicketError(
        err.response?.data?.message ||
          "Ticket not found. Make sure it looks like SUP-YYYYMMDD-XXXX."
      );
    } finally {
      setTicketLoading(false);
    }
  };

  const showOrderField =
    form.category === "Order & Delivery" ||
    form.category === "Return / Exchange" ||
    Boolean(form.orderNumber);
  const showProductField =
    form.category === "Product Request" ||
    form.category === "Bulk / Wholesale";
  const showBulkFields = form.category === "Bulk / Wholesale";

  return (
    <main className="store-contact-page">
      {/* Ambient background accents */}
      <div className="contact-orb contact-orb-1" aria-hidden="true" />
      <div className="contact-orb contact-orb-2" aria-hidden="true" />

      <div className="store-contact-container">
        {/* Hero Section */}
        <section className="store-contact-hero">
          <div className="support-live-pill">
            <span className="live-pulse-dot" />
            <span>
              {storeInfo.storeName} Concierge Online • Avg. Reply ~10 Mins
            </span>
          </div>

          <h1>
            How Can We <span>Help You</span> Today?
          </h1>
          <p>
            Need help with an order, want a {storeInfo.returnPolicyDays}-day
            return/exchange, or looking for a custom product? Message our store
            team directly and get a live support ticket ID.
          </p>
        </section>

        {/* Direct Store Channels Strip */}
        <section className="contact-channels-grid">
          <a
            href={`https://wa.me/${cleanStoreWhatsApp}?text=${encodeURIComponent(
              `Assalam-o-Alaikum ${storeInfo.storeName}! I need assistance from store support.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="channel-card channel-whatsapp"
          >
            <div className="channel-icon">
              <MessageCircle size={22} />
            </div>
            <div className="channel-body">
              <span className="channel-tag">FASTEST RESPONSE</span>
              <h3>WhatsApp Live Chat</h3>
              <p>{storeInfo.whatsappNumber}</p>
            </div>
            <ArrowRight size={18} className="channel-arrow" />
          </a>

          <a
            href={`tel:${(storeInfo.contactPhone || "").replace(/\s+/g, "")}`}
            className="channel-card channel-phone"
          >
            <div className="channel-icon">
              <Phone size={22} />
            </div>
            <div className="channel-body">
              <span className="channel-tag">STORE HOTLINE</span>
              <h3>Call Support Desk</h3>
              <p>{storeInfo.contactPhone}</p>
            </div>
            <ArrowRight size={18} className="channel-arrow" />
          </a>

          <a
            href={`mailto:${storeInfo.contactEmail}`}
            className="channel-card channel-email"
          >
            <div className="channel-icon">
              <Mail size={22} />
            </div>
            <div className="channel-body">
              <span className="channel-tag">EMAIL & WHOLESALE</span>
              <h3>Email Our Team</h3>
              <p>{storeInfo.contactEmail}</p>
            </div>
            <ArrowRight size={18} className="channel-arrow" />
          </a>
        </section>

        {/* AI Smart Budget & Product Concierge */}
        <StoreAIAssistant
          storeName={storeInfo.storeName}
          onPrefillRequest={handlePrefillFromAI}
        />

        {/* Main 2-Column Interactive Workspace */}
        <div className="contact-workspace">
          {/* LEFT COLUMN: Smart Support Form / Ticket Receipt */}
          <section className="contact-form-panel" ref={formPanelRef}>
            {submittedTicket ? (
              <div className="ticket-receipt-card">
                <div className="receipt-icon-wrap">
                  <CheckCircle2 size={42} />
                </div>

                <span className="receipt-eyebrow">SUPPORT TICKET CREATED</span>
                <h2>Message Sent to {storeInfo.storeName}!</h2>
                <p className="receipt-sub">
                  Thank you, <strong>{submittedTicket.name}</strong>. Our store
                  team has received your{" "}
                  <strong>{submittedTicket.category}</strong> request and will
                  contact you via{" "}
                  <strong>{submittedTicket.preferredContact}</strong> shortly.
                </p>

                <div className="ticket-id-box">
                  <div>
                    <small>YOUR SUPPORT TICKET ID</small>
                    <strong>{submittedTicket.ticketNumber}</strong>
                  </div>
                  <button
                    type="button"
                    className="copy-ticket-btn"
                    onClick={handleCopyTicket}
                  >
                    {copiedTicket ? (
                      <>
                        <Check size={15} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={15} /> Copy ID
                      </>
                    )}
                  </button>
                </div>

                <div className="receipt-meta-grid">
                  <div>
                    <span>Department</span>
                    <strong>{submittedTicket.category}</strong>
                  </div>
                  <div>
                    <span>Priority</span>
                    <strong className={`priority-tag ${submittedTicket.priority}`}>
                      {submittedTicket.priority === "high"
                        ? "High Priority"
                        : "Standard"}
                    </strong>
                  </div>
                  {submittedTicket.orderNumber && (
                    <div>
                      <span>Order Reference</span>
                      <strong>{submittedTicket.orderNumber}</strong>
                    </div>
                  )}
                  {submittedTicket.productTitle && (
                    <div>
                      <span>Product Requested</span>
                      <strong>{submittedTicket.productTitle}</strong>
                    </div>
                  )}
                </div>

                <div className="receipt-actions">
                  <a
                    href={`https://wa.me/${cleanStoreWhatsApp}?text=${encodeURIComponent(
                      `Hello ${storeInfo.storeName}! I just submitted Ticket #${submittedTicket.ticketNumber} (${submittedTicket.category}).\nName: ${submittedTicket.name}\nMessage: ${submittedTicket.message}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp-receipt"
                  >
                    <MessageCircle size={18} />
                    Fast-Track on WhatsApp
                  </a>

                  <button
                    type="button"
                    className="btn-outline-receipt"
                    onClick={() => {
                      setTicketQuery(submittedTicket.ticketNumber);
                      setSubmittedTicket(null);
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form className="concierge-form" onSubmit={handleSubmit}>
                <div className="form-step-header">
                  <span className="step-pill">STEP 1</span>
                  <div>
                    <h2>What do you need help with?</h2>
                    <p>Choose a topic so your request goes straight to the right team.</p>
                  </div>
                </div>

                {/* Topic Selector Cards */}
                <div className="topic-cards-grid">
                  {SUPPORT_TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    const active = form.category === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        className={`topic-card ${active ? "active" : ""}`}
                        onClick={() => handleTopicSelect(topic.id)}
                      >
                        <div className="topic-card-top">
                          <span className="topic-icon">
                            <Icon size={18} />
                          </span>
                          <span className="topic-badge">{topic.badge}</span>
                        </div>
                        <strong>{topic.label}</strong>
                        <small>{topic.desc}</small>
                      </button>
                    );
                  })}
                </div>

                {/* Contextual Return Banner */}
                {form.category === "Return / Exchange" && (
                  <div className="contextual-return-hint">
                    <RotateCcw size={18} />
                    <div>
                      <strong>
                        {storeInfo.returnPolicyDays}-Day Hassle-Free Return Guarantee
                      </strong>
                      <p>
                        Enter your Order ID below and tell us if you want a size
                        exchange, replacement, or refund.{" "}
                        <Link to="/return-policy">Read full policy →</Link>
                      </p>
                    </div>
                  </div>
                )}

                <div className="form-step-header" style={{ marginTop: 28 }}>
                  <span className="step-pill">STEP 2</span>
                  <div>
                    <h2>Your Details & Message</h2>
                    <p>We’ll generate a live Ticket ID immediately after you send.</p>
                  </div>
                </div>

                {error && (
                  <div className="concierge-alert error" role="alert">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="concierge-grid">
                  {/* Name */}
                  <div className="c-field">
                    <label htmlFor="c-name">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      id="c-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Rayan Ali"
                      required
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="c-field">
                    <label htmlFor="c-phone">
                      Phone / WhatsApp Number <span className="req">*</span>
                    </label>
                    <input
                      id="c-phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="e.g. +92 321 3633473"
                      required
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div className="c-field">
                    <label htmlFor="c-email">Email Address (Optional)</label>
                    <input
                      id="c-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Preferred Reply Method */}
                  <div className="c-field">
                    <label>Preferred Reply Method</label>
                    <div className="reply-method-pills">
                      {[
                        { value: "whatsapp", label: "WhatsApp" },
                        { value: "phone", label: "Phone Call" },
                        { value: "email", label: "Email" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`reply-pill ${
                            form.preferredContact === opt.value ? "active" : ""
                          }`}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              preferredContact: opt.value,
                            }))
                          }
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic: Order Number for Order & Return topics */}
                  {showOrderField && (
                    <div className="c-field c-field-full">
                      <div className="c-field-header-row">
                        <label htmlFor="c-orderNumber">
                          Order Number {hasAutoOrder && form.orderNumber ? "(Auto-Detected From Recent Order)" : "(Optional — speeds up resolution)"}
                        </label>
                        {hasAutoOrder && form.orderNumber && (
                          <span className="c-order-auto-tag">
                            <CheckCircle2 size={12} /> Auto-filled
                          </span>
                        )}
                      </div>
                      <input
                        id="c-orderNumber"
                        name="orderNumber"
                        value={form.orderNumber}
                        onChange={(e) => {
                          setHasAutoOrder(false);
                          handleChange(e);
                        }}
                        placeholder="e.g. ORD-20261118-9A1F"
                      />
                    </div>
                  )}

                  {/* Dynamic: Product Name & Quantity for Product Request / Bulk */}
                  {showProductField && (
                    <>
                      <div className="c-field">
                        <label htmlFor="c-productTitle">
                          Product Name / Item You Want
                        </label>
                        <input
                          id="c-productTitle"
                          name="productTitle"
                          value={form.productTitle}
                          onChange={handleChange}
                          placeholder="e.g. Smart Watch Series 9 Black"
                        />
                      </div>

                      <div className="c-field">
                        <label htmlFor="c-qty">Quantity Needed</label>
                        <input
                          id="c-qty"
                          type="number"
                          min="1"
                          name="requestedQuantity"
                          value={form.requestedQuantity}
                          onChange={handleChange}
                          placeholder="e.g. 1"
                        />
                      </div>
                    </>
                  )}

                  {/* Dynamic: Budget for Bulk/Wholesale */}
                  {showBulkFields && (
                    <div className="c-field c-field-full">
                      <label htmlFor="c-budget">Estimated Budget (Rs.)</label>
                      <input
                        id="c-budget"
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        placeholder="e.g. Rs. 25,000 - Rs. 50,000"
                      />
                    </div>
                  )}

                  {/* Subject */}
                  <div className="c-field c-field-full">
                    <label htmlFor="c-subject">Subject (Optional)</label>
                    <input
                      id="c-subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder={
                        form.category === "Product Request"
                          ? "e.g. Need size L in Matte Black with urgent delivery"
                          : form.category === "Return / Exchange"
                          ? "e.g. Size exchange request for my recent order"
                          : "Short summary of your message"
                      }
                    />
                  </div>

                  {/* Message */}
                  <div className="c-field c-field-full">
                    <label htmlFor="c-message">
                      Your Message / Details <span className="req">*</span>
                    </label>
                    <textarea
                      id="c-message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder={
                        form.category === "Product Request"
                          ? "Tell us exact product details, color, size, or anything special you want..."
                          : form.category === "Return / Exchange"
                          ? "Mention reason for return/exchange and whether you want a replacement or refund..."
                          : "Write your message here. Our team will get back to you quickly!"
                      }
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="concierge-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Sending to Store Support...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message & Get Ticket ID
                    </>
                  )}
                </button>
              </form>
            )}
          </section>

          {/* RIGHT COLUMN: Ticket Status Checker, Store Info & FAQs */}
          <aside className="contact-sidebar">
            {/* Unique Feature: Live Support Ticket Checker */}
            <div className="sidebar-card ticket-checker-card">
              <div className="sidebar-card-head">
                <span className="sidebar-icon-box indigo">
                  <Ticket size={18} />
                </span>
                <div>
                  <h3>Check Ticket Reply</h3>
                  <p>Already messaged us? Track your ticket status live.</p>
                </div>
              </div>

              <form onSubmit={handleTicketLookup} className="ticket-search-form">
                <input
                  type="text"
                  value={ticketQuery}
                  onChange={(e) => setTicketQuery(e.target.value)}
                  placeholder="Enter Ticket ID (SUP-...)"
                />
                <button type="submit" disabled={ticketLoading}>
                  {ticketLoading ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <Search size={16} />
                  )}
                </button>
              </form>

              {ticketError && (
                <div className="ticket-lookup-error">
                  <AlertCircle size={15} />
                  <span>{ticketError}</span>
                </div>
              )}

              {ticketResult && (
                <div className="ticket-lookup-result">
                  <div className="lookup-top">
                    <strong>{ticketResult.ticketNumber}</strong>
                    <span className={`lookup-status ${ticketResult.status || "new"}`}>
                      {ticketResult.status || "new"}
                    </span>
                  </div>
                  <div className="lookup-meta">
                    <span>{ticketResult.category}</span>
                    <span>•</span>
                    <span>{formatDate(ticketResult.createdAt || ticketResult.created_at)}</span>
                  </div>

                  {ticketResult.adminReply ? (
                    <div className="lookup-admin-reply">
                      <small>
                        <Sparkles size={12} /> OFFICIAL STORE REPLY
                      </small>
                      <p>{ticketResult.adminReply}</p>
                    </div>
                  ) : (
                    <p className="lookup-pending-note">
                      Our team has received your ticket and is reviewing it.
                      Replies appear here & on your WhatsApp.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Store Guarantees & Hours */}
            <div className="sidebar-card store-hours-card">
              <h3>Store Support Hours & Guarantees</h3>

              <ul className="store-info-list">
                <li>
                  <Clock size={17} />
                  <div>
                    <strong>Support Timings</strong>
                    <span>Mon – Sat: 10:00 AM – 10:00 PM (PKT)</span>
                  </div>
                </li>
                <li>
                  <ShieldCheck size={17} />
                  <div>
                    <strong>{storeInfo.returnPolicyDays}-Day Return Protection</strong>
                    <span>
                      Easy exchanges & refunds.{" "}
                      <Link to="/return-policy">View Policy</Link>
                    </span>
                  </div>
                </li>
                <li>
                  <Truck size={17} />
                  <div>
                    <strong>Live Order Tracking</strong>
                    <span>
                      Check parcel location anytime.{" "}
                      <Link to="/track-order">Track Order</Link>
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Interactive Quick FAQs */}
            <div className="sidebar-card contact-faqs-card">
              <h3>Quick Answers</h3>
              <div className="contact-faq-list">
                {storeInfo.faqs.slice(0, 4).map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className={`contact-faq-item ${isOpen ? "open" : ""}`}
                    >
                      <button
                        type="button"
                        className="contact-faq-q"
                        onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      >
                        <span>{faq.question}</span>
                        <ChevronDown size={16} className="faq-chevron" />
                      </button>
                      {isOpen && <p className="contact-faq-a">{faq.answer}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
