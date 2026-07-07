const { uploadBufferToCloudinary } = require("../config/cloudinary");

// Stores an uploaded image either in Cloudinary (default) or as a base64 data URI
// directly in MongoDB (IMAGE_STORAGE=db), e.g. for local dev without Cloudinary
// credentials. Either path returns the same { secure_url } shape so callers never
// need to know which storage backend is active.
const storeImage = async (buffer, mimetype, folder = "waste_complaints") => {
  if (process.env.IMAGE_STORAGE === "db") {
    const base64 = buffer.toString("base64");
    return { secure_url: `data:${mimetype};base64,${base64}` };
  }
  return uploadBufferToCloudinary(buffer, folder);
};

module.exports = { storeImage };
