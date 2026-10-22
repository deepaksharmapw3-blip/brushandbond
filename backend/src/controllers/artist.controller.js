const prisma = require("../config/prisma");

// GET /api/artists
const getAllArtists = async (req, res, next) => {
  try {
    const { spotlight, search } = req.query;

    const where = {};
    if (spotlight !== undefined) {
      where.isSpotlight = spotlight === "true" || spotlight === true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }

    const artists = await prisma.artist.findMany({
      where,
      include: {
        _count: {
          select: { artworks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: artists.length,
      artists,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/artists/spotlight (Public: Artist Spotlight section)
const getSpotlightArtists = async (req, res, next) => {
  try {
    const artists = await prisma.artist.findMany({
      where: { isSpotlight: true },
      include: {
        artworks: {
          take: 4,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json({
      success: true,
      artists,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/artists/:id
const getArtistById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        artworks: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found",
      });
    }

    res.json({
      success: true,
      artist,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/artists (Admin Dashboard: Manage Artists)
const createArtist = async (req, res, next) => {
  try {
    const { name, department, year, bio, instagram, linkedin, portfolioUrl, isSpotlight } =
      req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Artist name is required",
      });
    }

    let avatarUrl = req.body.avatarUrl;
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    const newArtist = await prisma.artist.create({
      data: {
        name: name.trim(),
        department: department ? department.trim() : null,
        year: year ? year.trim() : null,
        bio: bio ? bio.trim() : null,
        avatarUrl: avatarUrl || null,
        instagram: instagram ? instagram.trim() : null,
        linkedin: linkedin ? linkedin.trim() : null,
        portfolioUrl: portfolioUrl ? portfolioUrl.trim() : null,
        isSpotlight: isSpotlight === "true" || isSpotlight === true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Artist added successfully",
      artist: newArtist,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/artists/:id
const updateArtist = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, department, year, bio, instagram, linkedin, portfolioUrl, isSpotlight } =
      req.body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (department !== undefined) data.department = department ? department.trim() : null;
    if (year !== undefined) data.year = year ? year.trim() : null;
    if (bio !== undefined) data.bio = bio ? bio.trim() : null;
    if (instagram !== undefined) data.instagram = instagram ? instagram.trim() : null;
    if (linkedin !== undefined) data.linkedin = linkedin ? linkedin.trim() : null;
    if (portfolioUrl !== undefined) data.portfolioUrl = portfolioUrl ? portfolioUrl.trim() : null;
    if (isSpotlight !== undefined) data.isSpotlight = isSpotlight === "true" || isSpotlight === true;

    if (req.file) {
      data.avatarUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.avatarUrl) {
      data.avatarUrl = req.body.avatarUrl;
    }

    const updated = await prisma.artist.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: "Artist updated successfully",
      artist: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/artists/:id
const deleteArtist = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.artist.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Artist deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllArtists,
  getSpotlightArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
};
