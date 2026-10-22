const prisma = require("../config/prisma");
const emailService = require("../services/emailService");

// Club information for email templates
const CLUB_INFO = {
  name: "GCECT Art Club - Brush and Bond",
  description: "We are a vibrant community of artists and creatives dedicated to celebrating art in all forms. From traditional paintings to digital art, sculptures to photography, we celebrate diverse artistic expressions. Join us for workshops, exhibitions, collaborations, and events that celebrate creativity and foster artistic growth.",
  instagramUrl: process.env.CLUB_INSTAGRAM_URL || "https://instagram.com/brushandbond",
  contactEmail: process.env.CLUB_EMAIL || "brushandbond@gcect.edu",
};

// POST /api/applications (Public: Join the Club)
const submitApplication = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      department,
      rollNumber,
      academicYear,
      artInterests,
      portfolioUrl,
      whyJoin,
    } = req.body;

    if (!fullName || !email || !phone || !department || !rollNumber || !academicYear || !whyJoin) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled out",
      });
    }

    // Check if application already submitted with this email or rollNumber
    const existing = await prisma.clubApplication.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { rollNumber: rollNumber.trim() },
        ],
        status: "PENDING",
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending application. Please wait for the admin to review it.",
      });
    }

    const application = await prisma.clubApplication.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        department: department.trim(),
        rollNumber: rollNumber.trim(),
        academicYear: academicYear.trim(),
        artInterests: Array.isArray(artInterests) ? artInterests.join(", ") : (artInterests || "General Art"),
        portfolioUrl: portfolioUrl ? portfolioUrl.trim() : null,
        whyJoin: whyJoin.trim(),
        status: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! We will review and reach out to you.",
      application,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications (Admin Dashboard: Manage Applications)
const getAllApplications = async (req, res, next) => {
  try {
    const { status, search, department } = req.query;

    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (department) {
      where.department = { contains: department, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { rollNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const applications = await prisma.clubApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/:id
const getApplicationById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const application = await prisma.clubApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/applications/:id/status (Admin review)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminNotes } = req.body;

    const normalizedStatus = status ? status.toUpperCase() : null;
    if (!["PENDING", "APPROVED", "REJECTED"].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be PENDING, APPROVED, or REJECTED",
      });
    }

    const application = await prisma.clubApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const updated = await prisma.clubApplication.update({
      where: { id },
      data: {
        status: normalizedStatus,
        adminNotes: adminNotes !== undefined ? adminNotes : application.adminNotes,
        reviewedAt: new Date(),
      },
    });

    // If APPROVED, auto-enroll into members table and send approval email
    if (normalizedStatus === "APPROVED") {
      const existingMember = await prisma.members.findUnique({
        where: { email: application.email },
      });

      if (!existingMember) {
        await prisma.members.create({
          data: {
            name: application.fullName,
            email: application.email,
            phone: application.phone,
            department: application.department,
            roll_number: application.rollNumber,
            role: "MEMBER",
          },
        });
      }

      // Send approval email asynchronously
      const emailResult = await emailService.sendApprovalEmail(
        {
          fullName: application.fullName,
          email: application.email,
        },
        CLUB_INFO
      );

      console.log(`📧 Approval email result for ${application.email}:`, emailResult);
    }

    // If REJECTED, send rejection email
    if (normalizedStatus === "REJECTED") {
      const emailResult = await emailService.sendRejectionEmail(
        {
          fullName: application.fullName,
          email: application.email,
        },
        adminNotes || "Thank you for your interest in Brush and Bond.",
        CLUB_INFO
      );

      console.log(`📧 Rejection email result for ${application.email}:`, emailResult);
    }

    res.json({
      success: true,
      message: `Application ${normalizedStatus.toLowerCase()} successfully`,
      application: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/applications/:id
const deleteApplication = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.clubApplication.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
};
