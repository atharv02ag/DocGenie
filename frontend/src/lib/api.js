import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearSession } from "./session";

export const serverURL = import.meta.env.VITE_SERVER_PATH;

export class ApiError extends Error {
  constructor(message, status, reauth) {
    super(message);
    this.status = status;
    this.reauth = reauth;
  }
}

// fetch wrapper: adds the session header and turns non-2xx responses into ApiError.
// The backend replies with JSON ({error, action}) from the auth middleware and plain
// text from the routes, so both are handled.
export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${serverURL}${path}`, {
    method,
    body,
    headers: { authorization: `bearer ${getToken()}`, ...headers },
  });

  const text = await res.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // plain text response
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" ? data.error : data) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data?.action === "REAUTHENTICATE");
  }
  return data;
}

// Returns a handler for caught errors. If the session is dead it signs the user out
// and sends them home, and returns true. Otherwise returns false so the page can
// show the error itself.
export function useSessionGuard() {
  const navigate = useNavigate();
  return useCallback(
    (err) => {
      if (err instanceof ApiError && err.reauth) {
        clearSession();
        navigate("/", {
          replace: true,
          state: { notice: "Your session expired. Sign in again to continue." },
        });
        return true;
      }
      console.error(err);
      return false;
    },
    [navigate]
  );
}
