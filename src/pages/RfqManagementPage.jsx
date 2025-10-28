import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { rfqService } from '../api/rfqService.js';
import '../styles/RfqManagementPage.css';

function RfqManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(!!successMessage);
  const [expandedRfqs, setExpandedRfqs] = useState(new Set());

  useEffect(() => {
    fetchRfqs();
    
    if (successMessage) {
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [successMessage]);

  const fetchRfqs = async () => {
    setLoading(true);
    setError('');
    
    const mockRfqs = getMockRfqs();
    console.log('Mock RFQs from localStorage:', mockRfqs);
    
    try {
      const data = await rfqService.getMyRfqs();
      console.log('Fetched RFQs from API:', data);
      
      const apiRfqs = Array.isArray(data) ? data : [];
      const combinedRfqs = [...mockRfqs, ...apiRfqs];
      setRfqs(combinedRfqs);
      
    } catch (err) {
      console.error('Error fetching RFQs:', err);
      
      if (err.message.includes('token') || err.message.includes('đăng nhập')) {
        setError('Phiên đăng nhập đã hết hạn. Đang chuyển đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      setError(`${err.message}. Hiển thị dữ liệu mẫu để demo.`);
      console.log('Using mock data due to API error');
      setRfqs(mockRfqs);
    } finally {
      setLoading(false);
    }
  };

  const getMockRfqs = () => {
    const createdRfqs = JSON.parse(localStorage.getItem('mockRfqs') || '[]');
    console.log('Created RFQs from localStorage:', createdRfqs);
    
    // IMPORTANT: Fix created RFQs to have quotations
    const fixedCreatedRfqs = createdRfqs.map(rfq => ({
      ...rfq,
      status: 'QUOTED', // Force to QUOTED for demo
      quotation: rfq.quotation || {
        id: rfq.id + 1000,
        available: true
      }
    }));
    
    const defaultMockRfqs = [
      {
        id: 102,
        rfqNumber: 'RFQ-102',
        status: 'QUOTED', // Changed to QUOTED
        expectedDeliveryDate: '2025-05-10',
        createdAt: '2025-04-26T10:30:00Z',
        details: [
          { id: 1, productName: 'Khăn cotton 34x80cm', size: '34x80cm', quantity: 50, unit: 'cái' },
          { id: 2, productName: 'Khăn bamboo 70x140cm', size: '70x140cm', quantity: 20, unit: 'cái' }
        ],
        quotation: { id: 101, available: true }
      },
      {
        id: 101,
        rfqNumber: 'RFQ-101',
        status: 'QUOTED',
        expectedDeliveryDate: '2025-04-25',
        createdAt: '2025-04-25T14:20:00Z',
        details: [
          { id: 3, productName: 'Khăn mặt bamboo', size: '30x50cm', quantity: 200, unit: 'cái' }
        ],
        quotation: { id: 102, available: true },
        orders: [{ id: 1, available: true }]
      },
      {
        id: 103,
        rfqNumber: 'RFQ-103',
        status: 'QUOTED', // Changed to QUOTED
        expectedDeliveryDate: '2025-10-21',
        createdAt: '2025-10-21T14:20:00Z',
        details: [
          { id: 4, productName: 'Khăn thể thao', size: '40x60cm', quantity: 100, unit: 'cái' }
        ],
        quotation: { id: 103, available: true }
      },
      {
        id: 104,
        rfqNumber: 'RFQ-104',
        status: 'QUOTED',
        expectedDeliveryDate: '2025-12-12',
        createdAt: '2025-12-12T14:20:00Z',
        details: [
          { id: 5, productName: 'Khăn cao cấp', size: '50x70cm', quantity: 75, unit: 'cái' }
        ],
        quotation: { id: 104, available: true },
        orders: [{ id: 2, available: true }]
      }
    ];
    
    return [...fixedCreatedRfqs.reverse(), ...defaultMockRfqs];
  };

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Đang chờ báo giá',
      'QUOTED': 'Đã báo giá',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Đã từ chối',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'PENDING': 'status-pending',
      'QUOTED': 'status-quoted',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected',
      'CANCELLED': 'status-cancelled'
    };
    return classMap[status] || 'status-default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const toggleExpanded = (rfqId) => {
    const newExpanded = new Set(expandedRfqs);
    if (newExpanded.has(rfqId)) {
      newExpanded.delete(rfqId);
    } else {
      newExpanded.add(rfqId);
    }
    setExpandedRfqs(newExpanded);
  };

  const handleViewQuotation = (rfq) => {
    if (rfq.quotation?.available) {
      navigate(`/customer/quotations/${rfq.quotation.id}`, { 
        state: { rfq, quotation: rfq.quotation } 
      });
    }
  };

  const handleViewOrder = (rfq) => {
    if (rfq.orders && rfq.orders.length > 0) {
      navigate(`/customer/orders/${rfq.orders[0].id}`, { 
        state: { rfq } 
      });
    }
  };

  const handleAddProduct = (rfqId) => {
    alert(`Thêm sản phẩm vào RFQ ${rfqId} - Feature đang phát triển`);
  };

  const handleEditProduct = (rfqId, productId) => {
    console.log('Edit product:', rfqId, productId);
    alert('Edit product - Feature đang phát triển');
  };

  const handleDeleteProduct = (rfqId, productId) => {
    console.log('Delete product:', rfqId, productId);
    alert('Delete product - Feature đang phát triển');
  };

  if (loading) {
    return (
      <div className="rfq-management-page">
        <div className="rfq-container">
          <div className="loading-message">Đang tải danh sách yêu cầu báo giá...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rfq-management-page">
      <div className="rfq-container">
        {showSuccessMessage && (
          <div className="success-message">
            <div className="success-content">
              <span className="success-icon">✓</span>
              <span>{successMessage}</span>
              <button 
                className="close-success"
                onClick={() => setShowSuccessMessage(false)}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="rfq-header">
          <h1 className="page-title">Danh sách yêu cầu báo giá</h1>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        {rfqs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Chưa có yêu cầu báo giá nào</h3>
            <p>Bạn chưa gửi yêu cầu báo giá nào. Hãy tạo yêu cầu đầu tiên!</p>
            <button className="create-first-rfq-btn" onClick={() => navigate('/customer/create-rfq')}>
              Tạo yêu cầu báo giá
            </button>
          </div>
        ) : (
          <div className="rfq-table-container">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Mã RFQ</th>
                  <th>Số lượng sản phẩm</th>
                  <th>Ngày tạo đơn</th>
                  <th>Trạng thái đơn hàng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq) => (
                  <React.Fragment key={rfq.id}>
                    <tr className="rfq-row" onClick={() => toggleExpanded(rfq.id)}>
                      <td>
                        <button className="expand-btn">
                          {expandedRfqs.has(rfq.id) ? '▼' : '▶'}
                        </button>
                      </td>
                      <td>{rfq.rfqNumber}</td>
                      <td>{rfq.details?.length || 0}</td>
                      <td>{formatDate(rfq.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(rfq.status)}`}>
                          {getStatusText(rfq.status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {/* Always show quotation button for demo */}
                          <button 
                            className="btn-view-quote"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewQuotation(rfq);
                            }}
                          >
                            Xem báo giá
                          </button>
                          {rfq.orders && rfq.orders.length > 0 && (
                            <div className="dropdown">
                              <button 
                                className="btn-view-order"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOrder(rfq);
                                }}
                              >
                                Xem đơn ▼
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedRfqs.has(rfq.id) && (
                      <tr className="rfq-detail-row">
                        <td colSpan="6">
                          <div className="rfq-detail-content">
                            <div className="detail-header">
                              <p><strong>Ngày giao hàng mong muốn:</strong> {formatDate(rfq.expectedDeliveryDate)}</p>
                            </div>
                            <table className="product-detail-table">
                              <thead>
                                <tr>
                                  <th>STT</th>
                                  <th>Sản phẩm</th>
                                  <th>Kích thước</th>
                                  <th>Số lượng</th>
                                  <th>Thao tác</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rfq.details?.map((product, index) => (
                                  <tr key={product.id}>
                                    <td>{index + 1}</td>
                                    <td>{product.productName}</td>
                                    <td>{product.size || '30x50cm'}</td>
                                    <td>{product.quantity}</td>
                                    <td>
                                      <div className="product-actions">
                                        <button 
                                          className="btn-edit"
                                          onClick={() => handleEditProduct(rfq.id, product.id)}
                                        >
                                          ✏ Sửa
                                        </button>
                                        <button 
                                          className="btn-delete"
                                          onClick={() => handleDeleteProduct(rfq.id, product.id)}
                                        >
                                          🗑 Xóa
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="detail-actions">
                              <button 
                                className="btn-add-product"
                                onClick={() => handleAddProduct(rfq.id)}
                              >
                                + Thêm sản phẩm
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RfqManagementPage;
