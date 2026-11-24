import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Mail,
  Clock3,
  CheckCircle2,
  Eye,
  Trash2,
  X,
  LoaderCircle,
  AlertCircle,
  CalendarDays,
  MessageCircle,
  ShoppingBag,
  Send,
  Ticket,
} from "lucide-react";

import api from "../../services/api";
import "./css/Inquiries.css";

const STATUSES = ["new", "read", "replied", "closed"];
const CATEGORIES = [
  "Order & Delivery",
  "Return / Exchange",
  "Product Request",
  "Bulk / Wholesale",
  "General Support",
];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export default function Inquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/inquiries");
      const data = response.data;
      const rows = Array.isArray(data)
        ? data
        : data?.inquiries || data?.data || [];
      setItems(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load inquiries from backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesStatus = status === "all" || item.status === status;
      const matchesCategory =
        category === "all" ||
        (item.category || "Product Request") === category;
      const matchesSearch =
        !query ||
        [
          item.ticketNumber,
          item.orderNumber,
          item.category,
          item.name,
          item.email,
          item.phone,
          item.subject,
          item.productTitle,
          item.message,
        ].some((value) => String(value || "").toLowerCase().includes(query));
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [items, search, status, category]);

  const openDetails = (item) => {
    setSelected(item);
    setReplyText(item.adminReply || "");
  };

  const updateStatus = async (item, nextStatus) => {
    const id = item._id || item.id;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await api.put(`/inquiries/${id}`, {
        status: nextStatus,
      });
      const updated = response.data?.data || response.data?.inquiry;

      setItems((old) =>
        old.map((row) =>
          (row._id || row.id) === id
            ? { ...row, ...(updated || {}), status: nextStatus }
            : row
        )
      );
      setSelected((old) =>
        (old?._id || old?.id) === id
          ? { ...old, ...(updated || {}), status: nextStatus }
          : old
      );
      setNotice("Ticket status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update inquiry status."
      );
    } finally {
      setBusy(false);
    }
  };

  const saveAdminReply = async (e) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;

    const id = selected._id || selected.id;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await api.put(`/inquiries/${id}`, {
        adminReply: replyText.trim(),
        status: "replied",
      });
      const updated = response.data?.data || response.data?.inquiry;

      setItems((old) =>
        old.map((row) =>
          (row._id || row.id) === id
            ? {
                ...row,
                ...(updated || {}),
                adminReply: replyText.trim(),
                status: "replied",
              }
            : row
        )
      );
      setSelected((old) =>
        old
          ? {
              ...old,
              ...(updated || {}),
              adminReply: replyText.trim(),
              status: "replied",
            }
          : null
      );
      setNotice(
        selected.email
          ? `Official reply saved and dispatched to customer's email (${selected.email})!`
          : "Official reply saved! Customer can now see it via their Ticket ID."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save reply.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleteItem) return;
    const id = deleteItem._id || deleteItem.id;
    setBusy(true);
    setError("");
    try {
      await api.delete(`/inquiries/${id}`);
      setItems((old) => old.filter((row) => (row._id || row.id) !== id));
      setSelected((old) => ((old?._id || old?.id) === id ? null : old));
      setDeleteItem(null);
      setNotice("Ticket deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete inquiry.");
    } finally {
      setBusy(false);
    }
  };

  const counts = {
    total: items.length,
    new: items.filter((x) => x.status === "new").length,
    replied: items.filter((x) => x.status === "replied").length,
    closed: items.filter((x) => x.status === "closed").length,
  };

  return (
    <main className="inq-admin">
      <header className="inq-admin__header">
        <div>
          <span className="inq-admin__eyebrow">STORE SUPPORT & CONCIERGE</span>
          <h1>
            Support Tickets & <span>Product Inquiries</span>
          </h1>
          <p>
            Manage order support, 7-day return requests, custom product requests,
            and reply live to customers via Ticket ID or WhatsApp.
          </p>
        </div>
        <button
          className="inq-admin__refresh"
          onClick={load}
          type="button"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "inq-admin__spin" : ""} />{" "}
          Refresh
        </button>
      </header>

      {error && (
        <div className="inq-admin__alert inq-admin__alert--error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}
      {notice && (
        <div className="inq-admin__alert inq-admin__alert--success">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      <section className="inq-admin__stats">
        <article>
          <span className="inq-admin__stat-icon inq-admin__purple">
            <Ticket size={20} />
          </span>
          <div>
            <small>Total Tickets</small>
            <strong>{counts.total}</strong>
          </div>
        </article>
        <article>
          <span className="inq-admin__stat-icon inq-admin__orange">
            <Clock3 size={20} />
          </span>
          <div>
            <small>New / Pending</small>
            <strong>{counts.new}</strong>
          </div>
        </article>
        <article>
          <span className="inq-admin__stat-icon inq-admin__green">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <small>Replied</small>
            <strong>{counts.replied}</strong>
          </div>
        </article>
        <article>
          <span className="inq-admin__stat-icon inq-admin__blue">
            <CalendarDays size={20} />
          </span>
          <div>
            <small>Closed</small>
            <strong>{counts.closed}</strong>
          </div>
        </article>
      </section>

      <section className="inq-admin__panel">
        <div className="inq-admin__panel-head">
          <div>
            <h2>Incoming Store Tickets & Inquiries</h2>
            <p>
              Messages submitted from the Contact Us page and Product Details pages.
            </p>
          </div>
          <span>{filtered.length} tickets</span>
        </div>

        <div className="inq-admin__toolbar">
          <label className="inq-admin__search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Ticket #, Order #, customer, phone, product..."
            />
          </label>
          <select
            className="inq-admin__filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Topics</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="inq-admin__filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="inq-admin__empty">
            <LoaderCircle className="inq-admin__spin" size={27} />
            Loading store tickets...
          </div>
        ) : filtered.length === 0 ? (
          <div className="inq-admin__empty">
            <Mail size={32} />
            <h3>No tickets found</h3>
            <p>
              Customer messages submitted via Contact Us or product pages will appear here.
            </p>
          </div>
        ) : (
          <div className="inq-admin__table-wrap">
            <table className="inq-admin__table">
              <thead>
                <tr>
                  <th>Ticket & Customer</th>
                  <th>Topic / Product</th>
                  <th>Contact Info</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const id = item._id || item.id;
                  const cleanPhone = (item.phone || "").replace(/[^0-9]/g, "");
                  const subjectOrProduct =
                    item.productTitle || item.subject || item.category || "Store Inquiry";

                  return (
                    <tr key={id}>
                      <td>
                        <div className="inq-admin__customer">
                          <span>{(item.name || "?")[0].toUpperCase()}</span>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <strong>{item.name}</strong>
                              {item.priority === "high" && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    padding: "2px 6px",
                                    borderRadius: 6,
                                    background: "rgba(245, 158, 11, 0.2)",
                                    color: "#fbbf24",
                                  }}
                                >
                                  HIGH
                                </span>
                              )}
                            </div>
                            <small style={{ fontFamily: "monospace", color: "#a5b4fc" }}>
                              {item.ticketNumber || "DIRECT-INQ"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="inq-admin__project">
                          <ShoppingBag
                            size={13}
                            style={{ display: "inline", marginRight: 5 }}
                          />
                          {subjectOrProduct}
                        </strong>
                        <small className="inq-admin__sub">
                          {item.category || "Product Request"}
                          {item.orderNumber ? ` • Order: ${item.orderNumber}` : ""}
                        </small>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <span>{item.phone || "—"}</span>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${item.name}, this is EcoStore Support regarding your ticket ${item.ticketNumber || ""} (${subjectOrProduct}).`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "#34d399",
                                fontSize: 11,
                                fontWeight: 600,
                                textDecoration: "none",
                              }}
                            >
                              💬 WhatsApp ({item.preferredContact || "whatsapp"})
                            </a>
                          )}
                        </div>
                      </td>
                      <td>{formatDate(item.createdAt || item.created_at)}</td>
                      <td>
                        <span
                          className={`inq-admin__badge inq-admin__badge--${
                            item.status || "new"
                          }`}
                        >
                          {item.status || "new"}
                        </span>
                      </td>
                      <td>
                        <div className="inq-admin__actions">
                          <button
                            type="button"
                            title="View & Reply"
                            onClick={() => openDetails(item)}
                          >
                            <Eye size={16} />
                          </button>
                          <select
                            aria-label="Update ticket status"
                            value={item.status || "new"}
                            disabled={busy}
                            onChange={(e) => updateStatus(item, e.target.value)}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="inq-admin__danger"
                            title="Delete ticket"
                            onClick={() => setDeleteItem(item)}
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
        )}
      </section>

      {/* Selected Ticket Modal with Official Reply Box */}
      {selected && (
        <div
          className="inq-admin__overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <section className="inq-admin__modal" role="dialog" aria-modal="true">
            <header>
              <div>
                <small>
                  {selected.ticketNumber || "SUPPORT TICKET"} •{" "}
                  {selected.category || "Store Inquiry"}
                </small>
                <h2>
                  {selected.productTitle ||
                    selected.subject ||
                    "Customer Request"}
                </h2>
              </div>
              <button type="button" onClick={() => setSelected(null)}>
                <X size={19} />
              </button>
            </header>

            <div className="inq-admin__details">
              <p>
                <strong>Customer:</strong>
                <span>{selected.name}</span>
              </p>
              <p>
                <strong>Phone / WhatsApp:</strong>
                <span>{selected.phone || "Not provided"}</span>
              </p>
              <p>
                <strong>Email:</strong>
                <span>{selected.email || "Not provided"}</span>
              </p>
              <p>
                <strong>Preferred Reply:</strong>
                <span style={{ textTransform: "capitalize" }}>
                  {selected.preferredContact || "WhatsApp"}
                </span>
              </p>
              {selected.orderNumber && (
                <p>
                  <strong>Order Number:</strong>
                  <span style={{ fontFamily: "monospace", color: "#a5b4fc" }}>
                    {selected.orderNumber}
                  </span>
                </p>
              )}
              {selected.productTitle && (
                <p>
                  <strong>Product:</strong>
                  <span>
                    {selected.productTitle} (Qty: {selected.requestedQuantity || 1})
                  </span>
                </p>
              )}
              {selected.budget && (
                <p>
                  <strong>Budget:</strong>
                  <span>{selected.budget}</span>
                </p>
              )}
              <p>
                <strong>Received:</strong>
                <span>{formatDate(selected.createdAt)}</span>
              </p>
            </div>

            <div className="inq-admin__message">
              <strong>CUSTOMER&apos;S MESSAGE:</strong>
              <p>{selected.message}</p>
            </div>

            {/* Official Store Reply Form */}
            <form
              onSubmit={saveAdminReply}
              style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}
            >
              <label
                htmlFor="admin-reply-input"
                style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}
              >
                OFFICIAL STORE REPLY (Customer can view this live via Ticket ID):
              </label>
              <textarea
                id="admin-reply-input"
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply to this customer (e.g. Your exchange is approved, courier will pick up tomorrow)..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 12,
                  borderRadius: 10,
                  background: "#0b1120",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#ffffff",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              />
              <button
                type="submit"
                disabled={busy || !replyText.trim()}
                style={{
                  alignSelf: "flex-start",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 18px",
                  borderRadius: 9,
                  border: "none",
                  background: "#6366f1",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <Send size={14} />
                {busy ? "Saving Reply..." : "Save Official Reply"}
              </button>
            </form>

            <div className="inq-admin__modal-footer">
              {selected.phone && (
                <a
                  href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello ${selected.name}, this is EcoStore Support regarding Ticket ${selected.ticketNumber || ""}. ${replyText.trim() || "How can we help you today?"}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#34d399",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  <MessageCircle size={16} /> Send Reply on WhatsApp
                </a>
              )}
              {selected.email && (
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(
                    `Re: EcoStore Ticket ${selected.ticketNumber || ""} - ${selected.subject || "Support"}`
                  )}`}
                >
                  Reply by Email
                </a>
              )}
              <button type="button" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {deleteItem && (
        <div className="inq-admin__overlay">
          <section className="inq-admin__confirm" role="dialog" aria-modal="true">
            <h2>Delete this ticket?</h2>
            <p>This action permanently removes this customer inquiry.</p>
            <div>
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button type="button" onClick={remove} disabled={busy}>
                {busy ? "Deleting..." : "Delete ticket"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
