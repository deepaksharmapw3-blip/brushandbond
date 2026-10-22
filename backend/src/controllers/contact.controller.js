const prisma = require("../config/prisma");

// POST /api/contact (Public: Contact Us form)
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required",
      });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Thank you for reaching out! We have received your message.",
      contact,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/contact (Admin)
const getAllContactMessages = async (req, res, next) => {
  try {
    const { isRead } = req.query;

    const where = {};
    if (isRead !== undefined) {
      where.isRead = isRead === "true" || isRead === true;
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/contact/:id/read (Admin)
const markMessageAsRead = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: "Message marked as read",
      contact: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/contact/:id (Admin)
const deleteContactMessage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.contactMessage.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  markMessageAsRead,
  deleteContactMessage,
};
