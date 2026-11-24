const Inquiry = require("../models/Inquiry");
const { sendInquiryNotificationEmail } = require("../utils/emailService");

const ALLOWED_CATEGORIES = [
  "Order & Delivery",
  "Return / Exchange",
  "Product Request",
  "Bulk / Wholesale",
  "General Support",
];

function generateTicketNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SUP-${dateStr}-${randomCode}`;
}

// @desc    Customer submits a store contact / support ticket / product request
// @route   POST /api/inquiries (and /api/contact, /api/messages)
// @access  Public
const createInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      whatsapp,
      message,
      category,
      orderNumber,
      subject,
      preferredContact,
      product,
      productTitle,
      requestedQuantity,
      budget,
    } = req.body;

    if (!name || !name.trim() || !phone || !phone.trim() || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, phone/WhatsApp number, and message are required.",
      });
    }

    const safeCategory = ALLOWED_CATEGORIES.includes(category)
      ? category
      : productTitle
      ? "Product Request"
      : "General Support";

    const safePreferred = ["whatsapp", "phone", "email"].includes(preferredContact)
      ? preferredContact
      : "whatsapp";

    const autoPriority =
      safeCategory === "Return / Exchange" || safeCategory === "Order & Delivery"
        ? "high"
        : "normal";

    const ticketNumber = generateTicketNumber();

    const inquiry = await Inquiry.create({
      ticketNumber,
      category: safeCategory,
      orderNumber: orderNumber ? orderNumber.trim().toUpperCase() : "",
      subject:
        subject && subject.trim()
          ? subject.trim()
          : productTitle
          ? `Inquiry: ${productTitle}`
          : safeCategory,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : "",
      phone: phone.trim(),
      whatsapp: whatsapp ? whatsapp.trim() : phone.trim(),
      preferredContact: safePreferred,
      message: message.trim(),
      product: product || null,
      productTitle: productTitle ? productTitle.trim() : "",
      requestedQuantity: Math.max(1, Number(requestedQuantity) || 1),
      budget: budget ? String(budget).trim() : "",
      priority: autoPriority,
      status: "new",
    });

    // Notify store admin and customer via email
    sendInquiryNotificationEmail(inquiry).catch((err) => {
      console.error("Async Inquiry Email Error:", err.message);
    });

    res.status(201).json({
      success: true,
      message:
        "Your message has been received by our store team! Save your ticket ID to track updates.",
      ticketNumber: inquiry.ticketNumber,
      inquiry,
      data: inquiry,
    });
  } catch (error) {
    console.error("Inquiry Submit Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit message",
      error: error.message,
    });
  }
};

// @desc    Public: Check support ticket status & store reply by ticket number
// @route   GET /api/inquiries/ticket/:ticketNumber
// @access  Public
const getTicketStatus = async (req, res) => {
  try {
    const rawTicket = (req.params.ticketNumber || "").trim();

    if (!rawTicket) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Ticket ID (e.g. SUP-20261118-XXXX).",
      });
    }

    const inquiry = await Inquiry.findOne({
      ticketNumber: { $regex: `^${rawTicket.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    }).select(
      "ticketNumber category subject orderNumber productTitle name status priority adminReply repliedAt createdAt updatedAt"
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: `No support ticket found with ID "${rawTicket.toUpperCase()}". Please double-check and try again.`,
      });
    }

    res.status(200).json({
      success: true,
      ticket: inquiry,
      data: inquiry,
    });
  } catch (error) {
    console.error("Ticket Lookup Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to look up ticket status",
    });
  }
};

// @desc    Get all inquiries / customer messages (Admin Dashboard)
// @route   GET /api/inquiries
// @access  Private/Admin
const getAllInquiries = async (req, res) => {
  try {
    const { status, category, search } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: "i" } },
        { orderNumber: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { productTitle: { $regex: search, $options: "i" } },
      ];
    }

    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .populate("product", "title images price");

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries",
    });
  }
};

// @desc    Get single inquiry by ID
// @route   GET /api/inquiries/:id
// @access  Private/Admin
const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate(
      "product",
      "title images price"
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      inquiry,
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiry details",
    });
  }
};

// @desc    Update inquiry status or reply (Admin)
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
const updateInquiry = async (req, res) => {
  try {
    const { status, adminReply, priority } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    if (status) inquiry.status = status;
    if (priority) inquiry.priority = priority;
    if (adminReply !== undefined) {
      inquiry.adminReply = adminReply.trim();
      if (inquiry.adminReply) {
        inquiry.repliedAt = new Date();
        if (!status || status === "new" || status === "read") {
          inquiry.status = "replied";
        }
      }
    }

    await inquiry.save();

    res.status(200).json({
      success: true,
      message: "Inquiry updated successfully",
      inquiry,
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update inquiry",
    });
  }
};

// @desc    Mark inquiry as read
// @route   PATCH /api/inquiries/:id/read
// @access  Private/Admin
const markInquiryRead = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    inquiry.status = "read";
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: "Marked as read",
      inquiry,
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update inquiry",
    });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private/Admin
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete inquiry",
    });
  }
};

module.exports = {
  createInquiry,
  getTicketStatus,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  markInquiryRead,
  deleteInquiry,
};
