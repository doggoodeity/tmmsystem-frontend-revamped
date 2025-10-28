import axios from 'axios';

const API_BASE_URL = 'https://tmmsystem-sep490g143-production.up.railway.app/v1';

class RfqService {
  async createRfq(rfqData) {
    try {
      const token = localStorage.getItem('userToken');
      const customerId = localStorage.getItem('customerId');
      
      console.log('=== RFQ CREATION DEBUG ===');
      console.log('Token exists:', !!token);
      console.log('Customer ID:', customerId);
      console.log('Raw RFQ data:', rfqData);
      
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.');
      }
      
      if (!customerId) {
        throw new Error('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
      }

      const payload = {
        customerId: parseInt(customerId),
        expectedDeliveryDate: rfqData.desiredDeliveryDate,
        status: "PENDING",
        details: rfqData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unit: "cái",
          noteColor: "",
          notes: ""
        }))
      };

      console.log('Final payload:', JSON.stringify(payload, null, 2));
      console.log('API URL:', `${API_BASE_URL}/rfqs`);
      
      const response = await axios.post(`${API_BASE_URL}/rfqs`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API Response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('=== RFQ ERROR DEBUG ===');
      console.error('Error object:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request config:', error.config);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response.status === 403) {
          throw new Error('Không có quyền thực hiện thao tác này.');
        } else if (error.response.status === 400) {
          const errorMsg = error.response.data?.message || JSON.stringify(error.response.data);
          throw new Error(`Dữ liệu không hợp lệ: ${errorMsg}`);
        }
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Không thể tạo yêu cầu báo giá');
    }
  }

  async getMyRfqs(page = 1, size = 10) {
    try {
      const token = localStorage.getItem('userToken');
      const customerId = localStorage.getItem('customerId');
      
      console.log('Getting RFQs for customer:', customerId);
      
      if (!token) {
        throw new Error('Không có token xác thực');
      }
      
      if (!customerId) {
        throw new Error('Không tìm thấy thông tin khách hàng');
      }
      
      const endpoints = [
        `${API_BASE_URL}/rfqs/customer/${customerId}`,
        `${API_BASE_URL}/rfqs/my`,
        `${API_BASE_URL}/rfqs?customerId=${customerId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying RFQ endpoint:', endpoint);
          const response = await axios.get(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          console.log('RFQ fetch success:', response.data);
          return response.data;
        } catch (endpointError) {
          console.log('Endpoint failed:', endpoint, endpointError.response?.status);
          continue;
        }
      }
      
      throw new Error('All RFQ endpoints failed');
      
    } catch (error) {
      console.error('Get RFQs error:', error);
      throw new Error(error.message || 'Lỗi kết nối mạng');
    }
  }
}

export const rfqService = new RfqService();
