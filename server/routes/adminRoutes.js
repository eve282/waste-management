const express = require("express");
const {
  getAllComplaints,
  assignWorker,
  updateStatus,
  getAnalytics,
  getWorkers,
  createWorker,
  updateWorker,
  setWorkerActive,
  deleteWorker,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/complaints", asyncHandler(getAllComplaints));
router.patch("/complaints/:id/assign", asyncHandler(assignWorker));
router.post("/complaints/:id/assign", asyncHandler(assignWorker));
router.patch("/complaints/:id/status", asyncHandler(updateStatus));
router.post("/complaints/:id/status", asyncHandler(updateStatus));
router.get("/analytics", asyncHandler(getAnalytics));
router.get("/workers", asyncHandler(getWorkers));
router.post("/workers", asyncHandler(createWorker));
router.patch("/workers/:id", asyncHandler(updateWorker));
router.post("/workers/:id", asyncHandler(updateWorker));
router.patch("/workers/:id/status", asyncHandler(setWorkerActive));
router.post("/workers/:id/status", asyncHandler(setWorkerActive));
router.delete("/workers/:id", asyncHandler(deleteWorker));

module.exports = router;
