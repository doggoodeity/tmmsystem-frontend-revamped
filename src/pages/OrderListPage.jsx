import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '../api/orderService.js';
import '../styles/OrderListPage.css';

function OrderListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(!!successMessage);

  useEffect(() => {
    fetchOrders();
    
    if (successMessage) {
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [successMessage]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await orderService.listMy();
      setOrders(Array.isArray(data) ? data : []);
      console.log('Loaded orders:', data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đơn hàng');
      console.log('Using empty orders due to error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getOrderStatusText = (status) => {
    const statusMap = {
      'PENDING_CONFIRMATION': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'IN_PRODUCTION': 'Đang sản xuất',
      'QUALITY_CHECK': 'Kiểm tra chất lượng',
      'SHIPPED': 'Đã giao hàng',
      'COMPLETED': 'Hoàn thành'
    };
    return statusMap[status] || status;
  };

  const getOrderStatusClass = (status) => {
    const classMap = {
      'PENDING_CONFIRMATION': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'IN_PRODUCTION': 'status-production',
      'QUALITY_CHECK': 'status-quality',
      'SHIPPED': 'status-shipped',
      'COMPLETED': 'status-completed'
    };
    return classMap[status] || 'status-default';
  };

  const handleViewOrder = (orderId) => {
    navigate(`/customer/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="orders-list-page">
        <div className="orders-container">
          <div className="loading-message">Đang tải danh sách đơn hàng...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-list-page">
      <div className="orders-container">
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

        <div className="orders-header">
          <div className="header-content">
            <h1>Đơn hàng của tôi</h1>
            <p className="page-subtitle">Theo dõi trạng thái và tiến độ đơn hàng</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Bạn chưa có đơn hàng nào. Hãy chấp nhận báo giá để tạo đơn hàng!</p>
            <button 
              className="btn-view-rfqs"
              onClick={() => navigate('/customer/rfqs')}
            >
              Xem yêu cầu báo giá
            </button>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Ngày tạo</th>
                  <th>Giao hàng dự kiến</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="order-row">
                    <td className="order-number">{order.orderNumber}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{formatDate(order.expectedDeliveryDate)}</td>
                    <td className="order-total">{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${getOrderStatusClass(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-view-detail"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderListPage;
