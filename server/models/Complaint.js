const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["garbage_overflow", "missed_pickup", "illegal_dumping", "other"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "resolved"],
      default: "pending",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
    assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", default: null },
    resolvedImageUrl: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
