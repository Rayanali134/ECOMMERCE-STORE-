const Message = require("../models/Message");

// ==========================================
// PUBLIC: CREATE MESSAGE
// ==========================================
exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message, phone, company } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject and message are required.",
      });
    }

    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      phone: phone ? phone.trim() : "",
      company: company ? company.trim() : "",
      status: "unread",
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Create message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit message.",
    });
  }
};

// ==========================================
// ADMIN: GET ALL MESSAGES + FILTERING
// ==========================================
exports.getMessages = async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {};

    if (status && status !== "all") {
      const allowedStatuses = [
        "unread",
        "read",
        "replied",
        "archived",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid message status.",
        });
      }

      where.status = status;
    }

    if (search) {
      const { Op } = require("sequelize");

      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
      ];
    }

    const messages = await Message.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
};

// ==========================================
// ADMIN: GET SINGLE MESSAGE
// ==========================================
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Get message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch message.",
    });
  }
};

// ==========================================
// ADMIN: UPDATE MESSAGE
// ==========================================
exports.updateMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const allowedFields = [
      "name",
      "email",
      "subject",
      "message",
      "status",
      "adminNotes",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.status !== undefined &&
      !["unread", "read", "replied", "archived"].includes(
        updates.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid message status.",
      });
    }

    if (updates.status === "read" && !message.readAt) {
      updates.readAt = new Date();
    } else if (updates.status === "replied" && !message.repliedAt) {
      updates.repliedAt = new Date();
    }

    await message.update(updates);

    return res.status(200).json({
      success: true,
      message: "Message updated successfully.",
      data: message,
    });
  } catch (error) {
    console.error("Update message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update message.",
    });
  }
};

// ==========================================
// ADMIN: MARK MESSAGE AS READ
// ==========================================
exports.markMessageRead = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    message.status = "read";
    message.readAt = new Date();
    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
      data: message,
    });
  } catch (error) {
    console.error("Mark read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark message as read.",
    });
  }
};

// ==========================================
// ADMIN: DELETE MESSAGE
// ==========================================
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    await message.destroy();

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete message.",
    });
  }
};
