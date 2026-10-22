const prisma = require("../config/prisma");

// GET /api/campus-art
const getAllCampusArt = async (req, res, next) => {
  try {
    const artworks = await prisma.campusArt.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: artworks.length,
      artworks,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/campus-art/:id
const getCampusArtById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const artwork = await prisma.campusArt.findUnique({
      where: { id },
    });

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: "Campus art not found",
      });
    }

    res.json({
      success: true,
      artwork,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/campus-art
const createCampusArt = async (req, res, next) => {
  try {
    const { title, location, description, artistCredits, dateCompleted } = req.body;

    if (!title || !location) {
      return res.status(400).json({
        success: false,
        message: "Title and location are required",
      });
    }

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image is required for campus art",
      });
    }

    const newArt = await prisma.campusArt.create({
      data: {
        title: title.trim(),
        location: location.trim(),
        description: description ? description.trim() : null,
        imageUrl,
        artistCredits: artistCredits ? artistCredits.trim() : null,
        dateCompleted: dateCompleted ? dateCompleted.trim() : null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Campus artwork added successfully",
      artwork: newArt,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/campus-art/:id
const updateCampusArt = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, location, description, artistCredits, dateCompleted } = req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (location !== undefined) data.location = location.trim();
    if (description !== undefined) data.description = description;
    if (artistCredits !== undefined) data.artistCredits = artistCredits;
    if (dateCompleted !== undefined) data.dateCompleted = dateCompleted;

    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      data.imageUrl = req.body.imageUrl;
    }

    const updated = await prisma.campusArt.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: "Campus artwork updated successfully",
      artwork: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/campus-art/:id
const deleteCampusArt = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.campusArt.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Campus artwork removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCampusArt,
  getCampusArtById,
  createCampusArt,
  updateCampusArt,
  deleteCampusArt,
};
