const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

function validateName(name) {
  return typeof name === 'string' && name.trim().length >= 2 && name.length <= 100;
}

function sanitizeString(str, maxLen = 5000) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

function validateSubject(subject) {
  return ['Botany', 'Zoology', 'Physics', 'Chemistry', 'All'].includes(subject);
}

function validateRevisionStatus(status) {
  return ['NOT_STARTED', 'IN_PROGRESS', 'REVISED', 'MASTERED'].includes(status);
}

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  sanitizeString,
  validateSubject,
  validateRevisionStatus,
};
