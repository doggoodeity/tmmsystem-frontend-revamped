import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'https://tmmsystem-sep490g143-production.up.railway.app';
const PRODUCT_API_URL = `${API_BASE_URL}/v1/products`;
const CATEGORY_API_URL = `${API_BASE_URL}/v1/product-categories`;

const getAllProducts = async () => {
  try {
    const response = await axios.get(PRODUCT_API_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách sản phẩm.');
  }
};

const getAllCategories = async () => {
  try {
    const response = await axios.get(CATEGORY_API_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error.response?.data || error.message);
    return [];
  }
};

export const productService = {
  getAllProducts,
  getAllCategories,
};
