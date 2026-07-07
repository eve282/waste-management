const Complaint = require("../models/Complaint");
const StatusLog = require("../models/StatusLog");
const { storeImage } = require("../services/imageService");
const { notifyNewComplaint } = require("../services/notificationService");

// @route POST /api/complaints
const createComplaint = async (req, res, next) => {
  try {
    const { category, description, lat, lng, address } = req.body;

    if (!category || !description || !lat || !lng) {
      return res.status(400).json({ message: "category, description, lat, lng are required" });
    }

    let imageUrl;
    if (req.file) {
      const result = await storeImage(req.file.buffer, req.file.mimetype, "waste_complaints");
      imageUrl = result.secure_url;
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      category,
      description,
      imageUrl,
      address,
      location: { lat: Number(lat), lng: Number(lng) },
    });

    await StatusLog.create({
      complaintId: complaint._id,
      newStatus: "pending",
      changedBy: req.user._id,
    });

    notifyNewComplaint(req.user, complaint).catch(() => {});

    res.status(201).json(complaint);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/complaints/my
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/complaints/:id
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("assignedWorkerId", "name phone");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Citizens may only view their own complaint
    if (req.user.role === "citizen" && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this complaint" });
    }

    const logs = await StatusLog.find({ complaintId: complaint._id }).sort({ createdAt: 1 });
    res.json({ complaint, logs });
  } catch (err) {
    next(err);
  }
};

module.exports = { createComplaint, getMyComplaints, getComplaintById };
