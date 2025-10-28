import axios from 'axios';

const API_BASE_URL = 'https://tmmsystem-sep490g143-production.up.railway.app/v1';

class QuotationService {
  async getById(id) {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token');
      
      const response = await axios.get(`${API_BASE_URL}/quotations/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Quotation API success:', response.data);
      return response.data;
      
    } catch (error) {
      console.log('Quotation API failed, using mock data');
      
      // Mock quotation data
      return {
        id: parseInt(id),
        rfqId: 102,
        quotationNumber: `QT-2025-${String(id).padStart(3, '0')}`,
        status: 'PENDING',
        validUntil: '2025-12-15',
        createdAt: new Date().toISOString(),
        details: [
          { 
            id: 1,
            productName: 'Khăn mặt hoa cotton', 
            quantity: 50, 
            unitPrice: 25000, 
            subtotal: 1250000,
            unit: 'cái'
          },
          { 
            id: 2,
            productName: 'Khăn tắm cao cấp', 
            quantity: 30, 
            unitPrice: 45000, 
            subtotal: 1350000,
            unit: 'cái'
          }
        ],
        totalAmount: 2600000,
        terms: 'Thanh toán 30% đặt cọc khi ký hợp đồng, 70% còn lại khi giao hàng. Bảo hành 6 tháng.',
        notes: 'Báo giá có hiệu lực trong 15 ngày kể từ ngày phát hành.'
      };
    }
  }

  async approve(id) {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token');
      
      const response = await axios.post(`${API_BASE_URL}/quotations/${id}/approve`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Quotation approve success:', response.data);
      return response.data;
      
    } catch (error) {
      console.log('Quotation approve failed, using mock response');
      
      // Mock approval response
      return {
        id: parseInt(id),
        status: 'APPROVED',
        approvedAt: new Date().toISOString()
      };
    }
  }

  async reject(id) {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token');
      
      const response = await axios.post(`${API_BASE_URL}/quotations/${id}/reject`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Quotation reject success:', response.data);
      return response.data;
      
    } catch (error) {
      console.log('Quotation reject failed, using mock response');
      
      return {
        id: parseInt(id),
        status: 'REJECTED',
        rejectedAt: new Date().toISOString()
      };
    }
  }
}

export const quotationService = new QuotationService();
