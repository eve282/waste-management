const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("phone").notEmpty(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  asyncHandler(register)
);
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  asyncHandler(login)
);
router.get("/me", protect, asyncHandler(getMe));

module.exports = router;
