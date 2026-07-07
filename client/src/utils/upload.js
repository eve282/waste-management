export const MAX_IMAGE_SIZE_MB = Number(import.meta.env.VITE_MAX_IMAGE_SIZE_MB) || 5;

// Returns a warning message if the file exceeds the configured limit, or "" if it's fine.
export const validateImageSize = (file) => {
  if (!file) return "";
  const maxBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB) - max ${MAX_IMAGE_SIZE_MB}MB.`;
  }
  return "";
};
