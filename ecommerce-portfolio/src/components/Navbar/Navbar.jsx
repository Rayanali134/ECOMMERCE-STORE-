import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Menu,
  X,
  MessageCircle,
  Truck,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 35, seconds: 20 });
  const location = useLocation();
  const { cartCount, openCart } = useCart();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  const links = [
    ["Home", "/"],
    ["Shop All", "/products"],
    ["Return Policy", "/return-policy"],
    ["Track Order", "/track-order"],
    ["Contact Us", "/contact"],
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-wrapper">
      {/* Top Announcement Bar - Clean single-line on Mobile */}
      <div className="navbar-top-bar">
        <div className="container navbar-top-inner">
          <div className="top-bar-item">
            <Zap size={13} style={{ color: "#fbbf24", flexShrink: 0 }} />
            <span className="deal-desktop">
              ⚡ FLASH DEAL: <strong>{pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s</strong> • FREE SHIPPING OVER RS. 2,500
            </span>
            <span className="deal-mobile">
              ⚡ FREE DELIVERY OVER RS. 2,500 • CASH ON DELIVERY
            </span>
          </div>

          <div className="top-bar-item hide-mobile">
            <ShieldCheck size={14} />
            <span>7-Day Return Guarantee &amp; Cash on Delivery (COD)</span>
          </div>

          <a
            href="https://wa.me/923213633473?text=Assalam-o-Alaikum%20EcoStore!%20I%20have%20an%20inquiry%20about%20your%20products."
            target="_blank"
            rel="noreferrer"
            className="top-bar-whatsapp hide-mobile"
          >
            <MessageCircle size={14} />
            <span>WhatsApp: +92 321 3633473</span>
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="brand" onClick={closeMenu}>
            <span className="brand-mark">
              <ShoppingBag size={18} />
            </span>
            <span className="brand-text">EcoStore</span>
          </Link>

          {/* Desktop navigation */}
          <div className="nav-links">
            {links.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  isActive || (path === "/" && location.pathname === "/")
                    ? "active"
                    : ""
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Action Icons: Cart & Mobile Menu */}
          <div className="navbar-actions">
            {/* Cart Trigger Button */}
            <button
              type="button"
              className="navbar-cart-btn"
              onClick={openCart}
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag size={20} />
              <span className="cart-badge">{cartCount}</span>
            </button>

            {/* Mobile hamburger button */}
            <button
              type="button"
              className="mobile-nav-toggle"
              aria-label="Toggle Navigation Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <div className="container mobile-menu-links">
              {links.map(([label, path]) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive || (path === "/" && location.pathname === "/")
                      ? "mobile-link active"
                      : "mobile-link"
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="mobile-drawer-cta">
                <button
                  type="button"
                  className="btn btn-primary mobile-cart-btn"
                  onClick={() => {
                    closeMenu();
                    openCart();
                  }}
                >
                  <ShoppingBag size={17} />
                  <span>View Cart ({cartCount} items)</span>
                </button>

                <a
                  href="https://wa.me/923213633473?text=Assalam-o-Alaikum%20EcoStore!%20I%20have%20an%20inquiry."
                  target="_blank"
                  rel="noreferrer"
                  className="mobile-wa-btn"
                >
                  <MessageCircle size={17} />
                  <span>WhatsApp: 0321-3633473</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
