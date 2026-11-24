import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  Mail,
  ShieldCheck,
  Truck,
  MessageCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

function Footer() {
  return (
    <footer className="footer-v2">
      <div className="container footer-v2-grid">
        {/* Col 1: Brand Info */}
        <div className="footer-col brand-col">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <ShoppingBag size={18} />
            </span>
            <span className="brand-text">EcoStore</span>
          </Link>

          <p className="footer-desc">
            Pakistan's trusted destination for studio audio, precision timepieces, and performance athletic wear.
            Protected by our 7-day doorstep return policy.
          </p>

          <div className="footer-status-pill">
            <span className="status-dot-active" />
            <span>Accepting Orders • 2-4 Days Dispatch</span>
          </div>
        </div>

        {/* Col 2 & 3: Mobile friendly side-by-side link columns */}
        <div className="footer-links-duo">
          {/* Sub-Col A: Store Links */}
          <div className="footer-col">
            <h4>SHOP COLLECTION</h4>
            <ul className="footer-links-list">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=Electronics">Audio & Tech</Link></li>
              <li><Link to="/products?category=Watches">Luxury Watches</Link></li>
              <li><Link to="/products?category=Footwear">Athletic Shoes</Link></li>
              <li><Link to="/checkout">Fast COD Checkout</Link></li>
            </ul>
          </div>

          {/* Sub-Col B: Customer Care */}
          <div className="footer-col">
            <h4>CUSTOMER CARE</h4>
            <ul className="footer-links-list">
              <li><Link to="/return-policy">7-Day Return Policy</Link></li>
              <li><Link to="/track-order">Track Your Parcel</Link></li>
              <li><Link to="/return-policy#faqs">Delivery FAQs</Link></li>
              <li><Link to="/contact">Customer Support</Link></li>
              <li><Link to="/admin/login">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Col 4: Direct Order & WhatsApp */}
        <div className="footer-col contact-col">
          <h4>DIRECT HOTLINE</h4>
          <p className="footer-cta-text">
            Need custom sizing, bulk order rates, or tracking help? Talk directly with our store desk:
          </p>
          <a
            href="https://wa.me/923213633473?text=Assalam-o-Alaikum%20EcoStore!%20I%20have%20an%20order%20inquiry."
            target="_blank"
            rel="noreferrer"
            className="footer-whatsapp-btn"
          >
            <MessageCircle size={16} />
            <span>WhatsApp: 0321-3633473</span>
          </a>
          <div className="footer-meta-item">
            <Mail size={15} />
            <span>rayanali0560@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Trust Badges Strip (COD, 7-Day Returns, Couriers) */}
      <div className="container footer-trust-strip">
        <div className="footer-trust-badge">
          <Truck size={15} />
          <span>Cash on Delivery (COD)</span>
        </div>
        <div className="footer-trust-badge">
          <RotateCcw size={15} />
          <span>7-Day Return Guarantee</span>
        </div>
        <div className="footer-trust-badge">
          <ShieldCheck size={15} />
          <span>100% Original Products</span>
        </div>
        <div className="footer-trust-badge">
          <CheckCircle2 size={15} />
          <span>TCS &amp; Leopards Express</span>
        </div>
      </div>

      {/* Bottom Copyright & Legal */}
      <div className="container footer-v2-bottom">
        <p>© {new Date().getFullYear()} EcoStore Pakistan. All rights reserved.</p>
        <div className="footer-legal-links">
          <Link to="/return-policy">Return Policy</Link>
          <span>•</span>
          <Link to="/track-order">Order Tracking</Link>
          <span>•</span>
          <Link to="/contact">Help Desk</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
