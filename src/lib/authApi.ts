type LocalAuthUser = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  created_at?: string | null;
  is_verified: boolean;
};

const STORAGE_KEY = 'agrilens_local_user';
const DEFAULT_AVATAR_URL =
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=160';

function readUser(): LocalAuthUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalAuthUser) : null;
  } catch {
    return null;
  }
}

function writeUser(user: LocalAuthUser | null) {
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function makeUser(email: string, fullName?: string): LocalAuthUser {
  const normalizedEmail = email.trim().toLowerCase();
  const fallbackName = normalizedEmail.split('@')[0]?.replace(/[._-]+/g, ' ') || 'Local Farmer';

  return {
    id: 'local-user',
    full_name: fullName?.trim() || fallbackName,
    email: normalizedEmail,
    avatar_url: DEFAULT_AVATAR_URL,
    created_at: new Date().toISOString(),
    is_verified: true,
  };
}

export async function login(email: string, _password: string) {
  const existing = readUser();
  writeUser({ ...makeUser(email, existing?.full_name), avatar_url: existing?.avatar_url ?? DEFAULT_AVATAR_URL });
  return { ok: true };
}

export async function verifyLoginOtp(_email: string, _otpCode: string, _rememberDevice: boolean) {
  return { ok: true };
}

export async function register(fullName: string, email: string, _password: string) {
  writeUser(makeUser(email, fullName));
  return { ok: true };
}

export async function verifyEmail(_email: string, _otpCode: string) {
  return { ok: true };
}

export async function forgotPassword(_email: string) {
  return { ok: true };
}

export async function verifyResetOtp(_email: string, _otpCode: string) {
  return { ok: true };
}

export async function resetPassword(_email: string, _otpCode: string, _newPassword: string) {
  return { ok: true };
}

export async function me() {
  return { ok: true, user: readUser() };
}

export async function logout() {
  writeUser(null);
  return { ok: true };
}

export async function updateProfile(payload: { full_name?: string; avatar_url?: string | null }) {
  const current = readUser() ?? makeUser('farmer@agrilens.local');
  const next = {
    ...current,
    full_name: payload.full_name?.trim() || current.full_name,
    avatar_url: payload.avatar_url === undefined ? current.avatar_url : payload.avatar_url,
  };
  writeUser(next);
  return { ok: true, user: next };
}

export async function sendResetOtp(email: string) {
  return forgotPassword(email);
}

export async function resetPasswordWithOtp(email: string, otpCode: string, newPassword: string) {
  return resetPassword(email, otpCode, newPassword);
}
