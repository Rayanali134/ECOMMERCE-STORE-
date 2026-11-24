import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../admin/css/Dashboard.css";
import {
  ShoppingBag,
  Truck,
  Mail,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Package,
} from "lucide-react";
import api from "../../services/api";

const defaultStats = {
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalRevenue: 0,
  totalInquiries: 0,
  unreadInquiries: 0,
  totalCustomers: 0,
  lowStockProducts: 0,
};

function formatPrice(val) {
  return "Rs. " + Number(val || 0).toLocaleString();
}

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Dashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/stats");
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to load dashboard metrics");
      }

      setStats({
        ...defaultStats,
        ...data.stats,
      });

      setRecentOrders(data.recentOrders || []);
      setRecentProducts(data.recentProducts || []);
      setRecentInquiries(data.recentInquiries || []);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not connect to the backend dashboard API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "delivered":
        return <span className="status-pill status-delivered">Delivered</span>;
      case "shipped":
        return <span className="status-pill status-shipped">Shipped</span>;
      case "processing":
      case "confirmed":
        return <span className="status-pill status-confirmed">{status}</span>;
      case "cancelled":
        return <span className="status-pill status-cancelled">Cancelled</span>;
      default:
        return <span className="status-pill status-pending">Pending</span>;
    }
  };

  return (
    <div className="store-dashboard">
      {/* Top Header & Actions */}
      <div className="dashboard-hero-bar">
        <div>
          <span className="store-badge-live">LIVE STORE DASHBOARD</span>
          <h1 className="dashboard-title">Overview & Performance</h1>
          <p className="dashboard-subtitle">
            Manage your store orders, live inventory, inquiries, and customer requests.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={fetchDashboard}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Refresh
          </button>

          <Link to="/admin/products/create" className="admin-btn-primary">
            <Plus size={16} />
            Add Product
          </Link>

          <Link to="/admin/orders" className="admin-btn-accent">
            <Truck size={16} />
            View Orders
          </Link>
        </div>
      </div>

      {error && (
        <div className="dashboard-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button type="button" onClick={fetchDashboard} className="banner-retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Primary 4 Metric Cards */}
      <div className="metrics-grid">
        {/* Revenue */}
        <div className="metric-card metric-revenue">
          <div className="metric-header">
            <span className="metric-title">Total Revenue</span>
            <div className="metric-icon">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">{formatPrice(stats.totalRevenue)}</div>
          <div className="metric-subtext">
            <TrendingUp size={14} />
            <span>Delivered & Active Orders</span>
          </div>
        </div>

        {/* Orders */}
        <div className="metric-card metric-orders">
          <div className="metric-header">
            <span className="metric-title">Total Orders</span>
            <div className="metric-icon">
              <Truck size={20} />
            </div>
          </div>
          <div className="metric-value">{stats.totalOrders}</div>
          <div className="metric-subtext">
            {stats.pendingOrders > 0 ? (
              <span className="badge-warning">
                <Clock size={12} /> {stats.pendingOrders} Pending Action
              </span>
            ) : (
              <span className="badge-success">
                <CheckCircle size={12} /> All caught up!
              </span>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="metric-card metric-products">
          <div className="metric-header">
            <span className="metric-title">Store Products</span>
            <div className="metric-icon">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="metric-value">{stats.totalProducts}</div>
          <div className="metric-subtext">
            {stats.lowStockProducts > 0 ? (
              <span className="badge-danger">
                <AlertCircle size={12} /> {stats.lowStockProducts} Low Stock (&le; 5)
              </span>
            ) : (
              <span className="badge-neutral">
                <Package size={12} /> Stock levels healthy
              </span>
            )}
          </div>
        </div>

        {/* Inquiries */}
        <div className="metric-card metric-inquiries">
          <div className="metric-header">
            <span className="metric-title">Customer Inquiries</span>
            <div className="metric-icon">
              <Mail size={20} />
            </div>
          </div>
          <div className="metric-value">{stats.totalInquiries}</div>
          <div className="metric-subtext">
            {stats.unreadInquiries > 0 ? (
              <span className="badge-info">
                {stats.unreadInquiries} New customer requests
              </span>
            ) : (
              <span className="badge-neutral">All inquiries replied</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Split */}
      <div className="dashboard-sections-split">
        {/* Left Column: Recent Orders */}
        <div className="dashboard-panel panel-orders">
          <div className="panel-header">
            <div>
              <h2>Recent Customer Orders</h2>
              <span className="panel-caption">Latest orders placed on your store</span>
            </div>
            <Link to="/admin/orders" className="panel-link">
              View All Orders <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            {recentOrders.length === 0 ? (
              <div className="panel-empty-state">
                <Truck size={36} />
                <p>No customer orders yet.</p>
                <span>Orders placed via Cash on Delivery or WhatsApp will show up here.</span>
              </div>
            ) : (
              <table className="store-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord._id || ord.id || ord.orderNumber}>
                      <td>
                        <strong className="order-number-text">{ord.orderNumber}</strong>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="cust-name">{ord.customer?.name || "Customer"}</span>
                          <span className="cust-city">{ord.customer?.city || "N/A"}</span>
                        </div>
                      </td>
                      <td>{ord.items?.length || 1} item(s)</td>
                      <td>
                        <span className="price-bold">{formatPrice(ord.totalAmount)}</span>
                      </td>
                      <td>{getStatusBadge(ord.orderStatus)}</td>
                      <td className="date-cell">{formatDate(ord.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Customer Inquiries & Low Stock Alerts */}
        <div className="dashboard-sidebar-column">
          {/* Customer Product Requests */}
          <div className="dashboard-panel panel-inquiries">
            <div className="panel-header">
              <div>
                <h2>Customer Requests</h2>
                <span className="panel-caption">Direct messages & custom requests</span>
              </div>
              <Link to="/admin/inquiries" className="panel-link">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="inquiries-list">
              {recentInquiries.length === 0 ? (
                <div className="panel-empty-state small">
                  <Mail size={28} />
                  <p>No new customer requests.</p>
                </div>
              ) : (
                recentInquiries.map((inq) => (
                  <div key={inq._id || inq.id} className="inquiry-item-card">
                    <div className="inquiry-item-top">
                      <strong>{inq.name}</strong>
                      <span className={`inquiry-status-pill ${inq.status || "new"}`}>
                        {inq.status || "new"}
                      </span>
                    </div>
                    {inq.productTitle && (
                      <div className="inquiry-product-tag">
                        Product: {inq.productTitle}
                      </div>
                    )}
                    <p className="inquiry-message-preview">
                      {inq.message?.slice(0, 80) || "No message content."}
                      {inq.message?.length > 80 ? "..." : ""}
                    </p>
                    <div className="inquiry-item-footer">
                      <span className="inquiry-date">{formatDate(inq.createdAt)}</span>
                      {inq.phone && (
                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="whatsapp-quick-chat"
                        >
                          WhatsApp Reply
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Store Links */}
          <div className="dashboard-panel panel-quick-links">
            <h2>Store Management Shortcuts</h2>
            <div className="shortcuts-list">
              <Link to="/admin/products" className="shortcut-btn">
                <ShoppingBag size={16} />
                <span>Manage Products Catalog</span>
              </Link>
              <Link to="/admin/orders" className="shortcut-btn">
                <Truck size={16} />
                <span>Orders & Fulfillment</span>
              </Link>
              <Link to="/admin/settings" className="shortcut-btn">
                <Package size={16} />
                <span>7-Day Return Policy & Shipping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
