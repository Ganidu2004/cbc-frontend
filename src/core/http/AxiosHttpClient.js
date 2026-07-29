import axios from 'axios';
import { HttpClient } from './HttpClient';
import { NetworkError } from '../errors/AppError';

export class AxiosHttpClient extends HttpClient {
  constructor(baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000') {
    super();
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to attach JWT token if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async post(url, body, config = {}) {
    try {
      const response = await this.client.post(url, body, config);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async put(url, body, config = {}) {
    try {
      const response = await this.client.put(url, body, config);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  _handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || error.response.statusText || 'Server Error';
      return new NetworkError(message, error.response.status, error.response.data);
    } else if (error.request) {
      return new NetworkError('No response received from server. Please check your network connection.', 0);
    } else {
      return new NetworkError(error.message || 'An unexpected error occurred.', 500);
    }
  }
}

// Singleton instance for global client dependency injection
export const defaultHttpClient = new AxiosHttpClient();
