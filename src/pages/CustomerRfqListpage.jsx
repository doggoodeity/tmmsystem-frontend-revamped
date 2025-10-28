import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { rfqService } from '../api/rfqService.js';
import '../styles/CustomerRfqListPage.css';

function CustomerRfqListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(!!successMessage);

  useEffect(() => {
    fetchRfqs();
    
    if (successMessage) {
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [successMessage]);

  const fetchRfqs = async () => {
    setLoading(true);
    setError('');
    
    // Always try to get mock data first, then try API
    const mockRfqs = getMockRfqs();
    console.log('Mock RFQs from localStorage:', mockRfqs);
    
    try {
      const data = await rfqService.getMyRfqs();
      console.log('Fetched RFQs from API:', data);
      
      // Combine API data with mock data
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
    // Get created RFQs from localStorage first
    const createdRfqs = JSON.parse(localStorage.getItem('mockRfqs') || '[]');
    console.log('Created RFQs from localStorage:', createdRfqs);
    
    // Default sample RFQs
    const defaultMockRfqs = [
      {
        id: 998,
        rfqNumber: 'RFQ-2025-DEMO-001',
        status: 'PENDING',
        expectedDeliveryDate: '2025-12-15',
        createdAt: '2025-10-28T10:30:00Z',
        details: [
          { id: 1, productId: 25, productName: 'Khăn mặt hoa cotton', quantity: 100, unit: 'cái' },
          { id: 2, productId: 26, productName: 'Khăn tắm cao cấp', quantity: 50, unit: 'cái' }
        ],
        quotation: null
      },
      {
        id: 999,
        rfqNumber: 'RFQ-2025-DEMO-002',
        status: 'QUOTED',
        expectedDeliveryDate: '2025-11-30',
        createdAt: '2025-10-25T14:20:00Z',
        details: [
          { id: 3, productId: 27, productName: 'Khăn mặt bamboo', quantity: 200, unit: 'cái' }
        ],
        quotation: {
          id: 101,
          totalAmount: 2500000,
          validUntil: '2025-11-15',
          status: 'PENDING'
        }
      }
    ];
    
    // Combine user-created RFQs (most recent first) with default demos
    return [...createdRfqs.reverse(), ...defaultMockRfqs];
  };

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Đang chờ báo giá',
      'QUOTED': 'Đã có báo giá',
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

  const formatCurrency = (amount) => {
    if (!amount) return 'Chưa có giá';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleViewQuotation = (rfq) => {
    if (rfq.quotation) {
      navigate(`/customer/quotations/${rfq.quotation.id}`, { 
        state: { rfq, quotation: rfq.quotation } 
      });
    }
  };

  const handleCreateNewRfq = () => {
    navigate('/customer/create-rfq');
  };

  const handleRefresh = () => {
    fetchRfqs();
  };

  if (loading) {
    return (
      <div className="rfq-list-page">
        <div className="rfq-list-container">
          <div className="loading-message">Đang tải danh sách yêu cầu báo giá...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rfq-list-page">
      <div className="rfq-list-container">
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

        <div className="rfq-list-header">
          <div className="header-content">
            <h1 className="page-title">Yêu cầu báo giá của tôi</h1>
            <p className="page-subtitle">Theo dõi trạng thái và quản lý các yêu cầu báo giá đã gửi</p>
          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={handleRefresh} title="Làm mới danh sách">
              🔄
            </button>
            <button className="create-rfq-btn" onClick={handleCreateNewRfq}>
              + Tạo yêu cầu mới
            </button>
          </div>
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
            <button className="create-first-rfq-btn" onClick={handleCreateNewRfq}>
              Tạo yêu cầu báo giá
            </button>
          </div>
        ) : (
          <div className="rfq-cards">
            {rfqs.map((rfq) => (
              <div key={`${rfq.id}-${rfq.rfqNumber}`} className="rfq-card">
                <div className="rfq-card-header">
                  <div className="rfq-info">
                    <h3 className="rfq-number">{rfq.rfqNumber}</h3>
                    <span className={`status-badge ${getStatusClass(rfq.status)}`}>
                      {getStatusText(rfq.status)}
                    </span>
                  </div>
                  <div className="rfq-dates">
                    <span className="created-date">
                      Tạo: {formatDate(rfq.createdAt)}
                    </span>
                    <span className="delivery-date">
                      Giao hàng: {formatDate(rfq.expectedDeliveryDate)}
                    </span>
                  </div>
                </div>

                <div className="rfq-products">
                  <h4 className="products-title">Sản phẩm yêu cầu:</h4>
                  <div className="products-list">
                    {rfq.details && rfq.details.map((item) => (
                      <div key={item.id} className="product-item">
                        <span className="product-name">{item.productName}</span>
                        <span className="product-quantity">
                          SL: {item.quantity} {item.unit || 'cái'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {rfq.quotation && (
                  <div className="quotation-info">
                    <div className="quotation-summary">
                      <span className="quotation-amount">
                        Tổng giá: {formatCurrency(rfq.quotation.totalAmount)}
                      </span>
                      <span className="quotation-validity">
                        Có hiệu lực đến: {formatDate(rfq.quotation.validUntil)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="rfq-actions">
                  {rfq.quotation ? (
                    <button 
                      className="view-quotation-btn"
                      onClick={() => handleViewQuotation(rfq)}
                    >
                      Xem báo giá
                    </button>
                  ) : (
                    <span className="waiting-quotation">
                      Đang chờ báo giá
                    </span>
                  )}
                  
                  {rfq.status === 'QUOTED' && (
                    <div className="quotation-actions">
                      <button className="approve-btn">Chấp nhận</button>
                      <button className="reject-btn">Từ chối</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{marginTop: '20px', padding: '10px', background: '#f5f5f5', fontSize: '12px'}}>
            <strong>Debug:</strong> Total RFQs: {rfqs.length}, 
            Mock RFQs in localStorage: {JSON.parse(localStorage.getItem('mockRfqs') || '[]').length}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerRfqListPage;
