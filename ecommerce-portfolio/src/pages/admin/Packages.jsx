
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Package,
  CheckCircle2,
  Clock3,
  Star,
  LoaderCircle,
  Tag,
  Power,
} from "lucide-react";
import api from "../../services/api";
import "./css/Packages.css";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discount: 0,
  currency: "USD",
  billingType: "one-time",
  featuresText: "",
  deliveryDays: "",
  revisions: "",
  seoTitle: "",
  seoDescription: "",
  highlighted: false,
  active: true,
};

const parseFeatures = (value) => {
  if (Array.isArray(value)) return value.join("\n");

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.join("\n");
    } catch {
      // Use the original text if it is not JSON.
    }

    return value;
  }

  return "";
};

const normalize = (item) => ({
  ...item,
  id: item.id,
  name: item.name || "",
  description: item.description || "",
  price: item.price ?? "",
  discount: item.discount ?? 0,
  currency: item.currency || "USD",
  billingType: item.billingType || item.billing_type || "one-time",
  features: Array.isArray(item.features)
    ? item.features
    : (() => {
        try {
          const parsed = JSON.parse(item.features || "[]");
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return typeof item.features === "string"
            ? item.features.split(/\r?\n|,/).filter(Boolean)
            : [];
        }
      })(),
  deliveryDays: item.deliveryDays ?? item.delivery_days ?? "",
  revisions: item.revisions ?? "",
  seoTitle: item.seoTitle || item.seo_title || "",
  seoDescription: item.seoDescription || item.seo_description || "",
  highlighted: item.highlighted === true || item.highlighted === 1,
  active: item.active === true || item.active === 1,
});

function Packages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/packages");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.packages || response.data?.data || [];

      setItems(data.map(normalize));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Packages load nahi huay. API aur admin permissions check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setError("");
    setNotice("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      discount: item.discount,
      currency: item.currency,
      billingType: item.billingType,
      featuresText: parseFeatures(item.features),
      deliveryDays: item.deliveryDays,
      revisions: item.revisions,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
      highlighted: item.highlighted,
      active: item.active,
    });
    setError("");
    setNotice("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const makePayload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    discount: Number(form.discount) || 0,
    currency: form.currency,
    billingType: form.billingType,
    billing_type: form.billingType,
    features: form.featuresText
      .split(/\r?\n/)
      .map((feature) => feature.trim())
      .filter(Boolean),
    deliveryDays:
      form.deliveryDays === "" ? null : Number(form.deliveryDays),
    revisions: form.revisions === "" ? null : Number(form.revisions),
    seoTitle: form.seoTitle.trim(),
    seoDescription: form.seoDescription.trim(),
    highlighted: Boolean(form.highlighted),
    active: Boolean(form.active),
  });

  const savePackage = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = makePayload();

      if (editing) {
        await api.put(`/packages/${editing.id}`, payload);
        setNotice("Package successfully update ho gaya.");
      } else {
        await api.post("/packages", payload);
        setNotice("Naya package successfully add ho gaya.");
      }

      setModalOpen(false);
      setEditing(null);
      await loadPackages();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Package save nahi hua. Backend model aur controller check karein."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    setError("");
    setNotice("");

    try {
      await api.put(`/packages/${item.id}`, {
        name: item.name,
        description: item.description,
        price: Number(item.price),
        discount: Number(item.discount) || 0,
        currency: item.currency,
        billingType: item.billingType,
        billing_type: item.billingType,
        features: item.features,
        deliveryDays:
          item.deliveryDays === "" ? null : Number(item.deliveryDays),
        revisions: item.revisions === "" ? null : Number(item.revisions),
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        highlighted: item.highlighted,
        active: !item.active,
      });

      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, active: !entry.active }
            : entry
        )
      );

      setNotice(
        item.active
          ? "Package deactivate ho gaya."
          : "Package activate ho gaya."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Package status update nahi hua."
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/packages/${deleteItem.id}`);

      setItems((current) =>
        current.filter((item) => item.id !== deleteItem.id)
      );

      setNotice("Package delete ho gaya.");
      setDeleteItem(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Package delete nahi ho saka."
      );
      setDeleteItem(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const text = [
      item.name,
      item.description,
      item.currency,
      item.billingType,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && item.active) ||
      (filter === "inactive" && !item.active) ||
      (filter === "highlighted" && item.highlighted);

    return matchesSearch && matchesFilter;
  });

  const activeCount = items.filter((item) => item.active).length;
  const highlightedCount = items.filter((item) => item.highlighted).length;

  const formatPrice = (price, currency) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 2,
      }).format(Number(price) || 0);
    } catch {
      return `${currency || "USD"} ${Number(price || 0).toLocaleString()}`;
    }
  };

  return (
    <div className="package-admin">
      <header className="pa-page-header">
        <div>
          <span className="pa-eyebrow">BUSINESS MANAGEMENT</span>
          <h1>Packages</h1>
          <p>Pricing, package features, discounts aur visibility manage karein.</p>
        </div>

        <button className="pa-btn pa-btn-primary" onClick={openCreate}>
          <Plus size={17} />
          Add package
        </button>
      </header>

      {error && (
        <div className="pa-alert pa-alert-error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={17} />
          </button>
        </div>
      )}

      {notice && (
        <div className="pa-alert pa-alert-success" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss message">
            <X size={17} />
          </button>
        </div>
      )}

      <section className="pa-stats">
        <div className="pa-stat-card">
          <div className="pa-stat-icon pa-purple">
            <Package size={20} />
          </div>
          <div>
            <span>Total packages</span>
            <strong>{items.length}</strong>
          </div>
        </div>

        <div className="pa-stat-card">
          <div className="pa-stat-icon pa-green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Active packages</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="pa-stat-card">
          <div className="pa-stat-icon pa-amber">
            <Star size={20} />
          </div>
          <div>
            <span>Highlighted</span>
            <strong>{highlightedCount}</strong>
          </div>
        </div>

        <div className="pa-stat-card">
          <div className="pa-stat-icon pa-blue">
            <Tag size={20} />
          </div>
          <div>
            <span>Inactive</span>
            <strong>{items.length - activeCount}</strong>
          </div>
        </div>
      </section>

      <section className="pa-panel">
        <div className="pa-toolbar">
          <div className="pa-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search packages..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="pa-toolbar-actions">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter packages"
            >
              <option value="all">All packages</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="highlighted">Highlighted</option>
            </select>

            <button
              className="pa-btn pa-btn-outline"
              onClick={loadPackages}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="pa-state">
            <LoaderCircle className="pa-spinner" size={30} />
            <p>Packages load ho rahe hain...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="pa-state">
            <Package size={32} />
            <h3>No packages found</h3>
            <p>Search ya filter change karein, ya naya package create karein.</p>
            <button className="pa-btn pa-btn-primary" onClick={openCreate}>
              <Plus size={16} /> Add package
            </button>
          </div>
        ) : (
          <>
            <div className="pa-table-wrap">
              <table className="pa-table">
                <thead>
                  <tr>
                    <th>PACKAGE</th>
                    <th>PRICE</th>
                    <th>BILLING</th>
                    <th>DELIVERY</th>
                    <th>STATUS</th>
                    <th>FEATURED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => {
                    const discount =
                      Number(item.discount) > 0 &&
                      Number(item.discount) <= 100;
                    const finalPrice = discount
                      ? Number(item.price) * (1 - Number(item.discount) / 100)
                      : Number(item.price);

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="pa-package-cell">
                            <div className="pa-package-icon">
                              <Package size={19} />
                            </div>
                            <div>
                              <strong>{item.name}</strong>
                              <span>{item.description || "No description"}</span>
                              <small>
                                {item.features.length} feature
                                {item.features.length === 1 ? "" : "s"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="pa-price-cell">
                            <strong>{formatPrice(finalPrice, item.currency)}</strong>
                            {discount && (
                              <>
                                <del>{formatPrice(item.price, item.currency)}</del>
                                <small>{item.discount}% discount</small>
                              </>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="pa-billing">
                            {item.billingType || "one-time"}
                          </span>
                        </td>

                        <td>
                          <span className="pa-delivery">
                            <Clock3 size={14} />
                            {item.deliveryDays !== "" &&
                            item.deliveryDays !== null
                              ? `${item.deliveryDays} days`
                              : "Not set"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`pa-status ${
                              item.active ? "pa-status-active" : "pa-status-inactive"
                            }`}
                          >
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          {item.highlighted ? (
                            <span className="pa-featured">
                              <Star size={13} fill="currentColor" />
                              Featured
                            </span>
                          ) : (
                            <span className="pa-muted">—</span>
                          )}
                        </td>

                        <td>
                          <div className="pa-row-actions">
                            <button
                              className={`pa-icon-btn ${
                                item.active ? "pa-active-action" : ""
                              }`}
                              onClick={() => toggleActive(item)}
                              title={item.active ? "Deactivate package" : "Activate package"}
                              aria-label={item.active ? "Deactivate package" : "Activate package"}
                            >
                              <Power size={16} />
                            </button>

                            <button
                              className="pa-icon-btn"
                              onClick={() => openEdit(item)}
                              title="Edit package"
                              aria-label="Edit package"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="pa-icon-btn pa-icon-danger"
                              onClick={() => setDeleteItem(item)}
                              title="Delete package"
                              aria-label="Delete package"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pa-table-footer">
              Showing {filteredItems.length} of {items.length} packages
            </div>
          </>
        )}
      </section>

      {modalOpen && (
        <div className="pa-modal-backdrop" onMouseDown={closeModal}>
          <section
            className="pa-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pa-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="pa-modal-header">
              <div>
                <span className="pa-eyebrow">
                  {editing ? "UPDATE PRICING" : "CREATE PRICING"}
                </span>
                <h2 id="pa-modal-title">
                  {editing ? "Edit package" : "Create package"}
                </h2>
              </div>

              <button
                className="pa-icon-btn"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={savePackage}>
              <div className="pa-form-section">
                <h3>Package information</h3>

                <div className="pa-form-grid">
                  <label className="pa-field">
                    <span>Package name *</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      required
                      maxLength={150}
                      placeholder="e.g. Professional"
                    />
                  </label>

                  <label className="pa-field">
                    <span>Billing type *</span>
                    <select
                      name="billingType"
                      value={form.billingType}
                      onChange={updateField}
                      required
                    >
                      <option value="one-time">One-time payment</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </label>

                  <label className="pa-field pa-field-full">
                    <span>Description *</span>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={updateField}
                      required
                      maxLength={1000}
                      rows={3}
                      placeholder="Package kis type ke customer ke liye hai?"
                    />
                  </label>
                </div>
              </div>

              <div className="pa-form-section">
                <h3>Pricing and delivery</h3>

                <div className="pa-form-grid">
                  <label className="pa-field">
                    <span>Price *</span>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={updateField}
                      required
                      placeholder="e.g. 499"
                    />
                  </label>

                  <label className="pa-field">
                    <span>Discount (%)</span>
                    <input
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.discount}
                      onChange={updateField}
                    />
                  </label>

                  <label className="pa-field">
                    <span>Currency *</span>
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={updateField}
                      required
                    >
                      <option value="USD">USD — US Dollar</option>
                      <option value="PKR">PKR — Pakistani Rupee</option>
                      <option value="GBP">GBP — British Pound</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="AED">AED — UAE Dirham</option>
                      <option value="SAR">SAR — Saudi Riyal</option>
                      <option value="INR">INR — Indian Rupee</option>
                    </select>
                  </label>

                  <label className="pa-field">
                    <span>Delivery days</span>
                    <input
                      name="deliveryDays"
                      type="number"
                      min="0"
                      step="1"
                      value={form.deliveryDays}
                      onChange={updateField}
                      placeholder="e.g. 14"
                    />
                  </label>

                  <label className="pa-field">
                    <span>Number of revisions</span>
                    <input
                      name="revisions"
                      type="number"
                      min="0"
                      step="1"
                      value={form.revisions}
                      onChange={updateField}
                      placeholder="e.g. 3"
                    />
                  </label>

                  <div className="pa-price-preview">
                    <span>Customer price preview</span>
                    <strong>
                      {formatPrice(
                        Number(form.price || 0) *
                          (Number(form.discount) > 0 &&
                          Number(form.discount) <= 100
                            ? 1 - Number(form.discount) / 100
                            : 1),
                        form.currency
                      )}
                    </strong>
                    {Number(form.discount) > 0 &&
                      Number(form.discount) <= 100 && (
                        <small>
                          {form.discount}% discount applied
                        </small>
                      )}
                  </div>
                </div>
              </div>

              <div className="pa-form-section">
                <h3>Features and SEO</h3>

                <div className="pa-form-grid">
                  <label className="pa-field pa-field-full">
                    <span>Features — one per line</span>
                    <textarea
                      name="featuresText"
                      value={form.featuresText}
                      onChange={updateField}
                      rows={5}
                      placeholder={"Responsive website\nContact form\nBasic SEO"}
                    />
                  </label>

                  <label className="pa-field">
                    <span>SEO title</span>
                    <input
                      name="seoTitle"
                      value={form.seoTitle}
                      onChange={updateField}
                      maxLength={255}
                      placeholder="Search engine title"
                    />
                  </label>

                  <label className="pa-field">
                    <span>SEO description</span>
                    <textarea
                      name="seoDescription"
                      value={form.seoDescription}
                      onChange={updateField}
                      rows={3}
                      maxLength={500}
                      placeholder="Short description for search engines"
                    />
                  </label>
                </div>
              </div>

              <div className="pa-form-options">
                <label className="pa-check-option">
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={updateField}
                  />
                  <span>
                    <CheckCircle2 size={17} />
                    <span>
                      <strong>Active package</strong>
                      <small>Public pricing page par show hoga</small>
                    </span>
                  </span>
                </label>

                <label className="pa-check-option">
                  <input
                    type="checkbox"
                    name="highlighted"
                    checked={form.highlighted}
                    onChange={updateField}
                  />
                  <span>
                    <Star size={17} />
                    <span>
                      <strong>Highlight package</strong>
                      <small>Most popular badge show hoga</small>
                    </span>
                  </span>
                </label>
              </div>

              <div className="pa-modal-footer">
                <button
                  type="button"
                  className="pa-btn pa-btn-outline"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="pa-btn pa-btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="pa-spinner" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editing ? <Pencil size={16} /> : <Plus size={16} />}
                      {editing ? "Save changes" : "Create package"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteItem && (
        <div
          className="pa-modal-backdrop"
          onMouseDown={() => setDeleteItem(null)}
        >
          <section
            className="pa-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="pa-delete-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="pa-delete-icon">
              <Trash2 size={24} />
            </div>

            <h2 id="pa-delete-title">Delete package?</h2>
            <p>
              <strong>{deleteItem.name}</strong> permanently delete ho jayega.
              Ye action undo nahi hoga.
            </p>

            <div className="pa-modal-footer">
              <button
                className="pa-btn pa-btn-outline"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>

              <button className="pa-btn pa-btn-danger" onClick={confirmDelete}>
                <Trash2 size={16} />
                Delete permanently
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Packages;
