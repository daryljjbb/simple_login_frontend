import { refreshAccessToken } from "./auth";

export async function apiFetch(url, options = {}) {
  let access = localStorage.getItem("access");

  // Attach access token
  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${access}`,
    "Content-Type": "application/json",
  };

  let response = await fetch(url, options);

  // If access token expired → try refresh
  if (response.status === 401) {
    const newAccess = await refreshAccessToken();

    if (!newAccess) return response; // refresh failed → logout handled

    // Retry original request with new access token
    options.headers.Authorization = `Bearer ${newAccess}`;
    response = await fetch(url, options);
  }

  return response;
}
