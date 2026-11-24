import { useEffect, useState, useCallback } from "react";
import {
  Truck,
  Search,
  RefreshCw,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import api from "../../services/api";
import "./css/Orders.css";

const STATUS_OPTIONS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function formatPrice(val) {
  return "Rs. " + Number(val || 0).toLocaleString();
}

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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [trackingInputs, setTrackingInputs] = useState({});

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await api.get("/orders", { params });
      const data = response.data;

      const orderList = Array.isArray(data)
        ? data
        : data.orders || data.data || [];

      setOrders(orderList);

      // Pre-fill tracking number inputs
      const trackingMap = {};
      orderList.forEach((ord) => {
        const id = ord._id || ord.id;
        trackingMap[id] = ord.trackingNumber || "";
      });
      setTrackingInputs(trackingMap);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
      setError(
        err.response?.data?.message || "Failed to load customer orders from backend."
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setActionSuccess("");

      const trackingNumber = trackingInputs[orderId] || "";

      const response = await api.patch(`/orders/${orderId}/status`, {
        orderStatus: newStatus,
        trackingNumber,
      });

      if (response.data?.success) {
        setOrders((prev) =>
          prev.map((ord) =>
            (ord._id || ord.id) === orderId
              ? { ...ord, orderStatus: newStatus, trackingNumber }
              : ord
          )
        );
        setActionSuccess(`Order status updated to "${newStatus}"!`);
        setTimeout(() => setActionSuccess(""), 3500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveTracking = async (orderId) => {
    try {
      setUpdatingId(orderId);
      const trackingNumber = trackingInputs[orderId] || "";

      await api.patch(`/orders/${orderId}/status`, {
        trackingNumber,
      });

      setOrders((prev) =>
        prev.map((ord) =>
          (ord._id || ord.id) === orderId ? { ...ord, trackingNumber } : ord
        )
      );
      setActionSuccess(`Tracking number saved for order!`);
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save tracking number.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId, orderNum) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete order ${orderNum}?`
    );
    if (!confirmed) return;

    try {
      setUpdatingId(orderId);
      await api.delete(`/orders/${orderId}`);

      setOrders((prev) =>
        prev.filter((ord) => (ord._id || ord.id) !== orderId)
      );
      setActionSuccess(`Order ${orderNum} deleted.`);
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete order.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Status counters
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.orderStatus === "pending").length;
  const confirmedCount = orders.filter(
    (o) => o.orderStatus === "confirmed" || o.orderStatus === "processing"
  ).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;

  return (
    <div className="orders-admin-page">
      {/* Header */}
      <div className="orders-page-header">
        <div>
          <span className="orders-eyebrow">ORDER MANAGEMENT</span>
          <h1>Customer Orders & Fulfillment</h1>
          <p>
            Review customer orders, update delivery progress, track shipments, and chat with customers on WhatsApp.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={fetchOrders}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="orders-stats-row">
        <div className="orders-stat-mini">
          <span className="stat-label">Total Shown</span>
          <strong className="stat-value">{totalCount}</strong>
        </div>
        <div className="orders-stat-mini pending">
          <span className="stat-label">Pending Action</span>
          <strong className="stat-value">{pendingCount}</strong>
        </div>
        <div className="orders-stat-mini processing">
          <span className="stat-label">Confirmed / Processing</span>
          <strong className="stat-value">{confirmedCount}</strong>
        </div>
        <div className="orders-stat-mini delivered">
          <span className="stat-label">Delivered</span>
          <strong className="stat-value">{deliveredCount}</strong>
        </div>
      </div>

      {/* Feedback Messages */}
      {actionSuccess && (
        <div className="orders-feedback success">
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="orders-feedback error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="orders-filter-bar">
        <div className="orders-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, Phone, or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="status-pills-row">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`filter-pill ${
                statusFilter === opt.value ? "active" : ""
              }`}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="orders-loading">
          <RefreshCw size={32} className="spin" />
          <span>Loading customer orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty-state">
          <Truck size={48} />
          <h3>No Orders Found</h3>
          <p>
            {searchQuery || statusFilter !== "all"
              ? "No orders match your filter criteria. Try clearing search or status filters."
              : "When customers place orders via Cash on Delivery or WhatsApp, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="orders-cards-list">
          {orders.map((ord) => {
            const id = ord._id || ord.id;
            const customer = ord.customer || {};
            const cleanPhone = (customer.whatsapp || customer.phone || "").replace(
              /[^0-9]/g,
              ""
            );
            const whatsappMsg = encodeURIComponent(
              `Hello ${customer.name || "Customer"}, this is EcoStore regarding your order #${ord.orderNumber}. We are pleased to confirm that your order of ${formatPrice(ord.totalAmount)} is being processed!`
            );

            return (
              <div
                key={id}
                className={`order-admin-card status-${ord.orderStatus || "pending"}`}
              >
                {/* Card Top: Order Number, Date, Status */}
                <div className="order-card-header">
                  <div className="order-header-left">
                    <span className="order-badge-id">{ord.orderNumber}</span>
                    <span className="order-created-date">
                      <Clock size={13} /> {formatDate(ord.createdAt)}
                    </span>
                  </div>

                  <div className="order-header-right">
                    <span className={`order-status-badge ${ord.orderStatus}`}>
                      {ord.orderStatus || "pending"}
                    </span>
                    <span className="order-payment-method">
                      {ord.paymentMethod === "whatsapp"
                        ? "💬 WhatsApp Order"
                        : "💵 Cash on Delivery (COD)"}
                    </span>
                  </div>
                </div>

                <div className="order-card-content">
                  {/* Customer Information */}
                  <div className="order-customer-box">
                    <h4>Customer & Shipping Address</h4>
                    <p className="cust-primary-name">
                      <strong>{customer.name || "Customer"}</strong>
                    </p>
                    <p className="cust-contact">
                      <Phone size={13} /> {customer.phone || "No phone"}
                    </p>
                    <p className="cust-address">
                      <MapPin size={13} /> {customer.address || "No street address"},{" "}
                      {customer.city || "City"}
                    </p>

                    {customer.notes && (
                      <div className="cust-notes-box">
                        <strong>Customer Message:</strong>
                        <p>{customer.notes}</p>
                      </div>
                    )}

                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${whatsappMsg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="cust-whatsapp-btn"
                      >
                        <MessageCircle size={15} />
                        Chat on WhatsApp
                      </a>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="order-items-box">
                    <h4>Items Ordered ({ord.items?.length || 0})</h4>
                    <div className="items-sublist">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="item-row">
                          {item.image ? (
                            <img
                              src={
                                item.image.startsWith("http")
                                  ? item.image
                                  : `http://localhost:5000${item.image}`
                              }
                              alt={item.title}
                              className="item-thumb"
                            />
                          ) : (
                            <div className="item-thumb-placeholder">
                              <ShoppingBag size={18} />
                            </div>
                          )}
                          <div className="item-info">
                            <span className="item-title">{item.title}</span>
                            {item.selectedVariant &&
                              Object.keys(item.selectedVariant).length > 0 && (
                                <span className="item-variant">
                                  {Object.entries(item.selectedVariant)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(" | ")}
                                </span>
                              )}
                            <span className="item-qty-price">
                              {item.quantity} &times; {formatPrice(item.price)}
                            </span>
                          </div>
                          <div className="item-total">
                            {formatPrice(
                              item.total || item.price * (item.quantity || 1)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Financial Summary */}
                    <div className="order-totals-summary">
                      <div className="totals-row">
                        <span>Subtotal:</span>
                        <span>{formatPrice(ord.subtotal)}</span>
                      </div>
                      {ord.shippingFee > 0 && (
                        <div className="totals-row">
                          <span>Delivery Fee:</span>
                          <span>{formatPrice(ord.shippingFee)}</span>
                        </div>
                      )}
                      {ord.discount > 0 && (
                        <div className="totals-row discount">
                          <span>Discount:</span>
                          <span>-{formatPrice(ord.discount)}</span>
                        </div>
                      )}
                      <div className="totals-row grand-total">
                        <strong>Grand Total:</strong>
                        <strong className="grand-amount">
                          {formatPrice(ord.totalAmount)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Status Transition & Tracking Controls */}
                <div className="order-card-footer">
                  {/* Status Dropdown */}
                  <div className="footer-status-control">
                    <label>Update Status:</label>
                    <div className="select-wrapper">
                      <select
                        value={ord.orderStatus || "pending"}
                        onChange={(e) => handleStatusChange(id, e.target.value)}
                        disabled={updatingId === id}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <ChevronDown size={14} className="select-arrow" />
                    </div>
                  </div>

                  {/* Tracking Number Input */}
                  <div className="footer-tracking-control">
                    <label>Tracking Code:</label>
                    <div className="tracking-input-group">
                      <input
                        type="text"
                        placeholder="e.g. TCS-98214"
                        value={trackingInputs[id] || ""}
                        onChange={(e) =>
                          setTrackingInputs({
                            ...trackingInputs,
                            [id]: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveTracking(id)}
                        disabled={updatingId === id}
                        className="save-tracking-btn"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="footer-delete-action">
                    <button
                      type="button"
                      className="order-delete-btn"
                      onClick={() => handleDeleteOrder(id, ord.orderNumber)}
                      disabled={updatingId === id}
                      title="Delete Order"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
