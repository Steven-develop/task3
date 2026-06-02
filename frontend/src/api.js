import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const register = (username, password) => api.post('/auth/register', { username, password });
export const login = (username, password) => api.post('/auth/login', { username, password });

// Customer APIs
export const getCustomers = () => api.get('/customers');
export const createCustomer = (customer) => api.post('/customers', customer);
export const updateCustomer = (customerNumber, customer) => api.put(`/customers/${customerNumber}`, customer);
export const deleteCustomer = (customerNumber) => api.delete(`/customers/${customerNumber}`);

// Product APIs
export const getProducts = () => api.get('/products');
export const createProduct = (product) => api.post('/products', product);
export const updateProduct = (productCode, product) => api.put(`/products/${productCode}`, product);
export const deleteProduct = (productCode) => api.delete(`/products/${productCode}`);

// Sale APIs
export const getSales = () => api.get('/sales');
export const getSale = (invoiceNumber) => api.get(`/sales/${invoiceNumber}`);
export const createSale = (saleData) => api.post('/sales', saleData);
export const updateSale = (invoiceNumber, saleData) => api.put(`/sales/${invoiceNumber}`, saleData);
export const deleteSale = (invoiceNumber) => api.delete(`/sales/${invoiceNumber}`);

export default api;