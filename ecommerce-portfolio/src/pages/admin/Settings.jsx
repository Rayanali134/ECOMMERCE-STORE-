import { useState, useEffect } from "react";
import {
  Save,
  Truck,
  RotateCcw,
  Phone,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const DEFAULT_SETTINGS = {
  storeName: "EcoStore",
  storeTagline: "Premium Online Store & Fast Deliveries",
  contactEmail: "rayanali0560@gmail.com",
  contactPhone: "+92 321 3633473",
  whatsappNumber: "+92 321 3633473",
  shippingFee: 200,
  freeShippingThreshold: 3000,
  returnPolicyDays: 7,
  returnPolicyText:
    "We provide a 7-day hassle-free return and exchange policy on all eligible items. Products must be in original condition with tags and packaging intact. Contact our WhatsApp helpline with your Order ID to initiate an exchange or refund.",
  faqs: [
    {
      question: "How do I request a return or exchange?",
      answer:
        "Simply message our WhatsApp support team with your Order ID and photo/video of the item within 7 days of delivery.",
      category: "Returns",
    },
    {
      question: "Do you offer nationwide Cash on Delivery?",
      answer:
        "Yes! We deliver across Pakistan with Cash on Delivery (COD). You pay upon receiving your package.",
      category: "Payments",
    },
  ],
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("policies");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/settings");
      const data = response.data;

      const loaded = data.settings || data.data;
      if (loaded) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...loaded,
          shippingFee: loaded.shippingFee ?? 200,
          freeShippingThreshold: loaded.freeShippingThreshold ?? 3000,
          returnPolicyDays: loaded.returnPolicyDays ?? 7,
          faqs: Array.isArray(loaded.faqs) && loaded.faqs.length > 0
            ? loaded.faqs
            : DEFAULT_SETTINGS.faqs,
        });
      }
    } catch (err) {
      console.error("Fetch Settings Error:", err);
      setError(
        err.response?.data?.message || "Could not load settings from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // FAQ handlers
  const handleAddFaq = () => {
    setSettings((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        { question: "", answer: "", category: "General" },
      ],
    }));
  };

  const handleFaqChange = (index, field, value) => {
    const updated = [...settings.faqs];
    updated[index][field] = value;
    setSettings((prev) => ({ ...prev, faqs: updated }));
  };

  const handleRemoveFaq = (index) => {
    setSettings((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setFeedback("");

      const payload = {
        storeName: settings.storeName.trim(),
        storeTagline: settings.storeTagline.trim(),
        contactEmail: settings.contactEmail.trim(),
        contactPhone: settings.contactPhone.trim(),
        whatsappNumber: settings.whatsappNumber.trim(),
        shippingFee: Number(settings.shippingFee || 0),
        freeShippingThreshold: Number(settings.freeShippingThreshold || 0),
        returnPolicyDays: Number(settings.returnPolicyDays || 7),
        returnPolicyText: settings.returnPolicyText.trim(),
        faqs: settings.faqs.filter((f) => f.question.trim()),
      };

      const response = await api.put("/settings", payload);

      if (response.data?.success) {
        setFeedback("Store settings & return policy saved successfully!");
        setTimeout(() => setFeedback(""), 4000);
      }
    } catch (err) {
      console.error("Save Settings Error:", err);
      setError(
        err.response?.data?.message || "Failed to update store settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 className="spin" size={32} />
        <span>Loading store settings...</span>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="dashboard-label">STORE CONFIGURATION</span>
          <h1>Store Settings & Policies</h1>
          <p>
            Configure your 7-day return policy, shipping fees, free delivery limits, and WhatsApp customer support hotline.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={fetchSettings}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Reload
        </button>
      </div>

      {feedback && (
        <div className="orders-feedback success">
          <CheckCircle2 size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="orders-feedback error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="settings-tabs-row" style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button
          type="button"
          className={`filter-pill ${activeTab === "policies" ? "active" : ""}`}
          onClick={() => setActiveTab("policies")}
        >
          <RotateCcw size={14} style={{ display: "inline", marginRight: 6 }} />
          7-Day Return & Shipping Policy
        </button>

        <button
          type="button"
          className={`filter-pill ${activeTab === "contact" ? "active" : ""}`}
          onClick={() => setActiveTab("contact")}
        >
          <Phone size={14} style={{ display: "inline", marginRight: 6 }} />
          Store Profile & WhatsApp Hotline
        </button>

        <button
          type="button"
          className={`filter-pill ${activeTab === "faqs" ? "active" : ""}`}
          onClick={() => setActiveTab("faqs")}
        >
          <HelpCircle size={14} style={{ display: "inline", marginRight: 6 }} />
          Customer FAQs Manager
        </button>
      </div>

      <form onSubmit={handleSave} className="admin-form-shell">
        {/* Tab 1: Policies & Shipping */}
        {activeTab === "policies" && (
          <div className="form-main-column" style={{ maxWidth: 850 }}>
            {/* Return Policy Box */}
            <div className="form-card-section">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <RotateCcw size={20} color="#34d399" />
                <h3 style={{ margin: 0 }}>7-Day Return & Exchange Guarantee</h3>
              </div>
              <p className="section-hint">
                This policy is displayed to all customers on product detail pages and the dedicated Return Policy page.
              </p>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Return Window (Days)</label>
                  <input
                    type="number"
                    name="returnPolicyDays"
                    value={settings.returnPolicyDays}
                    onChange={handleChange}
                    min="1"
                    max="90"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Detailed Return & Refund Terms</label>
                <textarea
                  name="returnPolicyText"
                  rows={5}
                  value={settings.returnPolicyText}
                  onChange={handleChange}
                  placeholder="Explain step-by-step how customers can return items..."
                />
              </div>
            </div>

            {/* Shipping & Delivery Box */}
            <div className="form-card-section">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Truck size={20} color="#818cf8" />
                <h3 style={{ margin: 0 }}>Shipping & Delivery Rates</h3>
              </div>
              <p className="section-hint">
                Standard flat delivery fee applied at checkout, plus the threshold for FREE Delivery.
              </p>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Standard Delivery Fee (Rs.)</label>
                  <input
                    type="number"
                    name="shippingFee"
                    value={settings.shippingFee}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Free Shipping Threshold (Rs.)</label>
                  <input
                    type="number"
                    name="freeShippingThreshold"
                    value={settings.freeShippingThreshold}
                    onChange={handleChange}
                    min="0"
                  />
                  <span className="discount-calc-hint">
                    Orders over this amount get FREE shipping!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Store Contacts */}
        {activeTab === "contact" && (
          <div className="form-main-column" style={{ maxWidth: 850 }}>
            <div className="form-card-section">
              <h3>Store Identity & Support Channels</h3>
              <p className="section-hint">
                These contact details appear on order confirmations, footer, and WhatsApp order buttons.
              </p>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={settings.storeName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Store Tagline / Slogan</label>
                  <input
                    type="text"
                    name="storeTagline"
                    value={settings.storeTagline}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Official WhatsApp Number</label>
                  <input
                    type="text"
                    name="whatsappNumber"
                    value={settings.whatsappNumber}
                    onChange={handleChange}
                    placeholder="+92 321 3633473"
                  />
                </div>

                <div className="form-group">
                  <label>Support Phone</label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={settings.contactPhone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Support Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: FAQs */}
        {activeTab === "faqs" && (
          <div className="form-main-column" style={{ maxWidth: 850 }}>
            <div className="form-card-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0 }}>Frequently Asked Questions (FAQs)</h3>
                  <span className="panel-caption">These appear on the Return Policy and customer help pages</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="add-spec-btn"
                >
                  <Plus size={15} /> Add FAQ
                </button>
              </div>

              <div className="faqs-admin-list" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {settings.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Question (e.g. How do I exchange an item?)"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="remove-spec-btn"
                        title="Delete FAQ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Answer to this question..."
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div style={{ marginTop: 24 }}>
          <button
            type="submit"
            className="admin-primary-btn"
            disabled={saving}
            style={{ padding: "12px 28px", fontSize: 15 }}
          >
            {saving ? (
              <>
                <Loader2 className="spin" size={18} />
                Saving Store Settings...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Store Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
