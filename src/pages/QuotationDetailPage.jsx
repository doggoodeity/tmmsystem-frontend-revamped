import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { quotationService } from '../api/quotationService.js';
import { orderService } from '../api/orderService.js';
import '../styles/QuotationDetailPage.css';

function QuotationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await quotationService.getById(id);
      setQuotation(data);
      console.log('Loaded quotation:', data);
    } catch (err) {
      setError(err.message || 'Không thể tải báo giá');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!quotation) return;
    
    setActionLoading(true);
    try {
      console.log('Approving quotation:', quotation.id);
      
      // Step 1: Approve quotation
      await quotationService.approve(quotation.id);
      
      // Step 2: Create order from quotation
      const order = await orderService.createFromQuotation(quotation);
      console.log('Order created:', order);
      
      // Step 3: Navigate to order detail
      navigate(`/customer/orders/${order.id}`, { 
        state: { 
          message: 'Đã chấp nhận báo giá và tạo đơn hàng thành công!',
          order: order
        } 
      });
      
    } catch (err) {
      setError(err.message || 'Không thể chấp nhận báo giá');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!quotation) return;
    
    setActionLoading(true);
    try {
      console.log('Rejecting quotation:', quotation.id);
      
      await quotationService.reject(quotation.id);
      
      navigate('/customer/rfqs', { 
        state: { 
          message: 'Đã từ chối báo giá' 
        } 
      });
      
    } catch (err) {
      setError(err.message || 'Không thể từ chối báo giá');
    } finally {
      setActionLoading(false);
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

  if (loading) {
    return (
      <div className="quotation-detail-page">
        <div className="quotation-container">
          <div className="loading-message">Đang tải báo giá...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quotation-detail-page">
        <div className="quotation-container">
          <div className="error-state">{error}</div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="quotation-detail-page">
        <div className="quotation-container">
          <div className="error-state">Không tìm thấy báo giá</div>
        </div>
      </div>
    );
  }

  return (
    <div className="quotation-detail-page">
      <div className="quotation-container">
        <div className="quotation-header">
          <div className="header-info">
            <h1 className="quotation-title">Báo giá #{quotation.quotationNumber}</h1>
            <div className="quotation-meta">
              <span className="meta-item">
                <strong>Trạng thái:</strong> {quotation.status}
              </span>
              <span className="meta-item">
                <strong>Hiệu lực đến:</strong> {formatDate(quotation.validUntil)}
              </span>
              <span className="meta-item">
                <strong>Ngày tạo:</strong> {formatDate(quotation.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="quotation-content">
          <div className="section">
            <h3 className="section-title">Chi tiết sản phẩm</h3>
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.details.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="product-name">{item.productName}</td>
                      <td className="quantity">{item.quantity} {item.unit}</td>
                      <td className="unit-price">{formatCurrency(item.unitPrice)}</td>
                      <td className="subtotal">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="3" className="total-label"><strong>Tổng cộng</strong></td>
                    <td className="total-amount"><strong>{formatCurrency(quotation.totalAmount)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {quotation.terms && (
            <div className="section">
              <h3 className="section-title">Điều khoản thanh toán</h3>
              <div className="terms-content">
                {quotation.terms}
              </div>
            </div>
          )}

          {quotation.notes && (
            <div className="section">
              <h3 className="section-title">Ghi chú</h3>
              <div className="notes-content">
                {quotation.notes}
              </div>
            </div>
          )}
        </div>

        <div className="quotation-actions">
          <button 
            className="btn-approve"
            onClick={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? 'Đang xử lý...' : 'Chấp nhận báo giá'}
          </button>
          <button 
            className="btn-reject"
            onClick={handleReject}
            disabled={actionLoading}
          >
            {actionLoading ? 'Đang xử lý...' : 'Từ chối báo giá'}
          </button>
          <button 
            className="btn-back"
            onClick={() => navigate('/customer/rfqs')}
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuotationDetailPage;
