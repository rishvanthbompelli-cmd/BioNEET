const ADMIN_EMAIL = 'bompellirishvanth@gmail.com';

function isAdminEmail(email) {
  return typeof email === 'string' && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

function resolveRole(email) {
  return isAdminEmail(email) ? 'ADMIN' : 'USER';
}

module.exports = { ADMIN_EMAIL, isAdminEmail, resolveRole };
