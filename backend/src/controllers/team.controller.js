const prisma = require("../config/prisma");

// GET /api/team
const getTeamMembers = async (req, res, next) => {
  try {
    const team = await prisma.teamMember.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    res.json({
      success: true,
      count: team.length,
      team,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/team
const createTeamMember = async (req, res, next) => {
  try {
    const {
      name,
      role,
      department,
      year,
      tier,
      bio,
      quote,
      specialty,
      responsibilities,
      instagramUrl,
      linkedinUrl,
      displayOrder,
      isLead,
    } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: "Name and role are required",
      });
    }

    let avatarUrl = req.body.avatarUrl;
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    let respStr = null;
    if (responsibilities) {
      respStr = Array.isArray(responsibilities)
        ? responsibilities.join(", ")
        : responsibilities.toString().trim();
    }

    const member = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        department: department ? department.trim() : null,
        year: year ? year.trim() : null,
        tier: tier ? tier.trim().toLowerCase() : "executive",
        bio: bio ? bio.trim() : null,
        quote: quote ? quote.trim() : null,
        specialty: specialty ? specialty.trim() : null,
        responsibilities: respStr,
        avatarUrl: avatarUrl || null,
        instagramUrl: instagramUrl ? instagramUrl.trim() : null,
        linkedinUrl: linkedinUrl ? linkedinUrl.trim() : null,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
        isLead: isLead === "true" || isLead === true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Team member added successfully",
      member,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/team/:id
const updateTeamMember = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      name,
      role,
      department,
      year,
      tier,
      bio,
      quote,
      specialty,
      responsibilities,
      instagramUrl,
      linkedinUrl,
      displayOrder,
      isLead,
    } = req.body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (role !== undefined) data.role = role.trim();
    if (department !== undefined) data.department = department ? department.trim() : null;
    if (year !== undefined) data.year = year ? year.trim() : null;
    if (tier !== undefined) data.tier = tier ? tier.trim().toLowerCase() : "executive";
    if (bio !== undefined) data.bio = bio ? bio.trim() : null;
    if (quote !== undefined) data.quote = quote ? quote.trim() : null;
    if (specialty !== undefined) data.specialty = specialty ? specialty.trim() : null;
    if (responsibilities !== undefined) {
      data.responsibilities = Array.isArray(responsibilities)
        ? responsibilities.join(", ")
        : responsibilities ? responsibilities.toString().trim() : null;
    }
    if (instagramUrl !== undefined) data.instagramUrl = instagramUrl ? instagramUrl.trim() : null;
    if (linkedinUrl !== undefined) data.linkedinUrl = linkedinUrl ? linkedinUrl.trim() : null;
    if (displayOrder !== undefined) data.displayOrder = parseInt(displayOrder, 10);
    if (isLead !== undefined) data.isLead = isLead === "true" || isLead === true;

    if (req.file) {
      data.avatarUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.avatarUrl !== undefined) {
      data.avatarUrl = req.body.avatarUrl;
    }

    const updated = await prisma.teamMember.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: "Team member updated successfully",
      member: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/team/:id
const deleteTeamMember = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.teamMember.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
