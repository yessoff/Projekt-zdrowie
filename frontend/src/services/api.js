// frontend/src/services/api.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

function normalizeUrl(url) {
  // jeśli już jest absolutny URL -> zostaw
  if (/^https?:\/\//i.test(url)) return url;

  // jeśli ktoś podał np. "records" -> zrób "/records"
  const path = url.startsWith("/") ? url : `/${url}`;

  return `${API_BASE}${path}`;
}

export async function apiFetch(url, options = {}, token = null) {
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Content-Type ustawiamy tylko jeśli wysyłamy body (żeby nie psuć np. FormData)
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const finalUrl = normalizeUrl(url);

  // ✅ ZWRACAMY Response (żeby można było robić res.json())
  return fetch(finalUrl, { ...options, headers });
}
