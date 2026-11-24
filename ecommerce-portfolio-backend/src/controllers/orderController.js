const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
} = require("../utils/emailService");

// @desc    Create new order (Customer checkout or direct order message)
// @route   POST /api/orders
// @access  Public (Guest or logged-in)
const createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      shippingFee = 0,
      discount = 0,
      paymentMethod = "cash_on_delivery",
      customerMessage = "",
    } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone number, and delivery address are required.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your order must contain at least one product.",
      });
    }

    // Calculate subtotal & prepare items
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.title || item.product}`,
        });
      }

      const activePrice =
        product.salePrice && product.salePrice < product.price
          ? product.salePrice
          : product.price;

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const itemTotal = activePrice * qty;

      subtotal += itemTotal;

      verifiedItems.push({
        product: product._id,
        title: product.title,
        image: product.images?.[0] || item.image || "",
        price: activePrice,
        quantity: qty,
        selectedVariant: item.selectedVariant || {},
        total: itemTotal,
      });

      // Decrement product stock if in stock
      if (product.stock >= qty) {
        product.stock -= qty;
        product.inStock = product.stock > 0;
        await product.save();
      }
    }

    const totalAmount = Math.max(
      0,
      subtotal + Number(shippingFee) - Number(discount)
    );

    // Auto generate unique order number: ORD-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomHex}`;

    const order = await Order.create({
      orderNumber,
      user: req.user?._id || null,
      customer: {
        name: customer.name.trim(),
        email: customer.email ? customer.email.trim() : "customer@store.com",
        phone: customer.phone.trim(),
        whatsapp: customer.whatsapp ? customer.whatsapp.trim() : customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city ? customer.city.trim() : "Default City",
        postalCode: customer.postalCode || "",
        notes: customerMessage || customer.notes || "",
      },
      items: verifiedItems,
      subtotal,
      shippingFee: Number(shippingFee),
      discount: Number(discount),
      totalAmount,
      paymentMethod,
      orderStatus: "pending",
    });

    // Send order confirmation email asynchronously to customer and store admin
    sendOrderConfirmationEmail(order).catch((mailErr) => {
      console.error("Order Confirmation Email Dispatch Error:", mailErr.message);
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Confirmation email has been sent.",
      orderNumber: order.orderNumber,
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process order",
    });
  }
};

// @desc    Get all orders (Admin Dashboard)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 25 } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
        { "customer.city": { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      orders,
      data: orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// @desc    Get single order details by ID or Order Number
// @route   GET /api/orders/:idOrNumber
// @access  Public
const getOrderByIdOrNumber = async (req, res) => {
  try {
    const { idOrNumber } = req.params;

    let order;

    if (idOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(idOrNumber).populate(
        "items.product",
        "title images price"
      );
    }

    if (!order) {
      order = await Order.findOne({ orderNumber: idOrNumber }).populate(
        "items.product",
        "title images price"
      );
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

// @desc    Update order status (Admin Dashboard)
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber, adminNotes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === "delivered" && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    await order.save();

    // Notify customer about order status change (shipped/delivered)
    if (orderStatus && ["processing", "shipped", "delivered", "cancelled"].includes(orderStatus)) {
      sendOrderStatusEmail(order).catch((mailErr) => {
        console.error("Order Status Email Dispatch Error:", mailErr.message);
      });
    }

    res.status(200).json({
      success: true,
      message: `Order updated to ${order.orderStatus}`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderByIdOrNumber,
  updateOrderStatus,
  deleteOrder,
};
