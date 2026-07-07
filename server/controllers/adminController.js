const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");
const StatusLog = require("../models/StatusLog");
const User = require("../models/User");
const { notifyStatusChange } = require("../services/notificationService");
const { haversineDistanceKm } = require("../utils/geo");

// @route GET /api/admin/complaints?status=&category=&priority=&area=&nearLat=&nearLng=&radiusKm=
// `area` matches the free-text address field (often blank - citizens aren't required to type one).
// `nearLat`/`nearLng`/`radiusKm` filter by actual distance from a point, which is always available
// since every complaint has a required lat/lng.
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, area, nearLat, nearLng, radiusKm } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (area) filter.address = { $regex: area, $options: "i" };

    let complaints = await Complaint.find(filter)
      .populate("userId", "name email phone")
      .populate("assignedWorkerId", "name phone zoneAssigned")
      .sort({ createdAt: -1 })
      .lean();

    if (nearLat && nearLng && radiusKm) {
      const lat = Number(nearLat);
      const lng = Number(nearLng);
      const radius = Number(radiusKm);
      complaints = complaints
        .map((c) => ({
          ...c,
          distanceKm: haversineDistanceKm(lat, lng, c.location.lat, c.location.lng),
        }))
        .filter((c) => c.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.json(complaints);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/admin/complaints/:id/assign
const assignWorker = async (req, res, next) => {
  try {
    const { workerId } = req.body;
    if (!workerId) return res.status(400).json({ message: "workerId is required" });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    if (!worker.isActive) {
      return res.status(400).json({ message: "This worker is deactivated and cannot be assigned new tasks" });
    }

    const oldStatus = complaint.status;
    complaint.assignedWorkerId = worker._id;
    complaint.status = "assigned";
    await complaint.save();

    worker.activeTaskCount += 1;
    await worker.save();

    await StatusLog.create({
      complaintId: complaint._id,
      oldStatus,
      newStatus: "assigned",
      changedBy: req.user._id,
    });

    const citizen = await User.findById(complaint.userId);
    if (citizen) notifyStatusChange(citizen, complaint).catch(() => {});

    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/admin/complaints/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "assigned", "in_progress", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const oldStatus = complaint.status;
    complaint.status = status;
    if (status === "resolved") complaint.resolvedAt = new Date();
    await complaint.save();

    await StatusLog.create({
      complaintId: complaint._id,
      oldStatus,
      newStatus: status,
      changedBy: req.user._id,
    });

    const citizen = await User.findById(complaint.userId);
    if (citizen) notifyStatusChange(citizen, complaint).catch(() => {});

    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const byStatus = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const byCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const byDate = await Complaint.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const total = await Complaint.countDocuments();
    const resolvedCount = await Complaint.countDocuments({ status: "resolved" });

    res.json({ total, resolvedCount, byStatus, byCategory, byDate });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/workers
const getWorkers = async (req, res, next) => {
  try {
    const workers = await Worker.find().populate("userId", "name email phone");
    res.json(workers);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/admin/workers
const createWorker = async (req, res, next) => {
  try {
    const { name, email, phone, password, zoneAssigned } = req.body;
    if (!name || !email || !phone || !password || !zoneAssigned) {
      return res
        .status(400)
        .json({ message: "name, email, phone, password, zoneAssigned are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, phone, password, role: "worker" });
    const worker = await Worker.create({ userId: user._id, name, phone, zoneAssigned });

    res.status(201).json(worker);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/admin/workers/:id
const updateWorker = async (req, res, next) => {
  try {
    const { name, phone, zoneAssigned, email } = req.body;
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    const user = await User.findById(worker.userId);
    if (!user) return res.status(404).json({ message: "Linked user account not found" });

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already registered" });
      user.email = email;
    }

    if (name) {
      worker.name = name;
      user.name = name;
    }
    if (phone) {
      worker.phone = phone;
      user.phone = phone;
    }
    if (zoneAssigned) worker.zoneAssigned = zoneAssigned;

    await user.save();
    await worker.save();

    res.json(worker);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/admin/workers/:id/status
const setWorkerActive = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive (boolean) is required" });
    }

    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    worker.isActive = isActive;
    await worker.save();

    res.json(worker);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/workers/:id
const deleteWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    // Check live complaint state rather than trusting the activeTaskCount counter,
    // which can drift out of sync (e.g. seeded data never increments it).
    const activeCount = await Complaint.countDocuments({
      assignedWorkerId: worker._id,
      status: { $ne: "resolved" },
    });
    if (activeCount > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete a worker with active tasks - reassign their tasks first" });
    }

    // Leave assignedWorkerId on already-resolved complaints alone - they only reference
    // this worker's now-dangling id, which just populates as null, preserving the
    // original id for any historical/audit lookups instead of erasing it outright.
    await User.findByIdAndDelete(worker.userId);
    await worker.deleteOne();

    res.json({ message: "Worker deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllComplaints,
  assignWorker,
  updateStatus,
  getAnalytics,
  getWorkers,
  createWorker,
  updateWorker,
  setWorkerActive,
  deleteWorker,
};
