import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://e-commerce-backend-4c4d.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    let message = errorData?.message || error.message || 'An administrative error occurred';
    if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      const fieldErrors = errorData.errors
        .map((e: any) => e.message || (e.field ? `${e.field} is invalid` : ''))
        .filter(Boolean)
        .join(', ');
      if (fieldErrors) {
        message = fieldErrors;
      }
    }
    return Promise.reject({ ...error, customMessage: message });
  }
);

export const uploadSingleImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data?.data?.url || response.data?.data?.relativeUrl;
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((f) => formData.append('images', f));
  const response = await api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data?.data?.urls || [];
};

