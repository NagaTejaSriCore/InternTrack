const mongoose = require('mongoose');
const Application = require('../models/Application');

// Valid status values
const VALID_STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

// @desc    Get all applications for the logged in user
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    // Base query scoped to the authenticated user
    const query = { user: req.user._id };

    // Filter by status if provided
    if (status && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

    // Search by company or role (case-insensitive regex)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { company: { $regex: searchRegex } },
        { role: { $regex: searchRegex } }
      ];
    }

    // Retrieve applications sorted by most recent date applied
    const applications = await Application.find(query).sort({ dateApplied: -1, createdAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res, next) => {
  try {
    const { company, role, status, dateApplied, link, notes } = req.body;

    // Validate required fields
    if (!company || !company.trim()) {
      return res.status(400).json({ message: 'Company name is required' });
    }
    if (!role || !role.trim()) {
      return res.status(400).json({ message: 'Role/Position is required' });
    }

    // Validate status if passed
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const application = await Application.create({
      user: req.user._id,
      company: company.trim(),
      role: role.trim(),
      status: status || 'Applied',
      dateApplied: dateApplied ? new Date(dateApplied) : Date.now(),
      link: link ? link.trim() : '',
      notes: notes ? notes.trim() : ''
    });

    return res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Find application owned by this user
    const application = await Application.findOne({ _id: id, user: req.user._id });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { company, role, status, dateApplied, link, notes } = req.body;

    if (company !== undefined) {
      if (!company.trim()) {
        return res.status(400).json({ message: 'Company name cannot be empty' });
      }
      application.company = company.trim();
    }

    if (role !== undefined) {
      if (!role.trim()) {
        return res.status(400).json({ message: 'Role cannot be empty' });
      }
      application.role = role.trim();
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      application.status = status;
    }

    if (dateApplied !== undefined) {
      application.dateApplied = new Date(dateApplied);
    }

    if (link !== undefined) {
      application.link = link.trim();
    }

    if (notes !== undefined) {
      application.notes = notes.trim();
    }

    const updatedApplication = await application.save();

    return res.status(200).json(updatedApplication);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = await Application.findOneAndDelete({ _id: id, user: req.user._id });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    return res.status(200).json({ message: 'Application removed successfully', id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application counts grouped by status
// @route   GET /api/applications/stats
// @access  Private
const getApplicationStats = async (req, res, next) => {
  try {
    const statsAgg = await Application.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Initialize default stats structure
    const stats = {
      total: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0
    };

    statsAgg.forEach((item) => {
      if (stats[item._id] !== undefined) {
        stats[item._id] = item.count;
      }
      stats.total += item.count;
    });

    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats
};
