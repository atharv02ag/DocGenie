import { googleLogout } from "@react-oauth/google";

export const getToken = () => localStorage.getItem("session");

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem("session", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  googleLogout();
  localStorage.removeItem("session");
  localStorage.removeItem("user");
}
