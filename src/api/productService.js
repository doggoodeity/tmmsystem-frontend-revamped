import apiClient from './apiConfig';

export const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await apiClient.get('/v1/products');
      return response.data || [];
    } catch (error) {
      console.error('Product fetch error:', error);
      throw new Error(error.response?.data?.message || 'Lỗi khi tải sản phẩm');
    }
  },

  // Get all categories (if this endpoint exists, otherwise we'll remove it)
  getAllCategories: async () => {
    try {
      const response = await apiClient.get('/v1/categories');
      return response.data || [];
    } catch (error) {
      console.error('Categories fetch error:', error);
      // Return empty array if categories don't exist
      return [];
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/v1/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tải sản phẩm');
    }
  }
};
