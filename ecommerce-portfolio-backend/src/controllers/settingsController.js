const StoreSettings = require("../models/StoreSettings");

// @desc    Get store settings & policies (Return Policy, Shipping, FAQs, WhatsApp)
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();

    // If no settings exist yet, create default settings
    if (!settings) {
      settings = await StoreSettings.create({
        storeName: "EcoStore",
        storeTagline: "Premium Online Store & Reliable Deliveries",
        contactEmail: "rayanali0560@gmail.com",
        contactPhone: "+92 321 3633473",
        whatsappNumber: "+92 321 3633473",
        faqs: [
          {
            question: "How can I place an order?",
            answer:
              "You can simply add products to your cart and proceed to checkout, or click 'Order via WhatsApp / Message' on any product to chat with us directly.",
            category: "Ordering",
          },
          {
            question: "What is your return policy?",
            answer:
              "We offer an easy 7-day return and exchange policy. If your item is damaged or not as expected, contact us within 7 days of delivery for a replacement or full refund.",
            category: "Returns",
          },
          {
            question: "Do you offer Cash on Delivery (COD)?",
            answer:
              "Yes! We offer nationwide Cash on Delivery (COD). You only pay when you inspect and receive your package.",
            category: "Payments",
          },
          {
            question: "How long does shipping take?",
            answer:
              "Standard nationwide delivery takes 2 to 4 business days. You will receive tracking updates directly on WhatsApp.",
            category: "Shipping",
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      settings,
      data: settings,
    });
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store settings and policies",
    });
  }
};

// @desc    Update store settings & return policy (Admin Dashboard)
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = await StoreSettings.create(req.body);
    } else {
      settings = await StoreSettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      message: "Store settings & return policy updated successfully",
      settings,
      data: settings,
    });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update store settings",
      error: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
