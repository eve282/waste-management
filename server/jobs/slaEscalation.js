const cron = require("node-cron");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const logger = require("../utils/logger");

const startSlaEscalationJob = () => {
  // Runs every day at 9:00 AM server time
  cron.schedule("0 9 * * *", async () => {
    try {
      const slaHours = Number(process.env.SLA_HOURS) || 48;
      const cutoff = new Date(Date.now() - slaHours * 60 * 60 * 1000);

      const overdue = await Complaint.find({
        status: { $ne: "resolved" },
        createdAt: { $lt: cutoff },
        priority: { $ne: "high" },
      });

      if (overdue.length === 0) return;

      const ids = overdue.map((c) => c._id);
      await Complaint.updateMany({ _id: { $in: ids } }, { $set: { priority: "high" } });

      const admins = await User.find({ role: "admin" });
      const html = `
        <p>${overdue.length} complaint(s) have exceeded the ${slaHours}-hour SLA and were escalated to high priority.</p>
        <ul>${overdue.map((c) => `<li>${c.category} — id: ${c._id}</li>`).join("")}</ul>
      `;
      for (const admin of admins) {
        await sendEmail({ to: admin.email, subject: "SLA escalation digest", html });
      }
      logger.info(`SLA job: escalated ${overdue.length} complaint(s)`);
    } catch (err) {
      logger.error("SLA escalation job failed", { message: err.message, stack: err.stack });
    }
  });
};

module.exports = startSlaEscalationJob;
