const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error("Only JPEG, PNG, or WEBP images are allowed");
    err.statusCode = 400;
    cb(err, false);
  }
};

const maxFileSizeMb = Number(process.env.MAX_IMAGE_SIZE_MB) || 5;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
});

module.exports = upload;
