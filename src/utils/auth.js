export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    return null;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    localStorage.setItem("access", data.access);
    return data.access;

  } catch (error) {
    return null;
  }
}
