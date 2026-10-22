const prisma = require("../config/prisma");

// GET /api/achievements
const getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { awardDate: "desc" },
    });

    res.json({
      success: true,
      count: achievements.length,
      achievements,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/achievements/:id
const getAchievementById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const achievement = await prisma.achievement.findUnique({
      where: { id },
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    res.json({
      success: true,
      achievement,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/achievements
const createAchievement = async (req, res, next) => {
  try {
    const { title, recipientName, competitionName, awardTitle, description, awardDate } = req.body;

    if (!title || !recipientName || !competitionName || !awardTitle) {
      return res.status(400).json({
        success: false,
        message: "Title, recipient name, competition name, and award title are required",
      });
    }

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newAchievement = await prisma.achievement.create({
      data: {
        title: title.trim(),
        recipientName: recipientName.trim(),
        competitionName: competitionName.trim(),
        awardTitle: awardTitle.trim(),
        description: description ? description.trim() : null,
        awardDate: awardDate ? new Date(awardDate) : null,
        imageUrl: imageUrl || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Achievement added successfully",
      achievement: newAchievement,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/achievements/:id
const updateAchievement = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, recipientName, competitionName, awardTitle, description, awardDate } = req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (recipientName !== undefined) data.recipientName = recipientName.trim();
    if (competitionName !== undefined) data.competitionName = competitionName.trim();
    if (awardTitle !== undefined) data.awardTitle = awardTitle.trim();
    if (description !== undefined) data.description = description;
    if (awardDate !== undefined) data.awardDate = awardDate ? new Date(awardDate) : null;

    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      data.imageUrl = req.body.imageUrl;
    }

    const updated = await prisma.achievement.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: "Achievement updated successfully",
      achievement: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/achievements/:id
const deleteAchievement = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.achievement.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Achievement deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
