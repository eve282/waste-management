const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const logger = require("./utils/logger");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const adminRoutes = require("./routes/adminRoutes");
const workerRoutes = require("./routes/workerRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

morgan.token("body", (req) => {
  if (!req.body || Object.keys(req.body).length === 0) return "";
  const { password, ...safeBody } = req.body;
  return JSON.stringify(safeBody);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body", {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

const parseOrigins = (val) =>
  (val || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const allowedOrigins = new Set([
  ...parseOrigins(process.env.CLIENT_URL),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const isDevLocalOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch (err) {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || isDevLocalOrigin(origin)) {
      return callback(null, true);
    }
    logger.warn("Blocked CORS origin", { origin, allowedOrigins: [...allowedOrigins] });
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  optionsSuccessStatus: 204,
  maxAge: 0,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts, please try again later" },
});
app.use("/api/auth/login", authLimiter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/worker", workerRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
