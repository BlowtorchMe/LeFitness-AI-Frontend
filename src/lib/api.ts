export const API_BASE = import.meta.env.VITE_API_URL || ""

function normalizeApiPath(path: string): string {
  if (path === "/api/gyms") return "/api/gyms/"
  if (path.startsWith("/api/gyms?")) return path.replace("/api/gyms?", "/api/gyms/?")
  if (path === "/api/faq") return "/api/faq/"
  if (path.startsWith("/api/faq?")) return path.replace("/api/faq?", "/api/faq/?")
  return path
}

export function apiUrl(path: string): string {
  return `${API_BASE}${normalizeApiPath(path)}`
}

export function adminFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  })
}
