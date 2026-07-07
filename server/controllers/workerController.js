const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");
const StatusLog = require("../models/StatusLog");
const User = require("../models/User");
const { storeImage } = require("../services/imageService");
const { notifyStatusChange } = require("../services/notificationService");

// @route GET /api/worker/tasks
const getMyTasks = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(404).json({ message: "Worker profile not found" });

    const tasks = await Complaint.find({
      assignedWorkerId: worker._id,
      status: { $in: ["assigned", "in_progress"] },
    })
      .populate("userId", "name phone address")
      .sort({ priority: -1, createdAt: 1 });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/worker/tasks/:id/start
const startTask = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker || !complaint.assignedWorkerId || complaint.assignedWorkerId.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: "This task is not assigned to you" });
    }

    if (complaint.status !== "assigned") {
      return res.status(400).json({ message: "Only assigned tasks can be started" });
    }

    const oldStatus = complaint.status;
    complaint.status = "in_progress";
    await complaint.save();

    await StatusLog.create({
      complaintId: complaint._id,
      oldStatus,
      newStatus: "in_progress",
      changedBy: req.user._id,
    });

    const citizen = await User.findById(complaint.userId);
    if (citizen) notifyStatusChange(citizen, complaint).catch(() => {});

    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/worker/tasks/:id/resolve
const resolveTask = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker || !complaint.assignedWorkerId || complaint.assignedWorkerId.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: "This task is not assigned to you" });
    }

    if (req.file) {
      const result = await storeImage(req.file.buffer, req.file.mimetype, "waste_resolutions");
      complaint.resolvedImageUrl = result.secure_url;
    }

    const oldStatus = complaint.status;
    complaint.status = "resolved";
    complaint.resolvedAt = new Date();
    await complaint.save();

    worker.activeTaskCount = Math.max(0, worker.activeTaskCount - 1);
    await worker.save();

    await StatusLog.create({
      complaintId: complaint._id,
      oldStatus,
      newStatus: "resolved",
      changedBy: req.user._id,
    });

    const citizen = await User.findById(complaint.userId);
    if (citizen) notifyStatusChange(citizen, complaint).catch(() => {});

    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyTasks, startTask, resolveTask };
