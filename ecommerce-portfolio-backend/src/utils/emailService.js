const nodemailer = require("nodemailer");

/**
 * Configure Nodemailer Transport
 * Supports Gmail, Custom SMTP, or simulated console logger fallback
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").trim().replace(/\s+/g, "");

  if (user && pass) {
    // If using Gmail (e.g. user@gmail.com or smtp.gmail.com)
    if (host.includes("gmail") || user.includes("@gmail.com")) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass, // 16-character Google App Password
        },
      });
    }

    // Custom SMTP server
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Fallback: Simulated logger so the app never crashes if SMTP credentials are missing
  return {
    isSimulated: true,
    sendMail: async (mailOptions) => {
      console.log("--------------------------------------------------");
      console.log("📧 [EMAIL SERVICE NOTIFICATION - SIMULATED / CONSOLE LOG]");
      console.log(`⚠️ Real email NOT sent because SMTP_USER or SMTP_PASS is missing in .env!`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log("--------------------------------------------------");
      return { messageId: "simulated-" + Date.now() };
    },
  };
}

/**
 * Generate Modern Luxury HTML Receipt for Customer & Store Admin
 */
function generateOrderHtml(order) {
  const storeName = "EcoStore";
  const hotline = "+92 321 3633473";
  const hotlineDigits = "923213633473";
  const adminEmail = process.env.ADMIN_EMAIL || "rayanali0560@gmail.com";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const trackingUrl = `${frontendUrl}/track-order?ord=${encodeURIComponent(
    order.orderNumber
  )}`;
  const whatsappUrl = `https://wa.me/${hotlineDigits}?text=${encodeURIComponent(
    `Assalam-o-Alaikum EcoStore! I want to confirm my order #${order.orderNumber}.`
  )}`;

  const itemsRows = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #1e2638;">
        <td style="padding: 14px 12px; color: #f8fafc; font-weight: 600; font-size: 14px;">
          <div style="font-size: 14px; font-weight: 700; color: #ffffff;">${item.title}</div>
          <div style="margin-top: 4px;">
            ${
              item.selectedVariant?.size
                ? `<span style="display: inline-block; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); color: #a5b4fc; padding: 2px 7px; border-radius: 5px; font-size: 11px; font-weight: 600; margin-right: 4px;">Size: ${item.selectedVariant.size}</span>`
                : ""
            }
            ${
              item.selectedVariant?.color
                ? `<span style="display: inline-block; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #cbd5e1; padding: 2px 7px; border-radius: 5px; font-size: 11px; font-weight: 600;">Color: ${item.selectedVariant.color}</span>`
                : ""
            }
          </div>
        </td>
        <td style="padding: 14px 12px; text-align: center; color: #cbd5e1; font-size: 14px; font-weight: 600;">
          <span style="display: inline-block; background: #161f30; padding: 3px 8px; border-radius: 6px; border: 1px solid #23314a;">${item.quantity}x</span>
        </td>
        <td style="padding: 14px 12px; text-align: right; color: #94a3b8; font-size: 13px;">
          Rs. ${Number(item.price || 0).toLocaleString()}
        </td>
        <td style="padding: 14px 12px; text-align: right; color: #34d399; font-weight: 800; font-size: 15px;">
          Rs. ${Number(item.total || item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed - ${order.orderNumber} - ${storeName}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #06080f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; }
      .container { max-width: 620px; margin: 24px auto; background-color: #0c101c; border: 1px solid #1e2638; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.85); }
      .brand-header { background: linear-gradient(135deg, #090e1a 0%, #171a2e 50%, #0d1e2e 100%); padding: 36px 24px 28px; text-align: center; border-bottom: 1px solid #26334d; position: relative; }
      .logo { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; display: inline-block; }
      .logo span { color: #6366f1; }
      .tagline { margin: 6px 0 0 0; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
      .status-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; margin-top: 14px; }
      .content { padding: 32px 24px; }
      .hero-greeting { margin-bottom: 24px; text-align: center; }
      .hero-greeting h2 { margin: 0 0 8px; color: #ffffff; font-size: 22px; font-weight: 800; }
      .hero-greeting p { margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6; }
      .timeline-box { background: #070a12; border: 1px solid #1c2436; border-radius: 14px; padding: 18px 12px; margin-bottom: 26px; }
      .timeline-grid { display: table; width: 100%; text-align: center; }
      .timeline-step { display: table-cell; width: 25%; font-size: 11px; font-weight: 700; color: #64748b; }
      .timeline-step.active { color: #34d399; }
      .timeline-step .dot { width: 22px; height: 22px; line-height: 22px; border-radius: 50%; margin: 0 auto 6px; font-size: 11px; }
      .timeline-step.active .dot { background: #10b981; color: #ffffff; }
      .timeline-step.inactive .dot { background: #1a2233; color: #64748b; border: 1px solid #28354d; }
      .tracking-card { background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%); border: 1px dashed #6366f1; border-radius: 14px; padding: 16px 20px; margin-bottom: 26px; text-align: center; }
      .tracking-card span { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #a5b4fc; font-weight: 800; display: block; }
      .tracking-card strong { font-size: 22px; color: #ffffff; letter-spacing: 1.5px; display: block; margin-top: 4px; font-family: monospace; }
      .section-heading { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1; margin: 0 0 12px; }
      .items-table { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
      .items-table th { background: #131a29; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 12px; }
      .pricing-box { background: #070a12; border: 1px solid #1c2436; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; }
      .pricing-row { display: table; width: 100%; margin-bottom: 8px; font-size: 14px; }
      .pricing-label { display: table-cell; color: #94a3b8; }
      .pricing-val { display: table-cell; text-align: right; color: #e2e8f0; font-weight: 600; }
      .pricing-total { border-top: 1px solid #23314a; padding-top: 12px; margin-top: 8px; }
      .cod-notice { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #fde68a; }
      .address-card { background: #070a12; border: 1px solid #1c2436; border-radius: 14px; padding: 18px 20px; margin-bottom: 26px; font-size: 13px; line-height: 1.6; }
      .btn-row { text-align: center; margin: 28px 0 16px; }
      .btn-primary { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-weight: 750; font-size: 14px; margin: 4px; box-shadow: 0 6px 18px rgba(79, 70, 229, 0.45); }
      .btn-whatsapp { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 13px 24px; border-radius: 12px; font-weight: 750; font-size: 14px; margin: 4px; box-shadow: 0 6px 18px rgba(5, 150, 105, 0.35); }
      .trust-box { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 16px 20px; font-size: 12.5px; color: #cbd5e1; text-align: center; margin-bottom: 20px; line-height: 1.6; }
      .footer { background: #06080f; padding: 24px 20px; text-align: center; border-top: 1px solid #1e2638; font-size: 12px; color: #64748b; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Brand Header -->
      <div class="brand-header">
        <div class="logo">${storeName}<span>.pk</span></div>
        <div class="tagline">Curated Luxury Living • Official Flagship Store</div>
        <div class="status-pill">
          <span>●</span>
          <span>ORDER CONFIRMED &amp; DISPATCH READY</span>
        </div>
      </div>

      <div class="content">
        <!-- Hero Greeting -->
        <div class="hero-greeting">
          <h2>Assalam-o-Alaikum, ${order.customer?.name || "Customer"}!</h2>
          <p>
            Thank you for shopping with <strong>${storeName}</strong>. Your order has been officially confirmed and our fulfillment team has started preparing your parcel.
          </p>
        </div>

        <!-- 4-Step Order Progression Tracker -->
        <div class="timeline-box">
          <div class="timeline-grid">
            <div class="timeline-step active">
              <div class="dot">✓</div>
              <span>Received</span>
            </div>
            <div class="timeline-step active">
              <div class="dot">2</div>
              <span>Confirmed</span>
            </div>
            <div class="timeline-step inactive">
              <div class="dot">3</div>
              <span>Dispatched</span>
            </div>
            <div class="timeline-step inactive">
              <div class="dot">4</div>
              <span>Delivered</span>
            </div>
          </div>
        </div>

        <!-- Tracking Reference -->
        <div class="tracking-card">
          <span>Official Order Tracking ID</span>
          <strong>${order.orderNumber}</strong>
        </div>

        <!-- Order Items Summary -->
        <div class="section-heading">✦ Order Items Summary (${(order.items || []).length} Item${(order.items || []).length > 1 ? "s" : ""})</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="text-align: left;">Product Details</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Pricing Breakdown -->
        <div class="pricing-box">
          <div class="pricing-row">
            <span class="pricing-label">Item(s) Subtotal:</span>
            <span class="pricing-val">Rs. ${Number(order.subtotal || 0).toLocaleString()}</span>
          </div>
          <div class="pricing-row">
            <span class="pricing-label">Nationwide Courier Shipping:</span>
            <span class="pricing-val" style="color: ${order.shippingFee === 0 ? "#34d399" : "#e2e8f0"};">
              ${order.shippingFee === 0 ? "FREE (Orders over Rs. 2,500)" : "Rs. " + Number(order.shippingFee).toLocaleString()}
            </span>
          </div>
          ${
            order.discount > 0
              ? `<div class="pricing-row">
                  <span class="pricing-label" style="color: #f87171;">Special Discount Applied:</span>
                  <span class="pricing-val" style="color: #f87171;">- Rs. ${Number(order.discount).toLocaleString()}</span>
                </div>`
              : ""
          }
          <div class="pricing-row pricing-total">
            <span style="display: table-cell; font-size: 16px; font-weight: 800; color: #ffffff;">Total Payable (COD):</span>
            <span style="display: table-cell; text-align: right; font-size: 20px; font-weight: 900; color: #34d399;">
              Rs. ${Number(order.totalAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <!-- Cash on Delivery Notice -->
        <div class="cod-notice">
          <strong>💵 Cash on Delivery (COD) Reminder:</strong><br/>
          Please keep exact change of <strong>Rs. ${Number(order.totalAmount || 0).toLocaleString()}</strong> ready when the courier rider arrives at your doorstep. Zero advance payment required!
        </div>

        <!-- Customer & Destination Details -->
        <div class="section-heading">✦ Delivery Destination &amp; Recipient</div>
        <div class="address-card">
          <p style="margin: 0 0 6px;"><strong>Recipient Name:</strong> ${order.customer?.name}</p>
          <p style="margin: 0 0 6px;"><strong>Contact Phone (For rider call):</strong> ${order.customer?.phone}</p>
          ${order.customer?.whatsapp ? `<p style="margin: 0 0 6px;"><strong>WhatsApp:</strong> ${order.customer.whatsapp}</p>` : ""}
          <p style="margin: 0 0 6px;"><strong>Full Shipping Address:</strong> ${order.customer?.address}, ${order.customer?.city}</p>
          ${order.customer?.notes ? `<p style="margin: 6px 0 0; color: #f59e0b;"><strong>Rider Instructions:</strong> "${order.customer.notes}"</p>` : ""}
        </div>

        <!-- Action CTAs -->
        <div class="btn-row">
          <a href="${trackingUrl}" class="btn-primary" target="_blank">Track Order Live Status</a>
          <a href="${whatsappUrl}" class="btn-whatsapp" target="_blank">WhatsApp Hotline (${hotline})</a>
        </div>

        <!-- Buyer Protection Seal -->
        <div class="trust-box">
          🛡️ <strong>EcoStore 7-Day Doorstep Guarantee:</strong> Every parcel undergoes double inspection before sealing. If you encounter any sizing, color, or manufacturing defect within 7 days, we guarantee an instant replacement or 100% money back via JazzCash, EasyPaisa, or Bank Transfer.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px;">EcoStore Pakistan — Curated Luxury Goods &amp; Dedicated Concierge Support</p>
        <p style="margin: 0;">Hotline: <strong>${hotline}</strong> • Support Email: <strong>${adminEmail}</strong></p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Generate High-Conversion Luxury Status Email (Delivered, Shipped, Confirmed, Processing, Cancelled)
 */
function generateStatusHtml(order, currentStatus) {
  const storeName = "EcoStore";
  const hotline = "+92 321 3633473";
  const hotlineDigits = "923213633473";
  const adminEmail = process.env.ADMIN_EMAIL || "rayanali0560@gmail.com";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const trackingUrl = `${frontendUrl}/track-order?ord=${encodeURIComponent(
    order.orderNumber
  )}`;
  const whatsappUrl = `https://wa.me/${hotlineDigits}?text=${encodeURIComponent(
    `Assalam-o-Alaikum EcoStore! I am inquiring about my order #${order.orderNumber} (Status: ${currentStatus}).`
  )}`;

  const statusConfigs = {
    delivered: {
      badge: "● PARCEL DELIVERED TO DOORSTEP",
      badgeColor: "#10b981",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      headline: "Your Order Has Arrived!",
      emoji: "🎉 📦 ✨",
      note: "Your parcel has been successfully delivered by the courier rider to your doorstep! Your 7-day doorstep inspection guarantee is active now.",
      stepIndex: 4,
    },
    shipped: {
      badge: "● DISPATCHED VIA COURIER",
      badgeColor: "#38bdf8",
      badgeBg: "rgba(56, 189, 248, 0.15)",
      headline: "Your Parcel is on the Way!",
      emoji: "🚚 📦 💨",
      note: "Your package has passed double Quality Check (QC), is securely sealed, and has been handed over to the courier for express nationwide delivery.",
      stepIndex: 3,
    },
    confirmed: {
      badge: "● ORDER CONFIRMED & QUEUED",
      badgeColor: "#818cf8",
      badgeBg: "rgba(99, 102, 241, 0.15)",
      headline: "Order Confirmed & Approved",
      emoji: "✓ 📋 📦",
      note: "Your order has been verified and sent to our packing station. Tracking updates will be emailed as soon as the courier scans the barcode.",
      stepIndex: 2,
    },
    processing: {
      badge: "● PACKING & QUALITY CHECK",
      badgeColor: "#fbbf24",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      headline: "Preparing Your Order",
      emoji: "⚙️ 📦 🔍",
      note: "Our store team is carefully inspecting every item and wrapping your parcel with extra protective bubble cushion.",
      stepIndex: 2,
    },
    cancelled: {
      badge: "● ORDER CANCELLED",
      badgeColor: "#f87171",
      badgeBg: "rgba(239, 68, 68, 0.15)",
      headline: "Order Cancellation Notice",
      emoji: "🛑 ✉️",
      note: "Your order has been cancelled per request or verification. If you made an advance deposit, full refund is initiated via JazzCash / EasyPaisa / Bank.",
      stepIndex: 1,
    },
  };

  const cfg = statusConfigs[currentStatus] || {
    badge: `● STATUS: ${String(currentStatus).toUpperCase()}`,
    badgeColor: "#818cf8",
    badgeBg: "rgba(99, 102, 241, 0.15)",
    headline: `Order Status: ${String(currentStatus).toUpperCase()}`,
    emoji: "📦 📋",
    note: `The latest milestone update for your order #${order.orderNumber} is now: ${currentStatus}.`,
    stepIndex: 2,
  };

  const itemsList = (order.items || [])
    .map(
      (item) => `
      <div style="background: #070a12; border: 1px solid #1c2436; border-radius: 12px; padding: 12px 16px; margin-bottom: 10px; display: table; width: 100%; box-sizing: border-box;">
        <div style="display: table-cell; vertical-align: middle;">
          <strong style="color: #ffffff; font-size: 14px;">${item.title}</strong>
          ${
            item.selectedVariant?.size || item.selectedVariant?.color
              ? `<br><small style="color: #94a3b8; font-size: 12px;">${item.selectedVariant.size ? "Size: " + item.selectedVariant.size : ""} ${item.selectedVariant.color ? "| Color: " + item.selectedVariant.color : ""}</small>`
              : ""
          }
        </div>
        <div style="display: table-cell; vertical-align: middle; text-align: right; width: 110px;">
          <span style="display: inline-block; background: #161f30; padding: 2px 7px; border-radius: 5px; color: #cbd5e1; font-size: 11px; margin-bottom: 2px;">${item.quantity}x</span>
          <br>
          <strong style="color: #34d399; font-size: 14px;">Rs. ${Number(item.total || item.price * item.quantity).toLocaleString()}</strong>
        </div>
      </div>
    `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cfg.headline} - ${order.orderNumber}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #06080f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; }
      .container { max-width: 620px; margin: 24px auto; background-color: #0c101c; border: 1px solid #1e2638; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.85); }
      .brand-header { background: linear-gradient(135deg, #090e1a 0%, #171a2e 50%, #0d1e2e 100%); padding: 34px 24px 26px; text-align: center; border-bottom: 1px solid #26334d; }
      .logo { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; display: inline-block; }
      .logo span { color: #6366f1; }
      .status-pill { display: inline-flex; align-items: center; gap: 6px; background: ${cfg.badgeBg}; border: 1px solid ${cfg.badgeColor}; color: ${cfg.badgeColor}; padding: 6px 14px; border-radius: 999px; font-size: 11.5px; font-weight: 800; letter-spacing: 0.5px; margin-top: 12px; }
      .content { padding: 30px 24px; }
      .status-hero { background: rgba(255, 255, 255, 0.02); border: 1px solid #1e2638; border-radius: 16px; padding: 24px 20px; margin-bottom: 24px; text-align: center; }
      .status-emoji { font-size: 36px; line-height: 1; margin-bottom: 10px; }
      .status-hero h2 { margin: 0 0 8px; color: #ffffff; font-size: 21px; font-weight: 800; }
      .status-hero p { margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6; max-width: 480px; margin: 0 auto; }
      .timeline-box { background: #070a12; border: 1px solid #1c2436; border-radius: 14px; padding: 18px 12px; margin-bottom: 24px; }
      .timeline-grid { display: table; width: 100%; text-align: center; }
      .timeline-step { display: table-cell; width: 25%; font-size: 11px; font-weight: 700; color: #64748b; }
      .timeline-step.active { color: #34d399; }
      .timeline-step .dot { width: 22px; height: 22px; line-height: 22px; border-radius: 50%; margin: 0 auto 6px; font-size: 11px; }
      .timeline-step.active .dot { background: #10b981; color: #ffffff; }
      .timeline-step.inactive .dot { background: #1a2233; color: #64748b; border: 1px solid #28354d; }
      .courier-box { background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%); border: 1px dashed #38bdf8; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; text-align: center; }
      .courier-box span { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; font-weight: 800; display: block; }
      .courier-box strong { font-size: 20px; color: #ffffff; letter-spacing: 1.5px; display: block; margin-top: 4px; font-family: monospace; }
      .total-card { background: #070a12; border: 1px solid #1c2436; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; display: table; width: 100%; box-sizing: border-box; }
      .btn-row { text-align: center; margin: 26px 0 16px; }
      .btn-primary { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff !important; text-decoration: none; padding: 13px 26px; border-radius: 12px; font-weight: 750; font-size: 14px; margin: 4px; box-shadow: 0 6px 18px rgba(79, 70, 229, 0.45); }
      .btn-whatsapp { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 13px 22px; border-radius: 12px; font-weight: 750; font-size: 14px; margin: 4px; box-shadow: 0 6px 18px rgba(5, 150, 105, 0.35); }
      .trust-box { background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 14px; padding: 16px 20px; font-size: 12.5px; color: #cbd5e1; text-align: center; margin-bottom: 20px; line-height: 1.6; }
      .footer { background: #06080f; padding: 22px 20px; text-align: center; border-top: 1px solid #1e2638; font-size: 12px; color: #64748b; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="brand-header">
        <div class="logo">${storeName}<span>.pk</span></div>
        <br/>
        <div class="status-pill">${cfg.badge}</div>
      </div>

      <div class="content">
        <div class="status-hero">
          <div class="status-emoji">${cfg.emoji}</div>
          <h2>${cfg.headline}</h2>
          <p>${cfg.note}</p>
        </div>

        <!-- Dynamic Timeline -->
        <div class="timeline-box">
          <div class="timeline-grid">
            <div class="timeline-step ${cfg.stepIndex >= 1 ? "active" : "inactive"}">
              <div class="dot">${cfg.stepIndex >= 1 ? "✓" : "1"}</div>
              <span>Received</span>
            </div>
            <div class="timeline-step ${cfg.stepIndex >= 2 ? "active" : "inactive"}">
              <div class="dot">${cfg.stepIndex >= 2 ? "✓" : "2"}</div>
              <span>Confirmed</span>
            </div>
            <div class="timeline-step ${cfg.stepIndex >= 3 ? "active" : "inactive"}">
              <div class="dot">${cfg.stepIndex >= 3 ? "✓" : "3"}</div>
              <span>Dispatched</span>
            </div>
            <div class="timeline-step ${cfg.stepIndex >= 4 ? "active" : "inactive"}">
              <div class="dot">${cfg.stepIndex >= 4 ? "✓" : "4"}</div>
              <span>Delivered</span>
            </div>
          </div>
        </div>

        ${
          order.trackingNumber
            ? `<div class="courier-box">
                <span>Courier Tracking Reference</span>
                <strong>${order.trackingNumber}</strong>
                <p style="margin: 6px 0 0; font-size: 12px; color: #94a3b8;">Use this number on the courier tracking portal to track real-time parcel location.</p>
               </div>`
            : ""
        }

        <div style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1; margin-bottom: 12px;">✦ Order Summary</div>
        ${itemsList}

        <div class="total-card">
          <div style="display: table-cell; color: #94a3b8; font-size: 14px; vertical-align: middle;">
            ${currentStatus === "delivered" ? "Total Paid (Cash on Delivery):" : "Total Payable (Cash on Delivery):"}
          </div>
          <div style="display: table-cell; text-align: right; color: #34d399; font-size: 19px; font-weight: 900; vertical-align: middle;">
            Rs. ${Number(order.totalAmount || 0).toLocaleString()}
          </div>
        </div>

        <div class="btn-row">
          <a href="${trackingUrl}" class="btn-primary" target="_blank">Track Order Live Status</a>
          <a href="${whatsappUrl}" class="btn-whatsapp" target="_blank">WhatsApp Hotline (${hotline})</a>
        </div>

        <div class="trust-box">
          🛡️ <strong>7-Day Doorstep Guarantee:</strong> Sizing not right or item defective? Contact us within 7 days on WhatsApp for a fast doorstep replacement or 100% money back!
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px;">EcoStore Pakistan — Curated Luxury Goods &amp; Dedicated Concierge Support</p>
        <p style="margin: 0;">Hotline: <strong>${hotline}</strong> • Support Email: <strong>${adminEmail}</strong></p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Send Order Placement Notification Email
 * Sends receipt to customer AND alert copy to store admin
 */
async function sendOrderConfirmationEmail(order) {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || "rayanali0560@gmail.com";
    const customerEmail = order.customer?.email;

    const subject = `Order Confirmed #${order.orderNumber} - EcoStore (Rs. ${Number(
      order.totalAmount || 0
    ).toLocaleString()})`;

    const html = generateOrderHtml(order);

    const recipients = [];
    if (customerEmail && customerEmail.includes("@") && !customerEmail.includes("customer@store.com")) {
      recipients.push(customerEmail);
    }
    // Always notify store admin
    if (adminEmail && !recipients.includes(adminEmail)) {
      recipients.push(adminEmail);
    }

    const mailOptions = {
      from: `"EcoStore Official" <${process.env.SMTP_FROM || process.env.SMTP_USER || "orders@ecostore.com"}>`,
      to: recipients.join(", "),
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order Email successfully dispatched for ${order.orderNumber}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send Order Confirmation Email:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Status Update Email (Confirmed / Shipped / Delivered / Cancelled)
 * When status is "delivered", it sends the dedicated luxury Delivered email!
 */
async function sendOrderStatusEmail(order, explicitStatus) {
  try {
    const currentStatus = explicitStatus || order.orderStatus;
    const adminEmail = process.env.ADMIN_EMAIL || "rayanali0560@gmail.com";
    const customerEmail = order.customer?.email;

    const recipients = [];
    if (customerEmail && customerEmail.includes("@") && !customerEmail.includes("customer@store.com")) {
      recipients.push(customerEmail);
    }
    // Always send copy to admin rayanali0560@gmail.com so store owner sees all delivered/shipped updates!
    if (adminEmail && !recipients.includes(adminEmail)) {
      recipients.push(adminEmail);
    }

    if (recipients.length === 0) {
      console.log(`⚠️ No recipient email found for order #${order.orderNumber}`);
      return { success: false, reason: "No recipient email" };
    }

    const transporter = createTransporter();

    const statusSubjects = {
      delivered: `🎉 Order Delivered #${order.orderNumber} - EcoStore (Rs. ${Number(order.totalAmount || 0).toLocaleString()})`,
      shipped: `🚚 Order Dispatched via Courier #${order.orderNumber} - EcoStore`,
      confirmed: `✓ Order Confirmed #${order.orderNumber} - EcoStore`,
      processing: `⚙️ Order Being Packed #${order.orderNumber} - EcoStore`,
      cancelled: `Order Cancelled #${order.orderNumber} - EcoStore`,
    };

    const subject = statusSubjects[currentStatus] || `Order Status: ${String(currentStatus).toUpperCase()} - #${order.orderNumber}`;
    const html = generateStatusHtml(order, currentStatus);

    const info = await transporter.sendMail({
      from: `"EcoStore Dispatch" <${process.env.SMTP_FROM || process.env.SMTP_USER || "orders@ecostore.com"}>`,
      to: recipients.join(", "),
      subject,
      html,
    });

    console.log(`✅ Order status [${currentStatus}] email sent for #${order.orderNumber} to [${recipients.join(", ")}]:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send Order Status Email:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Contact / Inquiry / Support Ticket Email Alert to Store Admin
 */
async function sendInquiryNotificationEmail(inquiry) {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || "rayanali0560@gmail.com";
    const subject = `🔔 [${inquiry.category || "Store Inquiry"}] Ticket #${inquiry.ticketNumber} from ${inquiry.name}`;

    const html = `
      <div style="font-family: sans-serif; background: #07090e; color: #f1f5f9; padding: 24px;">
        <div style="max-width: 580px; margin: 0 auto; background: #0f172a; padding: 24px; border-radius: 14px; border: 1px solid #1e293b;">
          <h2 style="color: #818cf8; margin-top: 0;">New Store Message / Support Ticket</h2>
          <p><strong>Ticket ID:</strong> ${inquiry.ticketNumber}</p>
          <p><strong>Customer Name:</strong> ${inquiry.name}</p>
          <p><strong>Phone:</strong> ${inquiry.phone}</p>
          ${inquiry.whatsapp ? `<p><strong>WhatsApp:</strong> ${inquiry.whatsapp}</p>` : ""}
          ${inquiry.email ? `<p><strong>Email:</strong> ${inquiry.email}</p>` : ""}
          <p><strong>Category:</strong> ${inquiry.category || "General Support"}</p>
          ${inquiry.budget ? `<p><strong>Budget Specified:</strong> ${inquiry.budget}</p>` : ""}
          ${inquiry.orderNumber ? `<p><strong>Associated Order #:</strong> ${inquiry.orderNumber}</p>` : ""}
          <div style="background: #1e293b; padding: 14px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #6366f1;">
            <strong>Message / Request:</strong>
            <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${inquiry.message}</p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Reply directly via WhatsApp or Phone to customer: ${inquiry.whatsapp || inquiry.phone}</p>
        </div>
      </div>
    `;

    const recipients = [adminEmail];
    if (inquiry.email && inquiry.email.includes("@")) {
      recipients.push(inquiry.email);
    }

    const info = await transporter.sendMail({
      from: `"EcoStore Support" <${process.env.SMTP_FROM || "support@ecostore.com"}>`,
      to: recipients.join(", "),
      subject,
      html,
    });

    console.log(`✅ Inquiry email sent for ticket ${inquiry.ticketNumber}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send Inquiry Email:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Official Store Support Reply Email to Customer
 */
async function sendInquiryReplyEmail(inquiry, replyText) {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || "rayanali0560@gmail.com";
    const customerEmail = inquiry.email ? String(inquiry.email).trim() : "";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const ticketUrl = `${frontendUrl}/contact`;
    const hotline = "+92 321 3633473";
    const hotlineDigits = "923213633473";
    const whatsappUrl = `https://wa.me/${hotlineDigits}?text=${encodeURIComponent(
      `Assalam-o-Alaikum EcoStore! I received a reply for my ticket #${inquiry.ticketNumber || ""}.`
    )}`;

    if (!customerEmail || !customerEmail.includes("@")) {
      console.warn(`⚠️ Cannot send reply email for ticket ${inquiry.ticketNumber}: Customer email is missing.`);
      return { success: false, error: "No customer email provided" };
    }

    const subject = `💬 [EcoStore Support] Response to Ticket #${inquiry.ticketNumber || "Inquiry"}`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>EcoStore Support Response</title>
      <style>
        body { margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; padding: 24px 14px; box-sizing: border-box; }
        .card { background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #312e81; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; display: inline-block; }
        .logo-tag { display: inline-block; background: rgba(99, 102, 241, 0.2); border: 1px solid #6366f1; color: #a5b4fc; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 5px 12px; border-radius: 999px; margin-top: 10px; }
        .content { padding: 28px 24px; }
        .greeting { font-size: 18px; font-weight: 700; color: #f8fafc; margin-bottom: 10px; }
        .lead-text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 22px; }
        .reply-box { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-left: 4px solid #10b981; border-radius: 12px; padding: 18px 20px; margin-bottom: 22px; }
        .reply-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #34d399; margin-bottom: 8px; }
        .reply-text { font-size: 15px; line-height: 1.65; color: #f0fdf4; font-weight: 500; white-space: pre-wrap; margin: 0; }
        .original-box { background: #131d31; border: 1px solid #1e293b; border-radius: 12px; padding: 16px 20px; margin-bottom: 22px; }
        .original-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px; }
        .original-text { font-size: 13px; line-height: 1.55; color: #94a3b8; margin: 0; white-space: pre-wrap; }
        .ticket-info-grid { width: 100%; border-collapse: collapse; background: #0b1120; border-radius: 10px; border: 1px solid #1e293b; margin-bottom: 24px; overflow: hidden; }
        .ticket-info-grid td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #1e293b; }
        .ticket-info-grid tr:last-child td { border-bottom: none; }
        .grid-label { color: #64748b; width: 35%; font-weight: 500; }
        .grid-val { color: #e2e8f0; font-weight: 600; }
        .btn-container { text-align: center; margin: 26px 0 16px 0; }
        .btn-primary { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; margin: 4px; }
        .btn-whatsapp { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; margin: 4px; }
        .footer { background: #080d19; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div class="logo">EcoStore Official Support</div>
            <br />
            <span class="logo-tag">TICKET #${inquiry.ticketNumber || "SUPPORT"}</span>
          </div>
          <div class="content">
            <div class="greeting">Assalam-o-Alaikum ${inquiry.name || "Customer"},</div>
            <p class="lead-text">
              Our store concierge team has reviewed your request regarding 
              <strong>${inquiry.category || "Support Inquiry"}</strong>. Here is our official response:
            </p>

            <div class="reply-box">
              <div class="reply-label">✦ ECOSTORE OFFICIAL REPLY:</div>
              <p class="reply-text">${replyText}</p>
            </div>

            <div class="original-box">
              <div class="original-label">Your Original Question / Request:</div>
              <p class="original-text">${inquiry.message || "—"}</p>
            </div>

            <table class="ticket-info-grid">
              <tr>
                <td class="grid-label">Ticket ID</td>
                <td class="grid-val">${inquiry.ticketNumber || "—"}</td>
              </tr>
              <tr>
                <td class="grid-label">Department</td>
                <td class="grid-val">${inquiry.category || "General Support"}</td>
              </tr>
              ${inquiry.orderNumber ? `
              <tr>
                <td class="grid-label">Order Reference</td>
                <td class="grid-val">${inquiry.orderNumber}</td>
              </tr>` : ""}
              <tr>
                <td class="grid-label">Status</td>
                <td class="grid-val" style="color: #34d399;">Replied (Resolved)</td>
              </tr>
            </table>

            <div class="btn-container">
              <a href="${ticketUrl}" class="btn-primary" target="_blank">Track Ticket on Store</a>
              <a href="${whatsappUrl}" class="btn-whatsapp" target="_blank">WhatsApp Direct Hotline</a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 18px; line-height: 1.5;">
              You can also check this reply anytime on our Contact page using your Ticket ID: <strong>${inquiry.ticketNumber}</strong>.<br/>
              If you need more help, reply directly to this email or message us on WhatsApp: <strong>${hotline}</strong>.
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0 0 6px 0;">EcoStore Pakistan — Curated Luxury Goods & 24/7 Dedicated Support</p>
            <p style="margin: 0;">Hotline: ${hotline} • Support: ${adminEmail}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    const recipients = [customerEmail];
    const bccRecipients = adminEmail && adminEmail.toLowerCase() !== customerEmail.toLowerCase() ? [adminEmail] : [];

    const info = await transporter.sendMail({
      from: `"EcoStore Support" <${process.env.SMTP_FROM || adminEmail || "support@ecostore.com"}>`,
      to: recipients.join(", "),
      bcc: bccRecipients.length > 0 ? bccRecipients.join(", ") : undefined,
      subject,
      html,
    });

    console.log(`✅ Support reply email sent to [${customerEmail}] for ticket #${inquiry.ticketNumber}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send Support Reply Email:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  createTransporter,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendInquiryNotificationEmail,
  sendInquiryReplyEmail,
};
