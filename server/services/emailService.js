const { getGmailClient } = require("../config/gmail");
const logger = require("../utils/logger");

// Builds a base64url-encoded raw RFC 2822 message, required by Gmail API
const buildRawMessage = ({ to, subject, html }) => {
  const from = process.env.GMAIL_SENDER_EMAIL;
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    html,
  ];
  const message = messageParts.join("\n");
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.EMAIL_ENABLED === "false") {
    logger.info("Email skipped (EMAIL_ENABLED=false)", { to, subject });
    return;
  }

  try {
    const gmail = getGmailClient();
    const raw = buildRawMessage({ to, subject, html });
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
  } catch (err) {
    // Don't crash the request flow if email fails - just log it
    logger.error("Email send failed", { to, subject, message: err.message, stack: err.stack });
  }
};

module.exports = { sendEmail };
