import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'https://tmmsystem-sep490g143-production.up.railway.app/v1';

const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`);
    console.log('Product API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách sản phẩm.');
  }
};

const getAllCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product-categories`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error.response?.data || error.message);
    return [];
  }
};

const getProductSizes = async (productId) => {
  try {
    console.log('Fetching sizes for product ID:', productId);
    
    const possibleEndpoints = [
      `${API_BASE_URL}/products/${productId}/sizes`,
      `${API_BASE_URL}/products/${productId}/variants`,
      `${API_BASE_URL}/product-variants/product/${productId}`,
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        const response = await axios.get(endpoint);
        console.log('Size API response:', response.data);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      } catch (endpointError) {
        console.log('Endpoint failed:', endpoint, endpointError.response?.status);
        continue;
      }
    }

    console.log('All endpoints failed, returning default size');
    return [{ 
      id: 'standard', 
      name: '30 x 50 cm'
    }];
    
  } catch (error) {
    console.error('Failed to fetch product sizes:', error);
    return [{ 
      id: 'standard', 
      name: '30 x 50 cm' 
    }];
  }
};

export const productService = {
  getAllProducts,
  getAllCategories,
  getProductSizes,
};
