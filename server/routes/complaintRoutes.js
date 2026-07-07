const express = require("express");
const { createComplaint, getMyComplaints, getComplaintById } = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.post("/", protect, upload.single("image"), asyncHandler(createComplaint));
router.get("/my", protect, asyncHandler(getMyComplaints));
router.get("/:id", protect, asyncHandler(getComplaintById));

module.exports = router;
