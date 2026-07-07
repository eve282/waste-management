const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBufferToCloudinary = (buffer, folder = "waste_complaints") => {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settleResolve = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const settleReject = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return settleReject(error);
        settleResolve(result);
      }
    );
    // upload_stream can fail at the transport layer (e.g. bad credentials) and
    // emit 'error' on the stream itself instead of invoking the callback above -
    // without this listener, that 'error' event is unhandled and crashes the process.
    stream.on("error", settleReject);
    stream.end(buffer);
  });
};

module.exports = { cloudinary, uploadBufferToCloudinary };
