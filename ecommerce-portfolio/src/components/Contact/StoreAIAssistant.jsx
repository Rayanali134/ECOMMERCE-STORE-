import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  Sparkles,
  Send,
  ShoppingCart,
  ExternalLink,
  MessageSquarePlus,
  Loader2,
  Check,
  Wallet,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  Copy,
  Zap,
  FileText,
  Flame,
  ArrowRight,
} from "lucide-react";

import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import "../../pages/public/css/Contact.css";

const BUDGET_PRESETS = [
  { label: "Any Budget", value: "" },
  { label: "Under Rs. 5,000", value: "5000" },
  { label: "Under Rs. 10,000", value: "10000" },
  { label: "Under Rs. 15,000", value: "15000" },
  { label: "Under Rs. 20,000", value: "20000" },
];

const QUICK_ACTIONS = [
  { label: "🔥 Flash Deals", query: "Best deals and discounts right now" },
  { label: "📦 Track Order", query: "Track my order status" },
  { label: "🎧 ANC Audio", query: "Show studio noise cancelling headphones" },
  { label: "⌚ Luxury Watches", query: "Show Swiss chronograph watches" },
  { label: "👟 Street Sneakers", query: "Show running shoes and sneakers" },
  { label: "🧥 Streetwear Hoodies", query: "Show heavyweight hoodies" },
  { label: "🚚 Delivery & COD Rates", query: "Delivery time, cities and COD charges" },
  { label: "🔄 7-Day Returns", query: "What is your 7-day return policy?" },
  {
    label: "💬 WhatsApp Concierge",
    isExternal: true,
    url: "https://wa.me/923213633473?text=Assalam-o-Alaikum%20EcoStore!%20I%20need%20assistance.",
  },
];

const INITIAL_SUGGESTIONS = [
  "5000 k andar best product dikhao",
  "Watch under Rs. 10,000",
  "Track my order",
  "7-Day Return Policy kya hai?",
  "Delivery & COD charges?",
  "JazzCash ya EasyPaisa available hai?",
];

function formatPrice(val) {
  return "Rs. " + Number(val || 0).toLocaleString();
}

// Strip markdown symbols & emojis for smooth AI voice speech
function cleanTextForSpeech(text) {
  return String(text || "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/[`#_~]/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Safely render **bold** and line breaks
function FormattedText({ text }) {
  const lines = String(text || "").split("\n");
  return (
    <div className="ai-text-body">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="ai-line-spacer" />;
        }
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={lineIdx}>
            {parts.map((part, partIdx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
              }
              return <span key={partIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

// Interactive Live Order Tracking Card rendered inside AI Chat
function OrderTrackingCard({ order }) {
  const [copied, setCopied] = useState(false);
  const status = String(order.status || "confirmed").toLowerCase();

  const handleCopy = () => {
    if (order.orderNumber && navigator.clipboard) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStepIndex = (st) => {
    if (st === "delivered") return 4;
    if (st === "shipped") return 3;
    if (st === "processing") return 2;
    if (st === "confirmed") return 2;
    return 1;
  };

  const stepIdx = getStepIndex(status);

  const steps = [
    { label: "Placed", icon: CheckCircle2 },
    { label: "Confirmed", icon: Clock },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: PackageCheck },
  ];

  const statusBadges = {
    delivered: { label: "Delivered", color: "emerald", icon: "🎉" },
    shipped: { label: "Dispatched / In Transit", color: "purple", icon: "🚚" },
    processing: { label: "Quality Check & Packing", color: "blue", icon: "⚙️" },
    confirmed: { label: "Order Confirmed", color: "cyan", icon: "✓" },
    pending: { label: "Pending Verification", color: "amber", icon: "⏳" },
    cancelled: { label: "Order Cancelled", color: "red", icon: "🛑" },
  };

  const currentBadge = statusBadges[status] || {
    label: status.toUpperCase(),
    color: "cyan",
    icon: "📦",
  };

  return (
    <div className="ai-order-card">
      <div className="ai-card-badge-row">
        <div className="ai-card-title">
          <Truck size={16} />
          <span>ORDER #{order.orderNumber}</span>
          <button
            type="button"
            className="ai-card-copy-btn"
            onClick={handleCopy}
            title="Copy Order Number"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <span className={`ai-status-pill status-${currentBadge.color}`}>
          <span className="ai-status-dot" />
          {currentBadge.icon} {currentBadge.label}
        </span>
      </div>

      {status !== "cancelled" && (
        <div className="ai-order-timeline">
          {steps.map((st, i) => {
            const isCompleted = stepIdx > i + 1;
            const isCurrent = stepIdx === i + 1;
            return (
              <div
                key={st.label}
                className={`ai-timeline-step ${
                  isCompleted ? "completed" : ""
                } ${isCurrent ? "current" : ""}`}
              >
                <div className="ai-timeline-node">
                  <st.icon size={13} />
                </div>
                <span className="ai-timeline-label">{st.label}</span>
                {i < steps.length - 1 && <div className="ai-timeline-line" />}
              </div>
            );
          })}
        </div>
      )}

      <div className="ai-order-meta-grid">
        <div className="ai-meta-item">
          <span className="ai-meta-label">Customer</span>
          <strong className="ai-meta-val">
            {order.customerName || "Customer"}
          </strong>
        </div>
        <div className="ai-meta-item">
          <span className="ai-meta-label">Destination</span>
          <strong className="ai-meta-val">{order.city || "Pakistan"}</strong>
        </div>
        <div className="ai-meta-item">
          <span className="ai-meta-label">Total Amount (COD)</span>
          <strong className="ai-meta-val text-emerald">
            {formatPrice(order.totalAmount)}
          </strong>
        </div>
        {order.trackingNumber && (
          <div className="ai-meta-item">
            <span className="ai-meta-label">Courier Tracking ID</span>
            <strong className="ai-meta-val text-purple">
              {order.trackingNumber}
            </strong>
          </div>
        )}
      </div>

      {order.items && order.items.length > 0 && (
        <div className="ai-order-items-preview">
          <span className="ai-items-label">Order Items:</span>
          <div className="ai-items-chips-list">
            {order.items.map((it, idx) => (
              <div key={idx} className="ai-order-item-chip">
                <span className="ai-item-name">{it.title}</span>
                <span className="ai-item-qty">{it.quantity}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ai-card-actions">
        <Link
          to={`/track-order?ord=${order.orderNumber}`}
          className="ai-card-btn primary"
        >
          <ExternalLink size={13} /> Open Live Tracking Page
        </Link>
        <a
          href={`https://wa.me/923213633473?text=${encodeURIComponent(
            `Assalam-o-Alaikum EcoStore! I want to check my order #${order.orderNumber}.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="ai-card-btn whatsapp"
        >
          WhatsApp Concierge
        </a>
      </div>
    </div>
  );
}

// Interactive Live Ticket Card rendered inside AI Chat
function TicketTrackingCard({ ticket }) {
  const [copied, setCopied] = useState(false);
  const status = String(ticket.status || "new").toLowerCase();

  const handleCopy = () => {
    if (ticket.ticketNumber && navigator.clipboard) {
      navigator.clipboard.writeText(ticket.ticketNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isResolved = status === "resolved";

  return (
    <div className="ai-ticket-card">
      <div className="ai-card-badge-row">
        <div className="ai-card-title">
          <FileText size={16} />
          <span>TICKET #{ticket.ticketNumber}</span>
          <button
            type="button"
            className="ai-card-copy-btn"
            onClick={handleCopy}
            title="Copy Ticket Number"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <span
          className={`ai-status-pill status-${
            isResolved ? "emerald" : "amber"
          }`}
        >
          <span className="ai-status-dot" />
          {isResolved ? "RESOLVED" : "IN REVIEW"}
        </span>
      </div>

      <div className="ai-ticket-meta-row">
        <div className="ai-meta-item">
          <span className="ai-meta-label">Department</span>
          <strong className="ai-meta-val">
            {ticket.category || "Customer Support"}
          </strong>
        </div>
        {ticket.name && (
          <div className="ai-meta-item">
            <span className="ai-meta-label">Customer</span>
            <strong className="ai-meta-val">{ticket.name}</strong>
          </div>
        )}
      </div>

      {ticket.message && (
        <div className="ai-ticket-query-box">
          <span className="ai-query-label">Your Question:</span>
          <p>"{ticket.message}"</p>
        </div>
      )}

      {ticket.adminReply ? (
        <div className="ai-ticket-reply-box replied">
          <div className="ai-reply-header">
            <CheckCircle2 size={15} />
            <strong>Official Store Response:</strong>
          </div>
          <p className="ai-reply-text">"{ticket.adminReply}"</p>
        </div>
      ) : (
        <div className="ai-ticket-reply-box pending">
          <div className="ai-reply-header">
            <Clock size={15} />
            <strong>Review In Progress:</strong>
          </div>
          <p className="ai-reply-text">
            Our store concierge is reviewing your request and will notify you via
            Email &amp; WhatsApp shortly!
          </p>
        </div>
      )}

      <div className="ai-card-actions">
        <a
          href={`https://wa.me/923213633473?text=${encodeURIComponent(
            `Assalam-o-Alaikum EcoStore! I want to follow up on my Support Ticket #${ticket.ticketNumber}.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="ai-card-btn whatsapp"
        >
          Follow-up on WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function StoreAIAssistant({
  storeName = "EcoStore",
  onPrefillRequest,
  compact = false,
  initialPrompt = "",
}) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const msgCounterRef = useRef(1);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const lastProcessedPromptRef = useRef("");

  const [messages, setMessages] = useState([
    {
      id: "welcome-0",
      role: "assistant",
      text: `Assalam-o-Alaikum! 👋 Main **${storeName} AI Concierge** hun.\nAap mujh se store ke **100+ sawalon** (Live Order Tracking, Live Support Tickets, Budget Matcher, COD, 7-Day Returns, Sizes) ka fori jawab le sakte hain!\n\nMisal: *"10000 k andar watch dikhao"* ya apna Order ID *"ORD-20261123-XXXX"* bhej kar status check karein!`,
      products: [],
      orderData: null,
      ticketData: null,
      quickReplies: INITIAL_SUGGESTIONS,
      isUnrelated: false,
    },
  ]);

  const [input, setInput] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState(null);

  // Voice synthesis & speech input states
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [listening, setListening] = useState(false);

  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const micSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  // Stop speech when unmounting
  useEffect(() => {
    return () => {
      if (speechSupported) window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [speechSupported]);

  const speakReply = (text, msgId) => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();

    if (speakingMsgId === msgId) {
      setSpeakingMsgId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
    utterance.rate = 1.02;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceMode = () => {
    if (voiceEnabled && speechSupported) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
    setVoiceEnabled((prev) => !prev);
  };

  const toggleMicInput = () => {
    if (!micSupported) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const spoken = event.results?.[0]?.[0]?.transcript || "";
      if (spoken.trim()) {
        setInput(spoken.trim());
        sendMessage(spoken.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const nextId = (prefix) => {
    msgCounterRef.current += 1;
    return `${prefix}-${msgCounterRef.current}`;
  };

  const sendMessage = async (customText, overrideBudget) => {
    const queryText = (customText !== undefined ? customText : input).trim();
    if (!queryText || loading) return;

    const activeBudget =
      overrideBudget !== undefined ? overrideBudget : selectedBudget;

    const userMsg = {
      id: nextId("user"),
      role: "user",
      text: queryText,
      budgetTag: activeBudget
        ? `Budget: Under ${formatPrice(activeBudget)}`
        : "",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (customText === undefined) setInput("");
    setLoading(true);

    try {
      const payload = { message: queryText };
      if (activeBudget) payload.budget = Number(activeBudget);

      const response = await api.post("/ai/chat", payload);
      const data = response.data;
      const aiMsgId = nextId("ai");
      const replyText =
        data.reply ||
        "Here are the best options I found for you from our store!";

      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: "assistant",
          mode: data.mode || "smart-store-ai",
          isUnrelated: Boolean(data.isUnrelated),
          text: replyText,
          products: Array.isArray(data.products) ? data.products : [],
          orderData: data.orderData || null,
          ticketData: data.ticketData || null,
          quickReplies: Array.isArray(data.quickReplies)
            ? data.quickReplies
            : [],
        },
      ]);

      if (voiceEnabled && speechSupported) {
        speakReply(replyText, aiMsgId);
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId("err"),
          role: "assistant",
          isUnrelated: false,
          text:
            err.response?.data?.message ||
            "Sorry, AI Assistant abhi backend se connect nahi ho saka. Aap direct WhatsApp **+92 321 3633473** par rabta kar sakte hain!",
          products: [],
          orderData: null,
          ticketData: null,
          quickReplies: INITIAL_SUGGESTIONS.slice(0, 3),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      initialPrompt &&
      typeof initialPrompt === "string" &&
      initialPrompt.trim() &&
      initialPrompt !== lastProcessedPromptRef.current
    ) {
      lastProcessedPromptRef.current = initialPrompt;
      sendMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleBudgetPresetClick = (val) => {
    setSelectedBudget(val);
    if (val) {
      sendMessage(
        `Show best products under Rs. ${Number(val).toLocaleString()}`,
        val
      );
    }
  };

  const handleAddToCart = (prod) => {
    addToCart(
      {
        _id: prod.id,
        id: prod.id,
        title: prod.title,
        price: prod.price,
        salePrice: prod.salePrice,
        images: prod.image ? [prod.image] : [],
        stock: prod.stock,
      },
      1,
      {}
    );
    setAddedId(prod.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const handleBuyNow = (prod) => {
    addToCart(
      {
        _id: prod.id,
        id: prod.id,
        title: prod.title,
        price: prod.price,
        salePrice: prod.salePrice,
        images: prod.image ? [prod.image] : [],
        stock: prod.stock,
      },
      1,
      {}
    );
    navigate("/checkout");
  };

  const handleResetChat = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
    setSelectedBudget("");
    setMessages([
      {
        id: nextId("welcome"),
        role: "assistant",
        isUnrelated: false,
        text: `Chat reset! 🔄 Batayein aapko kis **budget** me konsa product chahiye, ya apna Order ID / Ticket ID bhej kar live status check karein!`,
        products: [],
        orderData: null,
        ticketData: null,
        quickReplies: INITIAL_SUGGESTIONS,
      },
    ]);
  };

  return (
    <section
      className={`ai-concierge-section ${compact ? "ai-compact" : ""}`}
      aria-label="AI Store Concierge"
    >
      {!compact && (
        <div className="ai-concierge-header">
          <div className="ai-header-left">
            <div className="ai-avatar-glow">
              <Bot size={22} />
              <span className="ai-online-ring" />
            </div>
            <div>
              <div className="ai-title-row">
                <h2>{storeName} AI Concierge &amp; Live Assistant</h2>
                <span className="ai-badge-chip">
                  <Sparkles size={12} /> 100+ Q&amp;A • LIVE TRACKING • VOICE
                </span>
              </div>
              <p>
                Real-time MySQL live catalog, instant order tracking, ticket
                lookups &amp; budget suggestions in Roman Urdu &amp; English.
              </p>
            </div>
          </div>

          <div className="ai-header-controls">
            <a
              href="https://wa.me/923213633473?text=Assalam-o-Alaikum%20EcoStore!%20I%20need%20human%20assistance."
              target="_blank"
              rel="noreferrer"
              className="ai-whatsapp-concierge-btn"
              title="Speak with store manager on WhatsApp"
            >
              <Zap size={14} /> WhatsApp Helpline
            </a>

            {speechSupported && (
              <button
                type="button"
                className={`ai-voice-toggle ${voiceEnabled ? "active" : ""}`}
                onClick={toggleVoiceMode}
                title={voiceEnabled ? "Mute AI Voice" : "Enable AI Voice"}
              >
                {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>{voiceEnabled ? "Voice ON" : "AI Voice"}</span>
              </button>
            )}

            <button
              type="button"
              className="ai-reset-btn"
              onClick={handleResetChat}
              title="Restart AI conversation"
            >
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Heavy Quick Category Discovery Toolbar */}
      <div className="ai-quick-discovery-toolbar">
        <div className="ai-discovery-scroll">
          {QUICK_ACTIONS.map((action) =>
            action.isExternal ? (
              <a
                key={action.label}
                href={action.url}
                target="_blank"
                rel="noreferrer"
                className="ai-discovery-chip external"
              >
                {action.label}
              </a>
            ) : (
              <button
                key={action.label}
                type="button"
                className="ai-discovery-chip"
                onClick={() => sendMessage(action.query, "")}
                disabled={loading}
              >
                {action.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Quick Budget Filter Bar */}
      <div className="ai-budget-bar">
        <span className="ai-budget-label">
          <Wallet size={14} /> Budget:
        </span>
        <div className="ai-budget-pills">
          {BUDGET_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`ai-budget-pill ${
                selectedBudget === preset.value ? "active" : ""
              }`}
              onClick={() => handleBudgetPresetClick(preset.value)}
              disabled={loading}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {compact && speechSupported && (
          <button
            type="button"
            className={`ai-voice-mini ${voiceEnabled ? "active" : ""}`}
            onClick={toggleVoiceMode}
            title={voiceEnabled ? "Mute AI Voice" : "Enable AI Voice"}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        )}
      </div>

      {/* Chat Messages Window */}
      <div className="ai-chat-window">
        {messages.map((msg) => (
          <div key={msg.id} className={`ai-msg-row ${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="ai-msg-avatar">
                <Sparkles size={15} />
              </div>
            )}

            <div className="ai-msg-content">
              <div
                className={`ai-bubble ${msg.role} ${
                  msg.isUnrelated ? "guardrail" : ""
                }`}
              >
                {msg.budgetTag && (
                  <span className="user-budget-tag">{msg.budgetTag}</span>
                )}
                <FormattedText text={msg.text} />

                {msg.role === "assistant" && speechSupported && (
                  <button
                    type="button"
                    className={`ai-speak-btn ${
                      speakingMsgId === msg.id ? "speaking" : ""
                    }`}
                    onClick={() => speakReply(msg.text, msg.id)}
                    title="Listen to AI Voice"
                  >
                    {speakingMsgId === msg.id ? (
                      <>
                        <VolumeX size={12} /> Stop Voice
                      </>
                    ) : (
                      <>
                        <Volume2 size={12} /> Listen
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Heavy Feature 1: Live Interactive Order Tracking Card */}
              {msg.orderData && <OrderTrackingCard order={msg.orderData} />}

              {/* Heavy Feature 2: Live Interactive Ticket Card */}
              {msg.ticketData && <TicketTrackingCard ticket={msg.ticketData} />}

              {/* AI Recommended Product Cards with Buy Now */}
              {msg.products && msg.products.length > 0 && (
                <div className="ai-products-grid">
                  {msg.products.map((prod) => (
                    <div key={prod.id} className="ai-product-card">
                      <div className="ai-prod-top">
                        {prod.image ? (
                          <img
                            src={
                              prod.image.startsWith("http")
                                ? prod.image
                                : `http://localhost:5000${prod.image}`
                            }
                            alt={prod.title}
                            className="ai-prod-img"
                          />
                        ) : (
                          <div className="ai-prod-img placeholder">
                            <ShoppingCart size={20} />
                          </div>
                        )}
                        <div className="ai-prod-info">
                          <span className="ai-prod-cat">{prod.category}</span>
                          <h4>{prod.title}</h4>
                          <div className="ai-prod-price-row">
                            <strong>{formatPrice(prod.effectivePrice)}</strong>
                            {prod.discountPercent > 0 && (
                              <>
                                <span className="ai-prod-old">
                                  {formatPrice(prod.price)}
                                </span>
                                <span className="ai-prod-save">
                                  -{prod.discountPercent}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {!compact && prod.shortDescription && (
                        <p className="ai-prod-desc">
                          {prod.shortDescription.slice(0, 95)}
                          {prod.shortDescription.length > 95 ? "..." : ""}
                        </p>
                      )}

                      {prod.specifications && prod.specifications.length > 0 && (
                        <div className="ai-prod-specs">
                          {prod.specifications.slice(0, 2).map((s, idx) => (
                            <span key={idx}>
                              {s.title}: {s.value}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="ai-prod-badges-strip">
                        <span className="ai-stock-chip">
                          🟢 In Stock • Fast Dispatch
                        </span>
                      </div>

                      <div className="ai-prod-actions">
                        <button
                          type="button"
                          className="ai-act-buynow"
                          onClick={() => handleBuyNow(prod)}
                          title="Instant 1-Click Cash on Delivery Checkout"
                        >
                          <Zap size={14} /> Buy Now
                        </button>

                        <button
                          type="button"
                          className="ai-act-cart"
                          onClick={() => handleAddToCart(prod)}
                        >
                          {addedId === prod.id ? (
                            <>
                              <Check size={14} /> Added!
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={14} /> Add
                            </>
                          )}
                        </button>

                        <Link
                          to={`/products/${prod.slug || prod.id}`}
                          className="ai-act-view"
                        >
                          <ExternalLink size={14} /> Details
                        </Link>

                        {onPrefillRequest && (
                          <button
                            type="button"
                            className="ai-act-ask"
                            onClick={() =>
                              onPrefillRequest({
                                productTitle: prod.title,
                                budget: selectedBudget
                                  ? `Rs. ${Number(
                                      selectedBudget
                                    ).toLocaleString()}`
                                  : formatPrice(prod.effectivePrice),
                                message: `Hi, I saw "${prod.title}" (${formatPrice(
                                  prod.effectivePrice
                                )}) via the AI Concierge and would like more details / custom order assistance.`,
                              })
                            }
                            title="Pre-fill Contact Form with this product"
                          >
                            <MessageSquarePlus size={14} /> Ask Store
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Follow-up Chips */}
              {msg.quickReplies &&
                msg.quickReplies.length > 0 &&
                msg.id === messages[messages.length - 1]?.id && (
                  <div className="ai-quick-chips">
                    {msg.quickReplies.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="ai-chip-btn"
                        onClick={() => sendMessage(chip, "")}
                        disabled={loading}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-msg-row assistant">
            <div className="ai-msg-avatar">
              <Loader2 size={15} className="spin" />
            </div>
            <div className="ai-bubble assistant typing">
              <span>AI Concierge is fetching the latest store data...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Box with Mic */}
      <form className="ai-input-bar" onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask AI e.g. "Track ORD-20261123-95L7", "Watch under 10k", "Delivery charges?"...'
          disabled={loading}
        />

        {micSupported && (
          <button
            type="button"
            className={`ai-mic-btn ${listening ? "listening" : ""}`}
            onClick={toggleMicInput}
            title={listening ? "Stop voice input" : "Speak your question"}
          >
            {listening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
        )}

        <button
          type="submit"
          className="ai-send-btn"
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <Loader2 size={17} className="spin" />
          ) : (
            <Send size={17} />
          )}
          <span>Ask AI</span>
        </button>
      </form>
    </section>
  );
}
