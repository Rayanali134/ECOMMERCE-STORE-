
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  MessageSquare,
  Mail,
  Clock3,
  CheckCircle2,
  Archive,
  Eye,
  Trash2,
  X,
  LoaderCircle,
  Inbox,
  AlertCircle,
  ChevronDown,
  Send,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";

import api from "../../services/api";
import "./css/Messages.css";

const STATUSES = ["unread", "read", "replied", "archived"];


function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionId, setActionId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = useCallback(async (isRefresh = false) => {
    try {
      setError("");
      setNotice("");

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await api.get("/messages");
      const payload = response.data;

      const rows = Array.isArray(payload)
        ? payload
        : payload?.data;

      setMessages(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error("Messages fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Messages load nahi ho sake. Login aur backend check karein."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesSearch =
        !query ||
        [item.name, item.email, item.subject, item.message]
          .some((value) =>
            String(value || "").toLowerCase().includes(query)
          );

      return matchesStatus && matchesSearch;
    });
  }, [messages, search, statusFilter]);

  const stats = useMemo(() => ({
    total: messages.length,
    unread: messages.filter((m) => m.status === "unread").length,
    replied: messages.filter((m) => m.status === "replied").length,
    archived: messages.filter((m) => m.status === "archived").length,
  }), [messages]);

  const updateStatus = async (item, status) => {
    try {
      setActionId(item.id);
      setError("");
      setNotice("");

      const response = await api.put(`/messages/${item.id}`, { status });
      const updated = response.data?.data;

      setMessages((previous) =>
        previous.map((message) =>
          message.id === item.id
            ? { ...message, ...(updated || {}), status }
            : message
        )
      );

      setSelectedMessage((previous) =>
        previous?.id === item.id
          ? { ...previous, ...(updated || {}), status }
          : previous
      );

      setNotice("Message status successfully update ho gaya.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Status update nahi ho saka."
      );
    } finally {
      setActionId(null);
    }
  };

  const deleteMessage = async () => {
    if (!deleteTarget) return;

    try {
      setActionId(deleteTarget.id);
      setError("");
      setNotice("");

      await api.delete(`/messages/${deleteTarget.id}`);

      setMessages((previous) =>
        previous.filter((item) => item.id !== deleteTarget.id)
      );

      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null);
      }

      setDeleteTarget(null);
      setNotice("Message delete ho gaya.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Message delete nahi ho saka."
      );
    } finally {
      setActionId(null);
    }
  };

  const openMessage = async (item) => {
    setSelectedMessage(item);
    setReplyText(item.adminReply || "");

    if (item.status === "unread") {
      await updateStatus(item, "read");
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setSendingReply(true);
      setError("");
      setNotice("");

      const response = await api.put(`/messages/${selectedMessage.id}`, {
        adminReply: replyText.trim(),
        status: "replied",
      });

      const updated =
        response.data?.data ||
        response.data?.inquiry ||
        response.data?.ticket;

      setMessages((previous) =>
        previous.map((message) =>
          message.id === selectedMessage.id
            ? {
                ...message,
                ...(updated || {}),
                adminReply: replyText.trim(),
                status: "replied",
              }
            : message
        )
      );

      setSelectedMessage((previous) =>
        previous
          ? {
              ...previous,
              ...(updated || {}),
              adminReply: replyText.trim(),
              status: "replied",
            }
          : null
      );

      setNotice(
        selectedMessage.email
          ? `Official reply sent to ${selectedMessage.email} and saved to ticket!`
          : "Official reply saved to support ticket successfully!"
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send official reply."
      );
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <main className="msg-admin">
      <header className="msg-admin__header">
        <div>
          <div className="msg-admin__eyebrow">
            <span className="msg-admin__eyebrow-dot" />
            COMMUNICATION CENTER
          </div>

          <h1>Messages <span>Inbox</span></h1>

          <p>
            Customer conversations ko manage karein aur har inquiry ka
            timely response dein.
          </p>
        </div>

        <button
          className="msg-admin__refresh"
          type="button"
          onClick={() => fetchMessages(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "msg-admin__spin" : ""}
          />
          Refresh
        </button>
      </header>

      {error && (
        <div className="msg-admin__alert msg-admin__alert--error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="msg-admin__alert msg-admin__alert--success">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
        </div>
      )}

      <section className="msg-admin__stats">
        <article className="msg-admin__stat">
          <div className="msg-admin__stat-icon msg-admin__stat-icon--purple">
            <MessageSquare size={21} />
          </div>
          <div>
            <span>Total messages</span>
            <strong>{stats.total}</strong>
            <small>All conversations</small>
          </div>
        </article>

        <article className="msg-admin__stat">
          <div className="msg-admin__stat-icon msg-admin__stat-icon--orange">
            <Mail size={21} />
          </div>
          <div>
            <span>Unread</span>
            <strong>{stats.unread}</strong>
            <small>Need your attention</small>
          </div>
        </article>

        <article className="msg-admin__stat">
          <div className="msg-admin__stat-icon msg-admin__stat-icon--green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Replied</span>
            <strong>{stats.replied}</strong>
            <small>Marked as replied</small>
          </div>
        </article>

        <article className="msg-admin__stat">
          <div className="msg-admin__stat-icon msg-admin__stat-icon--blue">
            <Archive size={21} />
          </div>
          <div>
            <span>Archived</span>
            <strong>{stats.archived}</strong>
            <small>Stored conversations</small>
          </div>
        </article>
      </section>

      <section className="msg-admin__panel">
        <div className="msg-admin__panel-heading">
          <div>
            <h2>Customer conversations</h2>
            <p>Search, review and manage incoming messages.</p>
          </div>

          <span className="msg-admin__count">
            {filteredMessages.length} results
          </span>
        </div>

        <div className="msg-admin__toolbar">
          <label className="msg-admin__search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search name, email or subject..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="msg-admin__filter">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All messages</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </label>
        </div>

        {loading ? (
          <div className="msg-admin__state">
            <LoaderCircle className="msg-admin__spin" size={30} />
            <p>Messages load ho rahe hain...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="msg-admin__state">
            <div className="msg-admin__empty-icon">
              <Inbox size={30} />
            </div>
            <h3>No messages found</h3>
            <p>
              {messages.length
                ? "Search ya status filter change karke dekhein."
                : "Customer ke messages yahan show honge."}
            </p>
            {(search || statusFilter !== "all") && (
              <button
                type="button"
                className="msg-admin__clear"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="msg-admin__table-wrap">
              <table className="msg-admin__table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Subject / Message</th>
                    <th>Date received</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMessages.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        item.status === "unread"
                          ? "msg-admin__row--unread"
                          : ""
                      }
                    >
                      <td>
                        <div className="msg-admin__customer">
                          <span className="msg-admin__avatar">
                            {(item.name || "?").trim().charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <strong>{item.name || "Unknown customer"}</strong>
                            <span>{item.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="msg-admin__subject">
                          <strong>{item.subject || "No subject"}</strong>
                          <span>{item.message || ""}</span>
                        </div>
                      </td>

                      <td>
                        <span className="msg-admin__date">
                          <Clock3 size={14} />
                          {formatDate(item.createdAt || item.created_at)}
                        </span>
                      </td>

                      <td>
                        <span className={`msg-admin__badge msg-admin__badge--${item.status || "unread"}`}>
                          <span />
                          {item.status || "unread"}
                        </span>
                      </td>

                      <td>
                        <div className="msg-admin__actions">
                          <button
                            type="button"
                            className="msg-admin__icon-btn"
                            title="View message"
                            aria-label="View message"
                            onClick={() => openMessage(item)}
                          >
                            <Eye size={17} />
                          </button>

                          <label className="msg-admin__status-select">
                            <select
                              aria-label="Change message status"
                              value={item.status || "unread"}
                              disabled={actionId === item.id}
                              onChange={(event) =>
                                updateStatus(item, event.target.value)
                              }
                            >
                              {STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </label>

                          <button
                            type="button"
                            className="msg-admin__icon-btn msg-admin__icon-btn--danger"
                            title="Delete message"
                            aria-label="Delete message"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="msg-admin__table-footer">
              <span>
                Showing {filteredMessages.length} of {messages.length} messages
              </span>
              <span>Sorted by newest first</span>
            </footer>
          </>
        )}
      </section>

      {selectedMessage && (
        <div
          className="msg-admin__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMessage(null);
            }
          }}
        >
          <section
            className="msg-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="msg-admin-modal-title"
          >
            <header className="msg-admin__modal-header">
              <div>
                <span className="msg-admin__modal-kicker">
                  CUSTOMER MESSAGE
                </span>
                <h2 id="msg-admin-modal-title">
                  {selectedMessage.subject || "No subject"}
                </h2>
              </div>

              <button
                type="button"
                className="msg-admin__icon-btn"
                aria-label="Close details"
                onClick={() => setSelectedMessage(null)}
              >
                <X size={20} />
              </button>
            </header>

            <div className="msg-admin__modal-customer">
              <span className="msg-admin__avatar msg-admin__avatar--large">
                {(selectedMessage.name || "?").trim().charAt(0).toUpperCase()}
              </span>
              <div>
                <strong>{selectedMessage.name}</strong>
                {selectedMessage.email ? (
                  <a href={`mailto:${selectedMessage.email}`}>
                    {selectedMessage.email}
                  </a>
                ) : (
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>No email provided</span>
                )}
                {(selectedMessage.phone || selectedMessage.whatsapp) && (
                  <span style={{ fontSize: "12px", color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Phone size={12} />
                    {selectedMessage.whatsapp || selectedMessage.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="msg-admin__modal-meta">
              <span>
                <Clock3 size={15} />
                {formatDate(
                  selectedMessage.createdAt || selectedMessage.created_at
                )}
              </span>
              {selectedMessage.ticketNumber && (
                <span className="msg-admin__ticket-tag">
                  #{selectedMessage.ticketNumber}
                </span>
              )}
              {selectedMessage.category && (
                <span className="msg-admin__category-tag">
                  {selectedMessage.category}
                </span>
              )}
              <span className={`msg-admin__badge msg-admin__badge--${selectedMessage.status}`}>
                <span />
                {selectedMessage.status}
              </span>
            </div>

            <div className="msg-admin__message-body">
              <span>CUSTOMER'S MESSAGE</span>
              <p>{selectedMessage.message}</p>
            </div>

            {selectedMessage.adminReply && (
              <div className="msg-admin__existing-reply">
                <div className="msg-admin__reply-badge">
                  <Sparkles size={14} />
                  <span>PREVIOUS STORE REPLY</span>
                </div>
                <p>{selectedMessage.adminReply}</p>
              </div>
            )}

            <form onSubmit={handleSendReply} className="msg-admin__reply-form">
              <div className="msg-admin__reply-form-header">
                <Sparkles size={15} />
                <span>
                  {selectedMessage.adminReply ? "Update Official Store Reply" : "Send Official Reply by Email"}
                </span>
              </div>
              <textarea
                rows={3}
                required
                className="msg-admin__reply-input"
                placeholder={
                  selectedMessage.email
                    ? `Type your response to ${selectedMessage.name}... This sends a real email to ${selectedMessage.email} and updates the ticket.`
                    : `Type your response to ${selectedMessage.name}... Customer will see this on /contact using ticket #${selectedMessage.ticketNumber || selectedMessage.id}.`
                }
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="msg-admin__reply-actions-row">
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="msg-admin__send-reply-btn"
                >
                  {sendingReply ? (
                    <>
                      <LoaderCircle className="msg-admin__spin" size={15} />
                      Sending Official Reply...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      {selectedMessage.email ? "Send Reply to Customer Email" : "Save Official Reply"}
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="msg-admin__modal-actions">
              {(selectedMessage.whatsapp || selectedMessage.phone) && (
                <a
                  className="msg-admin__whatsapp-btn"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/${String(selectedMessage.whatsapp || selectedMessage.phone).replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum ${selectedMessage.name}! In response to your inquiry #${selectedMessage.ticketNumber || ""}:`
                  )}`}
                >
                  <MessageCircle size={15} />
                  WhatsApp
                </a>
              )}

              {selectedMessage.email && (
                <a
                  className="msg-admin__reply-btn"
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    `Re: ${selectedMessage.subject || "Your message to EcoStore"}`
                  )}`}
                >
                  <Mail size={15} />
                  Email App
                </a>
              )}

              <button
                type="button"
                className="msg-admin__secondary-btn"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="msg-admin__overlay">
          <section
            className="msg-admin__confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="msg-admin-delete-title"
          >
            <div className="msg-admin__confirm-icon">
              <Trash2 size={24} />
            </div>
            <h2 id="msg-admin-delete-title">Delete this message?</h2>
            <p>
              This will permanently remove the message from your inbox.
            </p>
            <div className="msg-admin__modal-actions">
              <button
                type="button"
                className="msg-admin__secondary-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={actionId === deleteTarget.id}
              >
                Cancel
              </button>
              <button
                type="button"
                className="msg-admin__delete-btn"
                onClick={deleteMessage}
                disabled={actionId === deleteTarget.id}
              >
                {actionId === deleteTarget.id ? (
                  <LoaderCircle className="msg-admin__spin" size={17} />
                ) : (
                  <Trash2 size={17} />
                )}
                Delete message
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Messages;
