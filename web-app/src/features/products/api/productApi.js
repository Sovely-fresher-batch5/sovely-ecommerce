import axios from 'axios';
import { API_BASE_URL } from '../../../utils/apiBaseUrl.js';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

export const productApi = {
    getProducts: async ({ page = 1, limit = 12, query = '', categoryId = '' } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (query) params.append('query', query);
        if (categoryId && categoryId !== 'All') params.append('categoryId', categoryId);

        const response = await api.get(`/products?${params.toString()}`);
        const payload = response.data?.data;
        const safePage = Number(page) || 1;
        const safeLimit = Number(limit) || 12;

        return {
            products: Array.isArray(payload?.products) ? payload.products : [],
            pagination: {
                total: Number(payload?.pagination?.total) || 0,
                page: Number(payload?.pagination?.page) || safePage,
                pages: Number(payload?.pagination?.pages) || 1,
                limit: safeLimit,
            },
            debug: payload?.debug
        };
    },

    getProductById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data.data;
    },

    getCategories: async () => {
        const response = await api.get('/categories');
        return Array.isArray(response.data?.data) ? response.data.data : [];
    },

    getBestDeals: async (limit = 6) => {
        const response = await api.get(`/products/deals?limit=${limit}`);
        return response.data.data;
    }
};
