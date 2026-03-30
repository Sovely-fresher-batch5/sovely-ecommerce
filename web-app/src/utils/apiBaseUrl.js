/**
 * 🛠️ API BASE URL LOGIC
 * This ensures that whether we are running on Vercel or Localhost,
 * we never end up with "double" version prefixes like /api/v1/api/v1.
 */

// Use relative path for development to leverage Vite's proxy (better for CORS and local dev)
const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const API_BASE_URL = base.endsWith('/') ? base : `${base}/`;

export default API_BASE_URL;
