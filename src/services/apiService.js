import axios from 'axios';

const API_BASE_URL = 'https://api.koinos.io/v1';
const API_KEY = process.env.VUE_APP_KOINOS_API_KEY;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  }
});

export const getAccountHistory = async (account, params = {}) => {
  try {
    const response = await apiClient.get(`/account/${account}/history`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching account history:', error);
    throw error;
  }
};

// Add other API methods here as needed

export default apiClient;