const prisma = require("../config/prisma");

// GET /api/events
const getAllEvents = async (req, res, next) => {
  try {
    const { type, is_past } = req.query;
    const now = new Date();

    const where = {};

    if (type === "upcoming" || is_past === "false") {
      where.OR = [
        { is_past: false },
        { event_date: { gte: now } },
      ];
    } else if (type === "past" || is_past === "true") {
      where.OR = [
        { is_past: true },
        { event_date: { lt: now } },
      ];
    }

    const events = await prisma.events.findMany({
      where,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { event_date: type === "past" ? "desc" : "asc" },
    });

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/upcoming
const getUpcomingEvents = async (req, res, next) => {
  try {
    const now = new Date();
    const events = await prisma.events.findMany({
      where: {
        OR: [
          { is_past: false },
          { event_date: { gte: now } },
        ],
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { event_date: "asc" },
    });

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/past
const getPastEvents = async (req, res, next) => {
  try {
    const now = new Date();
    const events = await prisma.events.findMany({
      where: {
        OR: [
          { is_past: true },
          { event_date: { lt: now } },
        ],
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { event_date: "desc" },
    });

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
const getEventById = async (req, res, next) => {
  try {
    const event_id = parseInt(req.params.id, 10);
    const event = await prisma.events.findUnique({
      where: { event_id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/events (Admin Dashboard: Manage Events)
const createEvent = async (req, res, next) => {
  try {
    const {
      event_name,
      event_date,
      event_time,
      venue,
      description,
      category,
      max_capacity,
      registration_deadline,
      is_past,
    } = req.body;

    if (!event_name) {
      return res.status(400).json({
        success: false,
        message: "Event name is required",
      });
    }

    let banner_url = req.body.banner_url;
    if (req.file) {
      banner_url = `/uploads/${req.file.filename}`;
    }

    const newEvent = await prisma.events.create({
      data: {
        event_name: event_name.trim(),
        event_date: event_date ? new Date(event_date) : null,
        event_time: event_time ? event_time.trim() : null,
        venue: venue ? venue.trim() : "GCECT Campus",
        description: description ? description.trim() : null,
        banner_url: banner_url || null,
        category: category || "Workshop",
        is_past: is_past === "true" || is_past === true,
        max_capacity: max_capacity ? parseInt(max_capacity, 10) : 100,
        registration_deadline: registration_deadline ? new Date(registration_deadline) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res, next) => {
  try {
    const event_id = parseInt(req.params.id, 10);
    const {
      event_name,
      event_date,
      event_time,
      venue,
      description,
      category,
      max_capacity,
      registration_deadline,
      is_past,
    } = req.body;

    const data = {};
    if (event_name !== undefined) data.event_name = event_name.trim();
    if (event_date !== undefined) data.event_date = event_date ? new Date(event_date) : null;
    if (event_time !== undefined) data.event_time = event_time;
    if (venue !== undefined) data.venue = venue;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (max_capacity !== undefined) data.max_capacity = parseInt(max_capacity, 10);
    if (registration_deadline !== undefined)
      data.registration_deadline = registration_deadline ? new Date(registration_deadline) : null;
    if (is_past !== undefined) data.is_past = is_past === "true" || is_past === true;

    if (req.file) {
      data.banner_url = `/uploads/${req.file.filename}`;
    } else if (req.body.banner_url) {
      data.banner_url = req.body.banner_url;
    }

    const updated = await prisma.events.update({
      where: { event_id },
      data,
    });

    res.json({
      success: true,
      message: "Event updated successfully",
      event: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const event_id = parseInt(req.params.id, 10);
    await prisma.events.delete({
      where: { event_id },
    });

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/events/:id/register (RSVP / Registration)
const registerForEvent = async (req, res, next) => {
  try {
    const event_id = parseInt(req.params.id, 10);
    const { member_id, applicant_name, applicant_email, applicant_phone, department } = req.body;

    // Check if event exists
    const event = await prisma.events.findUnique({
      where: { event_id },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.is_past) {
      return res.status(400).json({
        success: false,
        message: "Cannot register for a past event",
      });
    }

    if (event.max_capacity && event._count.registrations >= event.max_capacity) {
      return res.status(400).json({
        success: false,
        message: "Event registration is full",
      });
    }

    let mid = member_id ? parseInt(member_id, 10) : null;

    // If email provided and member_id not provided, check if member exists
    if (!mid && applicant_email) {
      const existingMember = await prisma.members.findUnique({
        where: { email: applicant_email.toLowerCase().trim() },
      });
      if (existingMember) {
        mid = existingMember.member_id;
      }
    }

    // Check if duplicate registration
    if (mid) {
      const existingReg = await prisma.registrations.findUnique({
        where: {
          member_id_event_id: {
            member_id: mid,
            event_id,
          },
        },
      });

      if (existingReg) {
        return res.status(400).json({
          success: false,
          message: "You are already registered for this event",
        });
      }
    }

    const registration = await prisma.registrations.create({
      data: {
        event_id,
        member_id: mid,
        applicant_name: applicant_name || (mid ? null : "Anonymous"),
        applicant_email: applicant_email ? applicant_email.toLowerCase().trim() : null,
        applicant_phone: applicant_phone || null,
        department: department || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Successfully registered for the event!",
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id/registrations (Admin view)
const getEventRegistrations = async (req, res, next) => {
  try {
    const event_id = parseInt(req.params.id, 10);
    const registrations = await prisma.registrations.findMany({
      where: { event_id },
      include: {
        members: true,
      },
      orderBy: { registered_at: "desc" },
    });

    res.json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getUpcomingEvents,
  getPastEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventRegistrations,
};
