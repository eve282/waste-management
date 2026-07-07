require("dotenv").config();
const logger = require("./utils/logger");

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    message: reason?.message || String(reason),
    stack: reason?.stack,
  });
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { message: err.message, stack: err.stack });
  process.exit(1);
});

const app = require("./app");
const connectDB = require("./config/db");
const startSlaEscalationJob = require("./jobs/slaEscalation");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      startSlaEscalationJob();
    });

    server.on("error", (err) => {
      logger.error("HTTP server error", { message: err.message, stack: err.stack });
      process.exit(1);
    });
  })
  .catch((err) => {
    logger.error("Fatal startup error", { message: err.message, stack: err.stack });
    process.exit(1);
  });
