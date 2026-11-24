const Product = require("../models/Product");
const Order = require("../models/Order");
const Inquiry = require("../models/Inquiry");
const User = require("../models/User");

// @desc    Get Admin Dashboard Stats & Metrics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      totalInquiries,
      unreadInquiries,
      totalCustomers,
      lowStockProducts,
      recentOrders,
      recentProducts,
      recentInquiries,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "pending" }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: "new" }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Product.find().sort({ createdAt: -1 }).limit(5),
      Inquiry.find().sort({ createdAt: -1 }).limit(5),
    ]);

    // Calculate total revenue from non-cancelled orders
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalInquiries,
        unreadInquiries,
        totalCustomers,
        lowStockProducts,
      },
      recentOrders,
      recentProducts,
      recentInquiries,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
