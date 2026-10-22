const prisma = require("../config/prisma");

// GET /api/announcements
const getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    res.json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/announcements/:id
const getAnnouncementById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/announcements (Admin Dashboard: Publish Announcements)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, isPinned, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category ? category.trim() : "General",
        isPinned: isPinned === "true" || isPinned === true,
        author: author ? author.trim() : req.admin ? req.admin.name : "GCECT Art Club Admin",
      },
    });

    res.status(201).json({
      success: true,
      message: "Announcement published successfully",
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/announcements/:id
const updateAnnouncement = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, content, category, isPinned, author } = req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (content !== undefined) data.content = content.trim();
    if (category !== undefined) data.category = category.trim();
    if (isPinned !== undefined) data.isPinned = isPinned === "true" || isPinned === true;
    if (author !== undefined) data.author = author.trim();

    const updated = await prisma.announcement.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: "Announcement updated successfully",
      announcement: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.announcement.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
