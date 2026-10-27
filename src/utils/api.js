/**
 * ELITEX Hackathon 2026 - Robust API Client & Safe JSON Parsing Utility
 * Protects against "Unexpected end of JSON input" errors when backend is offline,
 * proxy returns 502/504 HTML, or response is empty.
 */

export async function parseResponseSafe(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const data = await response.json();
      return data;
    } catch {
      if (!response.ok) {
        throw new Error(`Server returned error (${response.status}): ${response.statusText || 'Invalid JSON response'}`);
      }
      return {};
    }
  }

  // Handle HTML or non-JSON responses (e.g. Vite proxy 502 / 504 / ECONNREFUSED)
  const text = await response.text();

  if (!response.ok) {
    if (response.status === 502 || response.status === 504) {
      throw new Error('Backend server is unreachable (ECONNREFUSED). Please verify that the backend is running on http://localhost:5000.');
    }
    // Clean up HTML tags if Vite or Express sent HTML error
    const cleanText = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    throw new Error(cleanText ? `Server returned error (${response.status}): ${cleanText.slice(0, 160)}` : `Server request failed with status ${response.status} (${response.statusText})`);
  }

  // If status is 200/204 with empty body
  if (!text || text.trim() === '') {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

/**
 * Robust fetch wrapper that guarantees structured JSON output or clear actionable error
 */
export async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const data = await parseResponseSafe(res);

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return { res, data };
  } catch (err) {
    if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('NetworkError'))) {
      throw new Error('Network connection failed. Please ensure the backend server is running on http://localhost:5000.');
    }
    throw err;
  }
}
