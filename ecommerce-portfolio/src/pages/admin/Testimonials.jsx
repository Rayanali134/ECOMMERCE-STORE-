
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Star,
  CheckCircle2,
  ShieldCheck,
  LoaderCircle,
  MessageSquareQuote,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";
import "./css/Testimonials.css";

const emptyForm = {
  name: "",
  designation: "",
  company: "",
  project: "",
  message: "",
  rating: 5,
  image: "",
  approved: false,
  verified: false,
  featured: false,
};

const readField = (item, ...keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }
  return "";
};

const normalize = (item) => ({
  ...item,
  id: item.id,
  name: readField(item, "name", "clientName", "client_name"),
  designation: readField(
    item,
    "designation",
    "clientDesignation",
    "client_designation",
    "role"
  ),
  company: readField(item, "company"),
  project: readField(item, "project", "projectName", "project_name"),
  message: readField(item, "message"),
  rating: Number(item.rating) || 5,
  image: readField(item, "image"),
  approved:
    item.approved === true ||
    item.approved === 1 ||
    item.approved === "true" ||
    item.isApproved === true ||
    item.is_approved === true,
  verified:
    item.verified === true ||
    item.verified === 1 ||
    item.verified === "true" ||
    item.isVerified === true ||
    item.is_verified === true,
  featured:
    item.featured === true ||
    item.featured === 1 ||
    item.featured === "true" ||
    item.isFeatured === true ||
    item.is_featured === true,
});

function Testimonials() {
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

  const loadTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/testimonials");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.testimonials ||
          response.data?.data ||
          [];

      setItems(data.map(normalize));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Testimonials load nahi huay. API aur admin permissions check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setNotice("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      designation: item.designation || "",
      company: item.company || "",
      project: item.project || "",
      message: item.message || "",
      rating: item.rating || 5,
      image: item.image || "",
      approved: Boolean(item.approved),
      verified: Boolean(item.verified),
      featured: Boolean(item.featured),
    });
    setNotice("");
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const makePayload = () => ({
    name: form.name.trim(),
    role: form.designation.trim(),
    designation: form.designation.trim(),
    clientDesignation: form.designation.trim(),
    company: form.company.trim(),
    project: form.project.trim(),
    message: form.message.trim(),
    rating: Number(form.rating),
    image: form.image.trim(),
    approved: Boolean(form.approved),
    verified: Boolean(form.verified),
    featured: Boolean(form.featured),
  });

  const saveTestimonial = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = makePayload();

      if (editing) {
        await api.put(`/testimonials/${editing.id}`, payload);
        setNotice("Testimonial successfully update ho gaya.");
      } else {
        await api.post("/testimonials", payload);
        setNotice("Naya testimonial successfully add ho gaya.");
      }

      setModalOpen(false);
      setEditing(null);
      await loadTestimonials();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Save nahi ho saka. Backend controller aur model fields check karein."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleFlag = async (item, field) => {
    setError("");
    setNotice("");

    const updated = {
      ...item,
      [field]: !item[field],
    };

    try {
      await api.put(`/testimonials/${item.id}`, {
        name: updated.name,
        role: updated.designation,
        designation: updated.designation,
        clientDesignation: updated.designation,
        company: updated.company,
        project: updated.project,
        message: updated.message,
        rating: updated.rating,
        image: updated.image,
        approved: updated.approved,
        verified: updated.verified,
        featured: updated.featured,
      });

      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? normalize(updated) : entry
        )
      );

      const labels = {
        approved: updated.approved ? "approved" : "unapproved",
        verified: updated.verified ? "verified" : "unverified",
        featured: updated.featured ? "featured" : "unfeatured",
      };

      setNotice(`Testimonial ${labels[field]} ho gaya.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Status update nahi hua. Backend update route check karein."
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/testimonials/${deleteItem.id}`);
      setItems((current) =>
        current.filter((item) => item.id !== deleteItem.id)
      );
      setNotice("Testimonial delete ho gaya.");
      setDeleteItem(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Testimonial delete nahi ho saka."
      );
      setDeleteItem(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const searchable = [
      item.name,
      item.designation,
      item.company,
      item.project,
      item.message,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchable.includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "approved" && item.approved) ||
      (filter === "pending" && !item.approved) ||
      (filter === "featured" && item.featured) ||
      (filter === "verified" && item.verified);

    return matchesSearch && matchesFilter;
  });

  const approvedCount = items.filter((item) => item.approved).length;
  const pendingCount = items.length - approvedCount;
  const featuredCount = items.filter((item) => item.featured).length;
  const verifiedCount = items.filter((item) => item.verified).length;

  return (
    <div className="testimonial-admin">
      <header className="ta-page-header">
        <div>
          <span className="ta-eyebrow">STORE REVIEW MODERATION</span>
          <h1>Customer Reviews &amp; Testimonials</h1>
          <p>Mera handmade review control: Jo customer review acha lage usko 'Publish to Site' karein, jo na pasand aye usko 'Hide / Reject' karein.</p>
        </div>

        <button className="ta-btn ta-btn-primary" onClick={openCreate}>
          <Plus size={17} />
          Add Handmade Review
        </button>
      </header>

      {error && (
        <div className="ta-alert ta-alert-error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={17} />
          </button>
        </div>
      )}

      {notice && (
        <div className="ta-alert ta-alert-success" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss message">
            <X size={17} />
          </button>
        </div>
      )}

      <section className="ta-stats">
        <div className="ta-stat-card">
          <div className="ta-stat-icon ta-icon-purple">
            <MessageSquareQuote size={20} />
          </div>
          <div>
            <span>Total reviews</span>
            <strong>{items.length}</strong>
          </div>
        </div>

        <div className="ta-stat-card">
          <div className="ta-stat-icon ta-icon-green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>

        <div className="ta-stat-card">
          <div className="ta-stat-icon ta-icon-amber">
            <Eye size={20} />
          </div>
          <div>
            <span>Pending review</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="ta-stat-card">
          <div className="ta-stat-icon ta-icon-blue">
            <Sparkles size={20} />
          </div>
          <div>
            <span>Featured</span>
            <strong>{featuredCount}</strong>
          </div>
        </div>

        <div className="ta-stat-card">
          <div className="ta-stat-icon ta-icon-teal">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span>Verified</span>
            <strong>{verifiedCount}</strong>
          </div>
        </div>
      </section>

      <section className="ta-panel">
        <div className="ta-toolbar">
          <div className="ta-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search client, company or project..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="ta-toolbar-actions">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter testimonials"
            >
              <option value="all">All testimonials</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending approval</option>
              <option value="featured">Featured</option>
              <option value="verified">Verified</option>
            </select>

            <button
              className="ta-btn ta-btn-outline"
              onClick={loadTestimonials}
              disabled={loading}
              title="Refresh testimonials"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="ta-state">
            <LoaderCircle className="ta-spinner" size={30} />
            <p>Testimonials load ho rahe hain...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="ta-state">
            <MessageSquareQuote size={32} />
            <h3>No testimonials found</h3>
            <p>Search ya filter change karein, ya naya testimonial add karein.</p>
            <button className="ta-btn ta-btn-primary" onClick={openCreate}>
              <Plus size={16} /> Add testimonial
            </button>
          </div>
        ) : (
          <>
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead>
                  <tr>
                    <th>CLIENT</th>
                    <th>REVIEW</th>
                    <th>RATING</th>
                    <th>STATUS</th>
                    <th>FEATURES</th>
                    <th className="ta-actions-heading">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="ta-client-cell">
                          <div className="ta-avatar">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt=""
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span>
                                {(item.name || "C").charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="ta-client-details">
                            <strong>{item.name || "Unnamed client"}</strong>
                            <span>
                              {[item.designation, item.company]
                                .filter(Boolean)
                                .join(" · ") || "No client details"}
                            </span>
                            {item.project && (
                              <small>Project: {item.project}</small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <p className="ta-review-preview">
                          {item.message || "No review text"}
                        </p>
                      </td>

                      <td>
                        <span className="ta-rating">
                          <Star size={14} fill="currentColor" />
                          {item.rating}/5
                        </span>
                      </td>

                      <td>
                        <span
                          className={`ta-status ${
                            item.approved ? "ta-status-approved" : "ta-status-pending"
                          }`}
                        >
                          {item.approved ? "Approved" : "Pending"}
                        </span>
                      </td>

                      <td>
                        <div className="ta-feature-tags">
                          {item.verified && (
                            <span className="ta-mini-tag ta-tag-verified">
                              Verified
                            </span>
                          )}
                          {item.featured && (
                            <span className="ta-mini-tag ta-tag-featured">
                              Featured
                            </span>
                          )}
                          {!item.verified && !item.featured && (
                            <span className="ta-muted">—</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="ta-row-actions">
                          {item.approved ? (
                            <button
                              className="ta-pill-btn ta-btn-unapprove"
                              onClick={() => toggleFlag(item, "approved")}
                              title="Site se hide karein (Unpublish / Reject)"
                              aria-label="Hide from site"
                            >
                              <EyeOff size={13} />
                              <span>Hide</span>
                            </button>
                          ) : (
                            <button
                              className="ta-pill-btn ta-btn-approve"
                              onClick={() => toggleFlag(item, "approved")}
                              title="Site par live show karein (Approve & Publish)"
                              aria-label="Publish to site"
                            >
                              <CheckCircle2 size={13} />
                              <span>Publish</span>
                            </button>
                          )}

                          <button
                            className={`ta-icon-btn ${
                              item.featured ? "is-active" : ""
                            }`}
                            onClick={() => toggleFlag(item, "featured")}
                            title={item.featured ? "Remove from Home" : "Feature on Home"}
                            aria-label={item.featured ? "Unfeature review" : "Feature on home"}
                          >
                            <Star size={16} />
                          </button>

                          <button
                            className="ta-icon-btn"
                            onClick={() => openEdit(item)}
                            title="Edit testimonial"
                            aria-label="Edit testimonial"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="ta-icon-btn ta-icon-danger"
                            onClick={() => setDeleteItem(item)}
                            title="Delete testimonial"
                            aria-label="Delete testimonial"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ta-table-footer">
              Showing {filteredItems.length} of {items.length} testimonials
            </div>
          </>
        )}
      </section>

      {modalOpen && (
        <div className="ta-modal-backdrop" onMouseDown={closeModal}>
          <section
            className="ta-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ta-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="ta-modal-header">
              <div>
                <span className="ta-eyebrow">
                  {editing ? "UPDATE CLIENT REVIEW" : "NEW CLIENT REVIEW"}
                </span>
                <h2 id="ta-modal-title">
                  {editing ? "Edit testimonial" : "Add testimonial"}
                </h2>
              </div>

              <button
                className="ta-icon-btn"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveTestimonial}>
              <div className="ta-form-grid">
                <label className="ta-field">
                  <span>Customer Name *</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    required
                    maxLength={120}
                    placeholder="e.g. Hamza Tariq"
                  />
                </label>

                <label className="ta-field">
                  <span>City / Location</span>
                  <input
                    name="designation"
                    value={form.designation}
                    onChange={updateField}
                    maxLength={120}
                    placeholder="e.g. Lahore, Punjab"
                  />
                </label>

                <label className="ta-field">
                  <span>Product Purchased</span>
                  <input
                    name="project"
                    value={form.project}
                    onChange={updateField}
                    maxLength={150}
                    placeholder="e.g. Aura Pro Wireless Headphones"
                  />
                </label>

                <label className="ta-field">
                  <span>Rating *</span>
                  <select
                    name="rating"
                    value={form.rating}
                    onChange={updateField}
                    required
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star{rating > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="ta-field ta-field-full">
                  <span>Customer Review *</span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={updateField}
                    required
                    minLength={5}
                    maxLength={3000}
                    rows={4}
                    placeholder="Customer ka feedback yahan likhein..."
                  />
                  <small>{form.message.length}/3000 characters</small>
                </label>
              </div>

              <div className="ta-form-options">
                <label className="ta-check-option">
                  <input
                    type="checkbox"
                    name="approved"
                    checked={form.approved}
                    onChange={updateField}
                  />
                  <span>
                    <CheckCircle2 size={17} />
                    <span>
                      <strong>Publish to Live Store (Approved)</strong>
                      <small>Website par live show karne ki ijazat</small>
                    </span>
                  </span>
                </label>

                <label className="ta-check-option">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={updateField}
                  />
                  <span>
                    <Sparkles size={17} />
                    <span>
                      <strong>Feature on Home Page</strong>
                      <small>Home page par highlight reviews me show karein</small>
                    </span>
                  </span>
                </label>

                <label className="ta-check-option">
                  <input
                    type="checkbox"
                    name="verified"
                    checked={form.verified}
                    onChange={updateField}
                  />
                  <span>
                    <ShieldCheck size={17} />
                    <span>
                      <strong>Verified Buyer Badge</strong>
                      <small>Green 'Verified Buyer' badge display karein</small>
                    </span>
                  </span>
                </label>
              </div>

              <div className="ta-modal-footer">
                <button
                  type="button"
                  className="ta-btn ta-btn-outline"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ta-btn ta-btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="ta-spinner" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editing ? <Pencil size={16} /> : <Plus size={16} />}
                      {editing ? "Save changes" : "Create testimonial"}
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
          className="ta-modal-backdrop"
          onMouseDown={() => setDeleteItem(null)}
        >
          <section
            className="ta-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ta-delete-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="ta-delete-icon">
              <Trash2 size={24} />
            </div>

            <h2 id="ta-delete-title">Delete testimonial?</h2>
            <p>
              <strong>{deleteItem.name}</strong> ka testimonial permanently
              delete ho jayega. Ye action undo nahi hoga.
            </p>

            <div className="ta-modal-footer">
              <button
                className="ta-btn ta-btn-outline"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                className="ta-btn ta-btn-danger"
                onClick={confirmDelete}
              >
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

export default Testimonials;
