import axios from 'axios';

const API_BASE_URL = 'https://tmmsystem-sep490g143-production.up.railway.app/v1';

class OrderService {
  async createFromQuotation(quotation) {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token');
      
      const response = await axios.post(`${API_BASE_URL}/orders/from-quotation`, 
        { quotationId: quotation.id }, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Order creation success:', response.data);
      return response.data;
      
    } catch (error) {
      console.log('Order API failed, creating mock order');
      
      // Create mock order
      const orders = this.getMockOrders();
      const orderId = Date.now();
      
      const newOrder = {
        id: orderId,
        orderNumber: `SO-2025-${String(orders.length + 1).padStart(4, '0')}`,
        quotationId: quotation.id,
        status: 'PENDING_CONFIRMATION',
        createdAt: new Date().toISOString(),
        expectedDeliveryDate: quotation.validUntil,
        totalAmount: quotation.totalAmount,
        details: quotation.details.map(d => ({
          id: d.id,
          productName: d.productName,
          quantity: d.quantity,
          unitPrice: d.unitPrice,
          subtotal: d.subtotal,
          unit: d.unit || 'cái'
        })),
        timeline: [
          { step: 'Quotation Approved', status: 'completed', date: new Date().toISOString() },
          { step: 'Order Created', status: 'completed', date: new Date().toISOString() },
          { step: 'Waiting Confirmation', status: 'current', date: null },
          { step: 'Production Planning', status: 'pending', date: null },
          { step: 'Manufacturing', status: 'pending', date: null },
          { step: 'Quality Check', status: 'pending', date: null },
          { step: 'Delivery', status: 'pending', date: null }
        ]
      };
      
      orders.unshift(newOrder); // Add to beginning
      this.saveMockOrders(orders);
      
      return newOrder;
    }
  }

  async listMy() {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token');
      
      const response = await axios.get(`${API_BASE_URL}/orders/customer`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Orders API success:', response.data);
      return response.data;
      
    } catch (error) {
      console.log('Orders API failed, using mock data');
      return this.getMockOrders();
    }
  }

  async getById(id) {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token');
      
      const response = await axios.get(`${API_BASE_URL}/orders/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Order detail API success:', response.data);
      return response.data;
      
    } catch (error) {
      console.log('Order detail API failed, using mock data');
      
      const orders = this.getMockOrders();
      const order = orders.find(o => String(o.id) === String(id));
      
      if (order) {
        return order;
      }
      
      // Return default mock order if not found
      return {
        id: parseInt(id),
        orderNumber: `SO-2025-${String(id).padStart(4, '0')}`,
        status: 'PENDING_CONFIRMATION',
        createdAt: new Date().toISOString(),
        expectedDeliveryDate: '2025-12-15',
        totalAmount: 2600000,
        details: [
          { productName: 'Khăn mặt hoa cotton', quantity: 50, unitPrice: 25000, subtotal: 1250000 },
          { productName: 'Khăn tắm cao cấp', quantity: 30, unitPrice: 45000, subtotal: 1350000 }
        ],
        timeline: [
          { step: 'Order Created', status: 'completed', date: new Date().toISOString() },
          { step: 'Waiting Confirmation', status: 'current', date: null },
          { step: 'Production Planning', status: 'pending', date: null },
          { step: 'Manufacturing', status: 'pending', date: null },
          { step: 'Delivery', status: 'pending', date: null }
        ]
      };
    }
  }

  async confirm(id) {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token');
      
      const response = await axios.post(`${API_BASE_URL}/orders/${id}/confirm`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Order confirm success:', response.data);
      return response.data;
      
    } catch (error) {
      console.log('Order confirm failed, using mock update');
      
      const orders = this.getMockOrders();
      const orderIndex = orders.findIndex(o => String(o.id) === String(id));
      
      if (orderIndex >= 0) {
        orders[orderIndex].status = 'CONFIRMED';
        orders[orderIndex].timeline = orders[orderIndex].timeline.map(step => {
          if (step.step === 'Waiting Confirmation') {
            return { ...step, status: 'completed', date: new Date().toISOString() };
          }
          if (step.step === 'Production Planning') {
            return { ...step, status: 'current' };
          }
          return step;
        });
        
        this.saveMockOrders(orders);
        return orders[orderIndex];
      }
      
      return { id: parseInt(id), status: 'CONFIRMED' };
    }
  }

  getMockOrders() {
    return JSON.parse(localStorage.getItem('mockOrders') || '[]');
  }

  saveMockOrders(orders) {
    localStorage.setItem('mockOrders', JSON.stringify(orders));
  }
}

export const orderService = new OrderService();
