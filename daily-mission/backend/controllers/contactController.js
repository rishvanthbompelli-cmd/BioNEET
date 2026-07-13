const prisma = require('../utils/prisma');
const { validateEmail, sanitizeString } = require('../utils/validate');
const { sendContactNotification } = require('../services/emailService');

const submitContact = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 100);
    const email = sanitizeString(req.body.email, 200).toLowerCase();
    const subject = req.body.subject ? sanitizeString(req.body.subject, 200) : null;
    const message = sanitizeString(req.body.message, 5000);

    if (!name || !validateEmail(email) || !message) {
      return res.status(400).json({ message: 'Name, valid email, and message are required.' });
    }

    const submission = await prisma.contactSubmission.create({
      data: { name, email, subject, message },
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendContactNotification({
        name,
        email,
        message,
        adminEmail,
        subject: subject || undefined,
      }).catch((e) => console.error('Contact email failed:', e.message));
    }

    res.status(201).json({
      message: "Thanks for reaching out! We'll get back to you soon.",
      id: submission.id,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ message: 'Failed to submit contact form' });
  }
};

module.exports = { submitContact };
