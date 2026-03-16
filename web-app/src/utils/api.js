import axios from 'axios';
import { API_BASE_URL } from './apiBaseUrl.js';

// Create the single, global instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || API_BASE_URL || '/api/v1',
    withCredentials: true
});

// Intercept responses to ensure we don't accidentally return HTML or undefined
api.interceptors.response.use((response) => {
    // If the server returns HTML (usually Vite's dev server fallback), throw an error
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error("API Route Not Found: Received HTML instead of JSON. Check your API base URL.");
    }
    return response;
});

export default api;