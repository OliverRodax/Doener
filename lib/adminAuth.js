// Set ADMIN_PASSWORD in the server's environment (e.g. a .env.local file,
// which is gitignored — never commit the real password to source control).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function isValidAdminPassword(password) {
  if (!ADMIN_PASSWORD) return false;
  return typeof password === 'string' && password === ADMIN_PASSWORD;
}
