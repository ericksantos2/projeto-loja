export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
  tipo: string;
  expiresIn: number;
  refreshExpiresIn: number;
  username: string;
  cargo: string;
};

const ACCESS_TOKEN_KEY = "scout_access_token";
const REFRESH_TOKEN_KEY = "scout_refresh_token";
const USERNAME_KEY = "scout_username";
const ROLE_KEY = "scout_role";
const AUTH_CHANGED_EVENT = "scout:auth-changed";
const AUTH_TOAST_EVENT = "scout:auth-toast";

function isBrowser() {
  return typeof window !== "undefined";
}

export function notifyAuthChanged() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function onAuthChanged(handler: () => void) {
  if (!isBrowser()) return () => {};
  window.addEventListener(AUTH_CHANGED_EVENT, handler);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, handler);
}

export function notifyAuthToast(message: string) {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent<string>(AUTH_TOAST_EVENT, { detail: message }));
}

export function onAuthToast(handler: (message: string) => void) {
  if (!isBrowser()) return () => {};
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<string>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };
  window.addEventListener(AUTH_TOAST_EVENT, listener);
  return () => window.removeEventListener(AUTH_TOAST_EVENT, listener);
}

export function getStoredAccessToken() {
  return isBrowser() ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
}

export function getStoredRefreshToken() {
  return isBrowser() ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
}

export function getStoredUsername() {
  return isBrowser() ? localStorage.getItem(USERNAME_KEY) ?? "" : "";
}

export function getStoredRole() {
  return isBrowser() ? localStorage.getItem(ROLE_KEY) ?? "" : "";
}

export function saveIdentity(username: string, cargo: string) {
  if (!isBrowser()) return;
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(ROLE_KEY, cargo);
}

export function saveSession(payload: AuthTokenResponse) {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
  localStorage.setItem(USERNAME_KEY, payload.username);
  localStorage.setItem(ROLE_KEY, payload.cargo);
  notifyAuthChanged();
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
  notifyAuthChanged();
}
