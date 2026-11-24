require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const { connectDB } = require("./config/db");
const {
  initMySQL,
  isMySQLConnected,
  mysqlGetProducts,
  mysqlGetProduct,
  mysqlCreateProduct,
  mysqlUpdateProduct,
  mysqlDeleteProduct,
  mysqlGetAllOrders,
  mysqlCreateOrder,
  mysqlGetOrder,
  mysqlUpdateOrderStatus,
  mysqlDeleteOrder,
  mysqlGetAllInquiries,
  mysqlCreateInquiry,
  mysqlGetInquiry,
  mysqlUpdateInquiry,
  mysqlDeleteInquiry,
  mysqlGetCategories,
  mysqlGetSettings,
  mysqlUpdateSettings,
  mysqlGetAllTestimonials,
  mysqlGetPublicTestimonials,
  mysqlCreateTestimonial,
  mysqlUpdateTestimonial,
  mysqlToggleTestimonialStatus,
  mysqlDeleteTestimonial,
  mysqlAuthRegister,
  mysqlAuthLogin,
  mysqlGetDashboardStats,
} = require("./config/mysql");

// Load all Mongoose models
require("./models");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");

const upload = require("./middleware/uploadMiddleware");
const { protect, adminOnly } = require("./middleware/authMiddleware");
const offlineStore = require("./utils/offlineStore");
const {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendInquiryNotificationEmail,
  sendInquiryReplyEmail,
} = require("./utils/emailService");

const app = express();

// ========================================
// CORS & MIDDLEWARE
// ========================================
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ========================================
// STATIC UPLOADS FOLDER
// ========================================
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ========================================
// HEALTH CHECK
// ========================================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Professional E-Commerce Store Backend API is running smoothly!",
    mongoConnected: mongoose.connection.readyState === 1,
    mysqlConnected: isMySQLConnected(),
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// IMAGE / ASSET UPLOAD ROUTE
// ========================================
app.post("/api/upload", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const host = req.get("host") || "localhost:5000";
    const protocol = req.protocol || "http";
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully!",
      url: fileUrl,
      filename: req.file.filename,
    });
  });
});

// ========================================
// DUAL DATABASE & RESILIENT STORAGE ROUTER
// (Full CRUD for MySQL / phpMyAdmin, MongoDB, or Offline Store)
// ========================================
app.use("/api", async (req, res, next) => {
  // Let health and AI Chat pass through to dedicated controllers
  if (req.path === "/health" || req.path.startsWith("/ai")) {
    return next();
  }

  // ----------------------------------------------------
  // 1. IF MYSQL IS CONNECTED -> SERVE & STORE IN MYSQL
  // ----------------------------------------------------
  if (isMySQLConnected()) {
    try {
      // --- PRODUCTS ---
      // A. List Products
      if ((req.path === "/products" || req.path === "/projects") && req.method === "GET") {
        const products = await mysqlGetProducts(req.query);
        return res.json({
          success: true,
          count: products.length,
          total: products.length,
          products,
          data: products,
          source: "mysql_phpmyadmin",
        });
      }

      // B. Create Product
      if ((req.path === "/products" || req.path === "/projects") && req.method === "POST") {
        const product = await mysqlCreateProduct(req.body);
        return res.status(201).json({
          success: true,
          message: "Product created successfully in MySQL & phpMyAdmin!",
          product,
          data: product,
          source: "mysql_phpmyadmin",
        });
      }

      // C. Get Single Product
      if (
        (req.path.startsWith("/products/") || req.path.startsWith("/projects/")) &&
        req.method === "GET"
      ) {
        const idOrSlug = req.path.split("/")[2];
        const product = await mysqlGetProduct(idOrSlug);
        if (product) {
          return res.json({ success: true, product, data: product, source: "mysql_phpmyadmin" });
        }
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      // D. Update Product (PUT / PATCH)
      if (
        (req.path.startsWith("/products/") || req.path.startsWith("/projects/")) &&
        (req.method === "PUT" || req.method === "PATCH")
      ) {
        const id = req.path.split("/")[2];
        const product = await mysqlUpdateProduct(id, req.body);
        if (product) {
          return res.json({
            success: true,
            message: "Product updated successfully in MySQL!",
            product,
            data: product,
            source: "mysql_phpmyadmin",
          });
        }
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      // E. Delete Product
      if (
        (req.path.startsWith("/products/") || req.path.startsWith("/projects/")) &&
        req.method === "DELETE"
      ) {
        const id = req.path.split("/")[2];
        const deleted = await mysqlDeleteProduct(id);
        return res.json({
          success: deleted,
          message: deleted ? "Product deleted successfully from MySQL" : "Product could not be deleted",
          source: "mysql_phpmyadmin",
        });
      }

      // --- ORDERS ---
      // A. List Orders (Supports ?status=... and ?search=...)
      if (req.path === "/orders" && req.method === "GET") {
        const orders = await mysqlGetAllOrders(req.query);
        return res.json({
          success: true,
          count: orders.length,
          total: orders.length,
          orders,
          data: orders,
          source: "mysql_phpmyadmin",
        });
      }

      // B. Create Order
      if (req.path === "/orders" && req.method === "POST") {
        const newOrder = await mysqlCreateOrder(req.body);
        if (newOrder) {
          sendOrderConfirmationEmail(newOrder).catch(() => {});
          return res.status(201).json({
            success: true,
            message: "Order placed successfully! (Saved in MySQL & phpMyAdmin)",
            orderNumber: newOrder.orderNumber,
            order: newOrder,
            source: "mysql_phpmyadmin",
          });
        }
      }

      // C. Update Order Status / Tracking (PATCH /orders/:id/status or PATCH /orders/:id)
      if (req.path.startsWith("/orders/") && (req.method === "PATCH" || req.method === "PUT")) {
        const id = req.path.split("/")[2];
        const updatedOrder = await mysqlUpdateOrderStatus(id, req.body);
        if (updatedOrder) {
          if (req.body.orderStatus) {
            sendOrderStatusEmail(updatedOrder, req.body.orderStatus).catch(() => {});
          }
          return res.json({
            success: true,
            message: "Order status updated successfully!",
            order: updatedOrder,
            data: updatedOrder,
            source: "mysql_phpmyadmin",
          });
        }
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // D. Delete Order
      if (req.path.startsWith("/orders/") && req.method === "DELETE") {
        const id = req.path.split("/")[2];
        const deleted = await mysqlDeleteOrder(id);
        return res.json({
          success: deleted,
          message: deleted ? "Order deleted successfully from MySQL" : "Order not found",
          source: "mysql_phpmyadmin",
        });
      }

      // E. View Single Order
      if (req.path.startsWith("/orders/") && req.method === "GET") {
        const idOrNum = req.path.split("/")[2];
        const order = await mysqlGetOrder(idOrNum);
        if (order) {
          return res.json({ success: true, order, data: order, source: "mysql_phpmyadmin" });
        }
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // --- INQUIRIES & MESSAGES ---
      // A. List Inquiries / Support Tickets
      if ((req.path === "/inquiries" || req.path === "/messages") && req.method === "GET") {
        const inquiries = await mysqlGetAllInquiries(req.query);
        return res.json({
          success: true,
          count: inquiries.length,
          total: inquiries.length,
          inquiries,
          data: inquiries,
          source: "mysql_phpmyadmin",
        });
      }

      // B. Create Support Inquiry
      if (
        (req.path === "/inquiries" || req.path === "/contact" || req.path === "/messages") &&
        req.method === "POST"
      ) {
        const inq = await mysqlCreateInquiry(req.body);
        if (inq) {
          sendInquiryNotificationEmail(inq).catch(() => {});
          return res.status(201).json({
            success: true,
            message: "Inquiry received! (Saved in MySQL & phpMyAdmin)",
            ticketNumber: inq.ticketNumber,
            inquiry: inq,
            data: inq,
            source: "mysql_phpmyadmin",
          });
        }
      }

      // C. Track Support Ticket (Supports /contact/ticket/, /inquiries/ticket/, /messages/ticket/)
      if (
        req.path.startsWith("/inquiries/ticket/") ||
        req.path.startsWith("/contact/ticket/") ||
        req.path.startsWith("/messages/ticket/")
      ) {
        const parts = req.path.split("/");
        const tNum = decodeURIComponent(parts[parts.length - 1] || parts[3] || "").trim();
        const inq = await mysqlGetInquiry(tNum);
        if (inq) {
          return res.json({
            success: true,
            ticket: inq,
            inquiry: inq,
            data: inq,
            source: "mysql_phpmyadmin",
          });
        }
        return res.status(404).json({
          success: false,
          message: `Ticket "${tNum}" not found. Please check your Ticket ID.`,
        });
      }

      // D. Update Support Inquiry (Admin Reply / Status)
      if (
        (req.path.startsWith("/inquiries/") ||
          req.path.startsWith("/messages/") ||
          req.path.startsWith("/contact/")) &&
        (req.method === "PUT" || req.method === "PATCH")
      ) {
        const parts = req.path.split("/");
        const id = parts[2];
        const inq = await mysqlUpdateInquiry(id, req.body);
        if (inq) {
          if (req.body.adminReply && String(req.body.adminReply).trim()) {
            sendInquiryReplyEmail(inq, String(req.body.adminReply).trim()).catch((err) => {
              console.error("Async Inquiry Reply Email Error:", err.message);
            });
          }
          return res.json({
            success: true,
            message: "Inquiry updated successfully! Reply email dispatched.",
            inquiry: inq,
            data: inq,
            ticket: inq,
            source: "mysql_phpmyadmin",
          });
        }
        return res.status(404).json({ success: false, message: "Inquiry not found" });
      }

      // E. Delete Inquiry
      if (
        (req.path.startsWith("/inquiries/") || req.path.startsWith("/messages/")) &&
        req.method === "DELETE"
      ) {
        const id = req.path.split("/")[2];
        const deleted = await mysqlDeleteInquiry(id);
        return res.json({
          success: deleted,
          message: deleted ? "Inquiry deleted successfully from MySQL" : "Inquiry not found",
          source: "mysql_phpmyadmin",
        });
      }

      // --- CATEGORIES ---
      if (req.path === "/categories" && req.method === "GET") {
        const categories = await mysqlGetCategories();
        return res.json({
          success: true,
          categories,
          data: categories,
          source: "mysql_phpmyadmin",
        });
      }

      // --- STORE SETTINGS & RETURN POLICY ---
      if (req.path === "/settings" && req.method === "GET") {
        const settings = await mysqlGetSettings();
        return res.json({
          success: true,
          settings,
          data: settings,
          source: "mysql_phpmyadmin",
        });
      }

      if (
        req.path === "/settings" &&
        (req.method === "PUT" || req.method === "POST" || req.method === "PATCH")
      ) {
        const updated = await mysqlUpdateSettings(req.body);
        return res.json({
          success: true,
          message: "Store settings and return policy saved successfully in MySQL!",
          settings: updated,
          data: updated,
          source: "mysql_phpmyadmin",
        });
      }

      // --- TESTIMONIALS & CUSTOMER REVIEWS (Full Admin Control / Moderation) ---
      // A. Public Reviews (Only Approved Reviews for Home & PDP)
      if (
        (req.path === "/testimonials/public" || req.path === "/reviews/public") &&
        req.method === "GET"
      ) {
        const list = await mysqlGetPublicTestimonials(req.query);
        return res.json({
          success: true,
          count: list.length,
          testimonials: list,
          reviews: list,
          data: list,
          source: "mysql_phpmyadmin",
        });
      }

      // B. All Reviews for Admin Dashboard (Pending, Approved, Rejected, etc.)
      if (
        (req.path === "/testimonials" || req.path === "/reviews") &&
        req.method === "GET"
      ) {
        const list = await mysqlGetAllTestimonials(req.query);
        return res.json({
          success: true,
          count: list.length,
          testimonials: list,
          reviews: list,
          data: list,
          source: "mysql_phpmyadmin",
        });
      }

      // C. Customer / Admin Review Submission
      if (
        (req.path === "/testimonials" || req.path === "/reviews") &&
        req.method === "POST"
      ) {
        const isAdmin = Boolean(req.headers.authorization);
        const item = await mysqlCreateTestimonial(req.body, isAdmin);
        const message = item.approved
          ? "Review published successfully to live store!"
          : "Thank you! Your review has been submitted for verification. It will appear on the store once approved by our team.";
        return res.status(201).json({
          success: true,
          message,
          data: item,
          testimonial: item,
          review: item,
          source: "mysql_phpmyadmin",
        });
      }

      // D. Update Review / Toggle Approve or Feature (PUT or PATCH /testimonials/:id)
      if (
        (req.path.startsWith("/testimonials/") || req.path.startsWith("/reviews/")) &&
        (req.method === "PUT" || req.method === "PATCH")
      ) {
        const parts = req.path.split("/");
        const id = parts[2];
        const subAction = parts[3];

        if (subAction === "status") {
          const field = req.body.field || "approved";
          const updated = await mysqlToggleTestimonialStatus(id, field);
          return res.json({
            success: true,
            message: `Review ${field} status toggled successfully!`,
            data: updated,
            testimonial: updated,
            review: updated,
            source: "mysql_phpmyadmin",
          });
        }

        const updated = await mysqlUpdateTestimonial(id, req.body);
        if (updated) {
          return res.json({
            success: true,
            message: "Review updated successfully!",
            data: updated,
            testimonial: updated,
            review: updated,
            source: "mysql_phpmyadmin",
          });
        }
        return res.status(404).json({ success: false, message: "Review not found" });
      }

      // E. Delete Review
      if (
        (req.path.startsWith("/testimonials/") || req.path.startsWith("/reviews/")) &&
        req.method === "DELETE"
      ) {
        const id = req.path.split("/")[2];
        const deleted = await mysqlDeleteTestimonial(id);
        return res.json({
          success: deleted,
          message: deleted ? "Review deleted successfully" : "Review not found",
          source: "mysql_phpmyadmin",
        });
      }

      // --- USER AUTHENTICATION ---
      if (req.path === "/auth/register" && req.method === "POST") {
        const { name, email, password, role = "admin" } = req.body;
        if (!name || !email || !password) {
          return res.status(400).json({ success: false, message: "Name, email and password are required" });
        }
        if (password.length < 6) {
          return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }
        const result = await mysqlAuthRegister(name, email, password, role);
        return res.status(201).json({
          success: true,
          message: "Registration successful! Account saved to MySQL & phpMyAdmin.",
          token: result.token,
          user: result.user,
          source: "mysql_phpmyadmin",
        });
      }

      if (req.path === "/auth/login" && req.method === "POST") {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ success: false, message: "Please provide email and password" });
        }
        const result = await mysqlAuthLogin(email, password);
        return res.status(200).json({
          success: true,
          message: "Login successful!",
          token: result.token,
          user: result.user,
          source: "mysql_phpmyadmin",
        });
      }

      // --- DASHBOARD STATS ---
      if ((req.path === "/dashboard/stats" || req.path === "/dashboard") && req.method === "GET") {
        const statsData = await mysqlGetDashboardStats();
        return res.json(statsData);
      }
    } catch (mysqlErr) {
      console.error("MySQL Route Execution Error:", mysqlErr.message);
      const statusCode = mysqlErr.statusCode || 400;
      return res.status(statusCode).json({ success: false, message: mysqlErr.message });
    }
  }

  // ----------------------------------------------------
  // 2. IF MONGODB IS CONNECTED -> PASS TO MONGOOSE
  // ----------------------------------------------------
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // ----------------------------------------------------
  // 3. OFFLINE RESILIENT FALLBACK (If neither MySQL nor MongoDB is running)
  // ----------------------------------------------------
  try {
    // Products
    if ((req.path === "/products" || req.path === "/projects") && req.method === "GET") {
      const list = offlineStore.getOfflineProducts();
      return res.json({
        success: true,
        count: list.length,
        total: list.length,
        products: list,
        data: list,
        source: "offline_resilient_store",
      });
    }

    if ((req.path === "/products" || req.path === "/projects") && req.method === "POST") {
      const newProd = offlineStore.createOfflineProduct(req.body);
      return res.status(201).json({
        success: true,
        message: "Product created successfully in offline catalog!",
        product: newProd,
        data: newProd,
        source: "offline_resilient_store",
      });
    }

    if (
      (req.path.startsWith("/products/") || req.path.startsWith("/projects/")) &&
      (req.method === "PUT" || req.method === "PATCH")
    ) {
      const id = req.path.split("/")[2];
      const updated = offlineStore.updateOfflineProduct(id, req.body);
      return res.json({
        success: Boolean(updated),
        product: updated,
        data: updated,
        source: "offline_resilient_store",
      });
    }

    if (
      (req.path.startsWith("/products/") || req.path.startsWith("/projects/")) &&
      req.method === "DELETE"
    ) {
      const id = req.path.split("/")[2];
      const deleted = offlineStore.deleteOfflineProduct(id);
      return res.json({
        success: deleted,
        message: deleted ? "Product deleted successfully" : "Product not found",
        source: "offline_resilient_store",
      });
    }

    if (
      (req.path.startsWith("/products/") || req.path.startsWith("/projects/")) &&
      req.method === "GET"
    ) {
      const idOrSlug = req.path.split("/")[2];
      const prod = offlineStore.getOfflineProductById(idOrSlug);
      return res.json({
        success: true,
        product: prod,
        data: prod,
        source: "offline_resilient_store",
      });
    }

    // Orders
    if (req.path === "/orders" && req.method === "GET") {
      const orders = offlineStore.getOfflineOrders(req.query);
      return res.json({
        success: true,
        count: orders.length,
        total: orders.length,
        orders,
        data: orders,
        source: "offline_resilient_store",
      });
    }

    if (req.path === "/orders" && req.method === "POST") {
      const newOrder = offlineStore.createOfflineOrder(req.body);
      sendOrderConfirmationEmail(newOrder).catch(() => {});
      return res.status(201).json({
        success: true,
        message: "Order placed successfully! (Offline Dev Store Active)",
        orderNumber: newOrder.orderNumber,
        order: newOrder,
        source: "offline_resilient_store",
      });
    }

    if (req.path.startsWith("/orders/") && (req.method === "PATCH" || req.method === "PUT")) {
      const id = req.path.split("/")[2];
      const updated = offlineStore.updateOfflineOrderStatus(id, req.body);
      if (updated && req.body.orderStatus) {
        sendOrderStatusEmail(updated, req.body.orderStatus).catch(() => {});
      }
      return res.json({
        success: Boolean(updated),
        order: updated,
        data: updated,
        source: "offline_resilient_store",
      });
    }

    if (req.path.startsWith("/orders/") && req.method === "DELETE") {
      const id = req.path.split("/")[2];
      const deleted = offlineStore.deleteOfflineOrder(id);
      return res.json({
        success: deleted,
        message: deleted ? "Order deleted successfully" : "Order not found",
        source: "offline_resilient_store",
      });
    }

    if (req.path.startsWith("/orders/") && req.method === "GET") {
      const idOrNum = req.path.split("/")[2];
      const order = offlineStore.getOfflineOrder(idOrNum);
      if (order) {
        return res.json({ success: true, order, data: order, source: "offline_resilient_store" });
      }
    }

    // Inquiries
    if ((req.path === "/inquiries" || req.path === "/messages") && req.method === "GET") {
      const inquiries = offlineStore.getOfflineInquiries(req.query);
      return res.json({
        success: true,
        count: inquiries.length,
        total: inquiries.length,
        inquiries,
        data: inquiries,
        source: "offline_resilient_store",
      });
    }

    if (
      (req.path === "/inquiries" || req.path === "/contact" || req.path === "/messages") &&
      req.method === "POST"
    ) {
      const inq = offlineStore.createOfflineInquiry(req.body);
      sendInquiryNotificationEmail(inq).catch(() => {});
      return res.status(201).json({
        success: true,
        message: "Your message has been received! (Offline Dev Store Active)",
        ticketNumber: inq.ticketNumber,
        inquiry: inq,
        data: inq,
        source: "offline_resilient_store",
      });
    }

    if (
      req.path.startsWith("/inquiries/ticket/") ||
      req.path.startsWith("/contact/ticket/") ||
      req.path.startsWith("/messages/ticket/")
    ) {
      const parts = req.path.split("/");
      const tNum = decodeURIComponent(parts[parts.length - 1] || parts[3] || "").trim();
      const inq = offlineStore.getOfflineInquiry(tNum);
      if (inq) {
        return res.json({
          success: true,
          ticket: inq,
          inquiry: inq,
          data: inq,
          source: "offline_resilient_store",
        });
      }
    }

    if (
      (req.path.startsWith("/inquiries/") ||
        req.path.startsWith("/messages/") ||
        req.path.startsWith("/contact/")) &&
      (req.method === "PUT" || req.method === "PATCH")
    ) {
      const parts = req.path.split("/");
      const id = parts[2];
      const updated = offlineStore.updateOfflineInquiry(id, req.body);
      if (updated && req.body.adminReply && String(req.body.adminReply).trim()) {
        sendInquiryReplyEmail(updated, String(req.body.adminReply).trim()).catch(() => {});
      }
      return res.json({
        success: Boolean(updated),
        inquiry: updated,
        data: updated,
        ticket: updated,
        source: "offline_resilient_store",
      });
    }

    if (
      (req.path.startsWith("/inquiries/") || req.path.startsWith("/messages/")) &&
      req.method === "DELETE"
    ) {
      const id = req.path.split("/")[2];
      const deleted = offlineStore.deleteOfflineInquiry(id);
      return res.json({
        success: deleted,
        message: deleted ? "Inquiry deleted successfully" : "Inquiry not found",
        source: "offline_resilient_store",
      });
    }

    // Categories
    if (req.path === "/categories" && req.method === "GET") {
      return res.json({
        success: true,
        categories: [
          { _id: "c-1", name: "Audio & Headphones", slug: "audio-headphones" },
          { _id: "c-2", name: "Smart Watches", slug: "smart-watches" },
          { _id: "c-3", name: "Footwear", slug: "footwear" },
          { _id: "c-4", name: "Fashion & Apparel", slug: "fashion-apparel" },
          { _id: "c-5", name: "Accessories", slug: "accessories" },
          { _id: "c-6", name: "Electronics", slug: "electronics" },
        ],
      });
    }

    // Offline Store Settings & Policies
    if (req.path === "/settings" && req.method === "GET") {
      const settings = offlineStore.getOfflineSettings();
      return res.json({
        success: true,
        settings,
        data: settings,
        source: "offline_resilient_store",
      });
    }

    if (
      req.path === "/settings" &&
      (req.method === "PUT" || req.method === "POST" || req.method === "PATCH")
    ) {
      const updated = offlineStore.updateOfflineSettings(req.body);
      return res.json({
        success: true,
        message: "Store settings and return policy saved successfully (Offline Store)",
        settings: updated,
        data: updated,
        source: "offline_resilient_store",
      });
    }

    // Testimonials & Reviews (Offline Fallback)
    if (
      (req.path === "/testimonials/public" || req.path === "/reviews/public") &&
      req.method === "GET"
    ) {
      const list = offlineStore.getOfflineTestimonials(true);
      return res.json({
        success: true,
        count: list.length,
        testimonials: list,
        reviews: list,
        data: list,
        source: "offline_resilient_store",
      });
    }

    if (
      (req.path === "/testimonials" || req.path === "/reviews") &&
      req.method === "GET"
    ) {
      const list = offlineStore.getOfflineTestimonials(false);
      return res.json({
        success: true,
        count: list.length,
        testimonials: list,
        reviews: list,
        data: list,
        source: "offline_resilient_store",
      });
    }

    if (
      (req.path === "/testimonials" || req.path === "/reviews") &&
      req.method === "POST"
    ) {
      const isAdmin = Boolean(req.headers.authorization);
      const item = offlineStore.createOfflineTestimonial(req.body, isAdmin);
      return res.status(201).json({
        success: true,
        message: item.approved
          ? "Review published successfully!"
          : "Thank you! Your review has been submitted for approval.",
        data: item,
        testimonial: item,
        review: item,
        source: "offline_resilient_store",
      });
    }

    if (
      (req.path.startsWith("/testimonials/") || req.path.startsWith("/reviews/")) &&
      (req.method === "PUT" || req.method === "PATCH")
    ) {
      const parts = req.path.split("/");
      const id = parts[2];
      const subAction = parts[3];

      if (subAction === "status") {
        const field = req.body.field || "approved";
        const updated = offlineStore.toggleOfflineTestimonial(id, field);
        return res.json({
          success: Boolean(updated),
          data: updated,
          testimonial: updated,
          review: updated,
          source: "offline_resilient_store",
        });
      }

      const updated = offlineStore.updateOfflineTestimonial(id, req.body);
      return res.json({
        success: Boolean(updated),
        data: updated,
        testimonial: updated,
        review: updated,
        source: "offline_resilient_store",
      });
    }

    if (
      (req.path.startsWith("/testimonials/") || req.path.startsWith("/reviews/")) &&
      req.method === "DELETE"
    ) {
      const id = req.path.split("/")[2];
      const deleted = offlineStore.deleteOfflineTestimonial(id);
      return res.json({
        success: deleted,
        message: deleted ? "Review deleted" : "Review not found",
        source: "offline_resilient_store",
      });
    }

    // Auth
    if (req.path === "/auth/login" && req.method === "POST") {
      const authData = offlineStore.getOfflineAuth(req.body?.email);
      return res.json({
        success: true,
        message: "Logged in successfully (Offline Dev Mode)",
        ...authData,
      });
    }

    if (req.path === "/auth/register" && req.method === "POST") {
      const authData = offlineStore.getOfflineAuth(req.body?.email);
      return res.status(201).json({
        success: true,
        message: "Account created successfully (Offline Dev Mode)",
        ...authData,
      });
    }

    // Dashboard Stats
    if ((req.path === "/dashboard/stats" || req.path === "/dashboard") && req.method === "GET") {
      const prods = offlineStore.getOfflineProducts();
      const ords = offlineStore.getOfflineOrders();
      const inqs = offlineStore.getOfflineInquiries();
      return res.json({
        success: true,
        stats: {
          totalProducts: prods.length,
          totalOrders: ords.length,
          pendingOrders: ords.filter((o) => o.orderStatus === "pending").length,
          totalRevenue: ords.reduce((acc, o) => acc + (o.totalAmount || 0), 0),
          totalInquiries: inqs.length,
          unreadInquiries: inqs.filter((i) => i.status === "new").length,
          totalCustomers: Math.max(1, ords.length),
          lowStockProducts: 0,
        },
        recentOrders: ords.slice(0, 5),
        recentProducts: prods.slice(0, 5),
        recentInquiries: inqs.slice(0, 5),
      });
    }
  } catch (offlineErr) {
    console.error("Offline Store Route Error:", offlineErr.message);
  }

  next();
});

// ========================================
// API ROUTES (For MongoDB / Standard Stack)
// ========================================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

// Backward-compatibility aliases
app.use("/api/projects", productRoutes);
app.use("/api/messages", inquiryRoutes);
app.use("/api/contact", inquiryRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EcoStore E-Commerce API is running",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      orders: "/api/orders",
      inquiries: "/api/inquiries",
      auth: "/api/auth",
      dashboard: "/api/dashboard/stats",
    },
  });
});

// 404 handler for unmatched API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: `API route '${req.originalUrl}' not found on this server.`,
    });
  }
  next();
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Global Server Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

// ========================================
// SERVER INITIALIZATION & DUAL DB BOOTSTRAP
// ========================================
const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log("--------------------------------------------------");
  console.log("🚀 Starting EcoStore Backend Server...");

  // Try connecting to MySQL / phpMyAdmin first
  try {
    await initMySQL();
  } catch (err) {
    console.warn("⚠️ MySQL init warning:", err.message);
  }

  // Try connecting to MongoDB in parallel (non-blocking)
  connectDB().catch((err) => {
    console.warn("⚠️ MongoDB offline notice:", err.message);
  });

  app.listen(PORT, () => {
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log(`📡 Ready for frontend requests from http://localhost:5173`);
    console.log("--------------------------------------------------");
  });
}

startServer();
