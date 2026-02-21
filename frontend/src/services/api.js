import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
                toast.error('Session expired. Please login again.');
            }
        } else if (error.response?.status === 403) {
            toast.error('You do not have permission to perform this action.');
        } else if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.');
        }

        return Promise.reject(error);
    }
);

// ---- AUTH ----
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// ---- VEHICLES ----
export const vehiclesAPI = {
    getAll: () => api.get('/vehicles'),
    getById: (id) => api.get(`/vehicles/${id}`),
    create: (data) => api.post('/vehicles', data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    updateStatus: (id, status) => api.patch(`/vehicles/${id}/status`, { status }),
    delete: (id) => api.delete(`/vehicles/${id}`),
};

// ---- DRIVERS ----
export const driversAPI = {
    getAll: () => api.get('/drivers'),
    getById: (id) => api.get(`/drivers/${id}`),
    create: (data) => api.post('/drivers', data),
    update: (id, data) => api.put(`/drivers/${id}`, data),
    updateStatus: (id, status) => api.patch(`/drivers/${id}/status`, { status }),
    delete: (id) => api.delete(`/drivers/${id}`),
};

// ---- TRIPS ----
export const tripsAPI = {
    getAll: () => api.get('/trips'),
    getById: (id) => api.get(`/trips/${id}`),
    create: (data) => api.post('/trips', data),
    update: (id, data) => api.put(`/trips/${id}`, data),
    updateStatus: (id, status) => api.patch(`/trips/${id}/status`, { status }),
    delete: (id) => api.delete(`/trips/${id}`),
};

// ---- DISPATCH ----
export const dispatchAPI = {
    assign: (data) => api.post('/dispatch/assign', data),
    complete: (data) => api.post('/dispatch/complete', data),
    cancel: (data) => api.post('/dispatch/cancel', data),
};

// ---- MAINTENANCE ----
export const maintenanceAPI = {
    getAll: () => api.get('/maintenance'),
    getByVehicle: (vehicleId) => api.get(`/maintenance/${vehicleId}`),
    create: (data) => api.post('/maintenance', data),
};

// ---- FUEL ----
export const fuelAPI = {
    getAll: () => api.get('/fuel'),
    getByVehicle: (vehicleId) => api.get(`/fuel/${vehicleId}`),
    create: (data) => api.post('/fuel', data),
};

// ---- EXPENSES ----
export const expensesAPI = {
    getAll: () => api.get('/expenses'),
    getByVehicle: (vehicleId) => api.get(`/expenses/${vehicleId}`),
    create: (data) => api.post('/expenses', data),
};

// ---- ANALYTICS ----
export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getFinancialSummary: () => api.get('/analytics/financial-summary'),
    getFuelEfficiency: () => api.get('/analytics/fuel-efficiency'),
    getVehicleAnalytics: (vehicleId) => api.get(`/analytics/vehicle/${vehicleId}`),
};

export default api;
