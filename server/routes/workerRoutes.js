const express = require("express");
const { getMyTasks, startTask, resolveTask } = require("../controllers/workerController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect, authorize("worker"));

router.get("/tasks", asyncHandler(getMyTasks));
router.patch("/tasks/:id/start", asyncHandler(startTask));
router.patch("/tasks/:id/resolve", upload.single("image"), asyncHandler(resolveTask));

module.exports = router;
