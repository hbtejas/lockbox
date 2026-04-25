async function sendEmailNotification({ to, subject, text }) {
  return {
    channel: 'email',
    delivered: true,
    to,
    subject,
    text,
  }
}

async function sendWhatsAppNotification({ to, text }) {
  return {
    channel: 'whatsapp',
    delivered: false,
    to,
    text,
    reason: 'WhatsApp Business API credentials not configured',
  }
}

module.exports = {
  sendEmailNotification,
  sendWhatsAppNotification,
}
