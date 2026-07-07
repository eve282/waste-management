const { sendEmail } = require("./emailService");

const statusMessages = {
  pending: "We've received your complaint and it is awaiting review.",
  assigned: "A collection worker has been assigned to your complaint.",
  in_progress: "Your complaint is currently being resolved.",
  resolved: "Your complaint has been resolved. Thank you for helping keep the area clean!",
};

const notifyStatusChange = async (user, complaint) => {
  const subject = `Complaint update: ${complaint.status.replace("_", " ").toUpperCase()}`;
  const html = `
    <p>Hi ${user.name},</p>
    <p>${statusMessages[complaint.status] || "Your complaint status has been updated."}</p>
    <p><b>Category:</b> ${complaint.category}<br/>
    <b>Status:</b> ${complaint.status}</p>
    <p>— Smart Waste Management System</p>
  `;
  await sendEmail({ to: user.email, subject, html });
};

const notifyNewComplaint = async (user, complaint) => {
  const subject = "Complaint submitted successfully";
  const html = `
    <p>Hi ${user.name},</p>
    <p>Your complaint (category: <b>${complaint.category}</b>) has been submitted successfully.
    We'll notify you as its status changes.</p>
    <p>— Smart Waste Management System</p>
  `;
  await sendEmail({ to: user.email, subject, html });
};

module.exports = { notifyStatusChange, notifyNewComplaint };
