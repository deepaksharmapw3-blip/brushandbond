const prisma = require("../config/prisma");

const CATEGORY_MAP = {
  sketches: "SKETCHES",
  paintings: "PAINTINGS",
  digital_art: "DIGITAL_ART",
  "digital-art": "DIGITAL_ART",
  photography: "PHOTOGRAPHY",
  SKETCHES: "SKETCHES",
  PAINTINGS: "PAINTINGS",
  DIGITAL_ART: "DIGITAL_ART",
  PHOTOGRAPHY: "PHOTOGRAPHY",
};

// GET /api/artworks
const getAllArtworks = async (req, res, next) => {
  try {
    const { category, search, featured, artistId, page = 1, limit = 20 } = req.query;

    const where = {};

    if (category) {
      const normalizedCat = CATEGORY_MAP[category];
      if (normalizedCat) {
        where.category = normalizedCat;
      }
    }

    if (featured !== undefined) {
      where.featured = featured === "true" || featured === true;
    }

    if (artistId) {
      where.artistId = parseInt(artistId, 10);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, artworks] = await Promise.all([
      prisma.artwork.count({ where }),
      prisma.artwork.findMany({
        where,
        include: {
          artist: {
            select: {
              id: true,
              name: true,
              department: true,
              year: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take),
      artworks,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/artworks/categories
const getCategoryCounts = async (req, res, next) => {
  try {
    const [sketches, paintings, digitalArt, photography] = await Promise.all([
      prisma.artwork.count({ where: { category: "SKETCHES" } }),
      prisma.artwork.count({ where: { category: "PAINTINGS" } }),
      prisma.artwork.count({ where: { category: "DIGITAL_ART" } }),
      prisma.artwork.count({ where: { category: "PHOTOGRAPHY" } }),
    ]);

    res.json({
      success: true,
      counts: {
        sketches,
        paintings,
        digitalArt,
        photography,
        total: sketches + paintings + digitalArt + photography,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/artworks/featured
const getFeaturedArtworks = async (req, res, next) => {
  try {
    const artworks = await prisma.artwork.findMany({
      where: { featured: true },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            department: true,
            year: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    res.json({
      success: true,
      artworks,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/artworks/:id
const getArtworkById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: {
        artist: true,
      },
    });

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: "Artwork not found",
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

// POST /api/artworks (Admin Dashboard: Upload Artwork)
const createArtwork = async (req, res, next) => {
  try {
    const { title, category, description, tags, featured, artistId } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "Title and category are required",
      });
    }

    const normalizedCat = CATEGORY_MAP[category] || category.toUpperCase();
    if (!["SKETCHES", "PAINTINGS", "DIGITAL_ART", "PHOTOGRAPHY"].includes(normalizedCat)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Must be SKETCHES, PAINTINGS, DIGITAL_ART, or PHOTOGRAPHY",
      });
    }

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image is required (either upload a file or provide imageUrl)",
      });
    }

    const newArtwork = await prisma.artwork.create({
      data: {
        title: title.trim(),
        category: normalizedCat,
        description: description ? description.trim() : null,
        imageUrl,
        tags: tags ? tags.trim() : null,
        featured: featured === "true" || featured === true,
        artistId: artistId ? parseInt(artistId, 10) : null,
      },
      include: {
        artist: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Artwork created successfully",
      artwork: newArtwork,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/artworks/:id
const updateArtwork = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, category, description, tags, featured, artistId } = req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (tags !== undefined) data.tags = tags ? tags.trim() : null;
    if (featured !== undefined) data.featured = featured === "true" || featured === true;
    if (artistId !== undefined) data.artistId = artistId ? parseInt(artistId, 10) : null;

    if (category) {
      const normalizedCat = CATEGORY_MAP[category] || category.toUpperCase();
      if (["SKETCHES", "PAINTINGS", "DIGITAL_ART", "PHOTOGRAPHY"].includes(normalizedCat)) {
        data.category = normalizedCat;
      }
    }

    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      data.imageUrl = req.body.imageUrl;
    }

    const updated = await prisma.artwork.update({
      where: { id },
      data,
      include: {
        artist: true,
      },
    });

    res.json({
      success: true,
      message: "Artwork updated successfully",
      artwork: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/artworks/:id
const deleteArtwork = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.artwork.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Artwork deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/artworks/:id/like
const likeArtwork = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await prisma.artwork.update({
      where: { id },
      data: {
        likes: { increment: 1 },
      },
    });

    res.json({
      success: true,
      message: "Artwork liked",
      likes: updated.likes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllArtworks,
  getCategoryCounts,
  getFeaturedArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  likeArtwork,
};
