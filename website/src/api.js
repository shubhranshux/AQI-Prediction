import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL: API_URL });
export const getLocations = () => api.get('/locations').then(r => r.data);
export const predictAuto = (district, location) => api.post('/predict/auto', { district, location }).then(r => r.data);
export const predictManual = (data) => api.post('/predict/manual', data).then(r => r.data);
