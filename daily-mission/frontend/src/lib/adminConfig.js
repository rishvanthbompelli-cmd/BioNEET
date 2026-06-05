export const ADMIN_EMAIL = 'bompellirishvanth@gmail.com';

export function isAdminEmail(email) {
  return typeof email === 'string' && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function withAdminFlag(user) {
  if (!user) return null;
  return { ...user, isAdmin: isAdminEmail(user.email) };
}
