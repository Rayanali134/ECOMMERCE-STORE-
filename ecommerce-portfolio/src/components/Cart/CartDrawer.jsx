import { Link } from "react-router-dom";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CartDrawer() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 2500;
  const progressPercent = Math.min(
    100,
    Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  // WhatsApp order text builder
  const whatsappNumber = "923213633473";
  const itemsText = cartItems
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.title} (Qty: ${item.quantity}) - Rs. ${item.price * item.quantity}`
    )
    .join("%0A");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello! I would like to place an order:%0A%0A${itemsText}%0A%0ATotal: Rs. ${cartSubtotal}%0A%0APlease confirm my order!`;

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <aside
        className="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping Cart"
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <ShoppingBag size={20} />
            <h2>Your Shopping Cart</h2>
            <span className="cart-drawer-badge">{cartCount}</span>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={closeCart}
            aria-label="Close Cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="cart-shipping-bar">
          <div className="shipping-text">
            {remainingForFree === 0 ? (
              <span className="shipping-unlocked">
                🎉 Congratulations! You unlocked <strong>FREE Shipping!</strong>
              </span>
            ) : (
              <span>
                Add <strong>Rs. {remainingForFree.toLocaleString()}</strong> more
                for <strong>FREE Shipping!</strong>
              </span>
            )}
          </div>
          <div className="shipping-track">
            <div
              className="shipping-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="cart-drawer-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} className="empty-bag-icon" />
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link
                to="/products"
                className="btn btn-primary"
                onClick={closeCart}
              >
                Start Shopping
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.key} className="cart-drawer-item">
                <img
                  src={item.image}
                  alt={item.title}
                  className="cart-item-img"
                  loading="lazy"
                />
                <div className="cart-item-info">
                  <div className="cart-item-top">
                    <h4>{item.title}</h4>
                    <button
                      type="button"
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.key)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Selected Variants */}
                  {item.selectedVariant &&
                    Object.keys(item.selectedVariant).length > 0 && (
                      <div className="cart-item-variant">
                        {Object.entries(item.selectedVariant).map(([k, v]) => (
                          <span key={k}>
                            {k}: <strong>{v}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                  <div className="cart-item-bottom">
                    <span className="cart-item-price">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>

                    <div className="cart-qty-controls">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span>Subtotal:</span>
              <strong>Rs. {cartSubtotal.toLocaleString()}</strong>
            </div>

            <div className="cart-subtotal-note">
              <span>Delivery charges calculated at checkout.</span>
            </div>

            <div className="cart-action-buttons">
              <Link
                to="/checkout"
                className="btn btn-primary btn-checkout"
                onClick={closeCart}
              >
                Proceed to Checkout (COD)
                <ArrowRight size={16} />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={18} />
                Order via WhatsApp
              </a>
            </div>

            <div className="cart-security-badge">
              <ShieldCheck size={16} />
              <span>7-Day Return Guarantee • Cash on Delivery</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
