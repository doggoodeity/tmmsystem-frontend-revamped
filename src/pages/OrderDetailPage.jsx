import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '../api/orderService.js';
import '../styles/OrderDetailPage.css';

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock production steps (bạn có thể lấy từ backend về nếu có)
  const productionSteps = [
    { key: 'cuon_mac', name: 'Cuộn mác' },
    { key: 'det', name: 'Dệt' },
    { key: 'cat', name: 'Cắt' },
    { key: 'may', name: 'May' },
    { key: 'dong_goi', name: 'Đóng gói' }
  ];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await orderService.getById(id);
        setOrder(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Fake trạng thái các bước cho demo
  const mockProgress = {
    cuon_mac: 'not_started',
    det: 'not_started',
    cat: 'not_started',
    may: 'not_started',
    dong_goi: 'not_started'
  };
  // Nếu muốn test trạng thái khác hãy sửa giá trị ở trên (ex: 'processing', 'done')

  return (
    <div className="order-track-page">
      <div className="order-track-container">
        {/* Header xanh */}
        <div className="order-track-header">
          <div>
            <span className="order-code">Đơn hàng #{order?.orderNumber || order?.id}</span>
            <span className="order-status">{order?.status === 'PENDING_CONFIRMATION' ? 'Chờ sản xuất' : 'Đang sản xuất'}</span>
          </div>
          <div className="order-track-meta">
            <span>Ngày tạo: {order?.createdAt && new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
            <span>Ngày giao: {order?.expectedDeliveryDate && new Date(order.expectedDeliveryDate).toLocaleDateString('vi-VN')}</span>
            {/* Nút bên phải */}
            <div className="order-track-actions">
              <button className="contract-btn">Hợp đồng</button>
              <button className="back-btn" onClick={() => navigate('/customer/orders')}>Quay lại</button>
            </div>
          </div>
        </div>
        {/* Chi tiết đơn hàng */}
        <div className="order-track-detail">
          <h3>Chi tiết đơn hàng</h3>
          <div className="track-products-table-scroll">
            <table className="track-products-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Kích thước</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {(order?.details || []).map((item, idx) =>
                  <tr key={idx}>
                    <td>{item.productName}</td>
                    <td>{item.size || '--'}</td>
                    <td>{item.quantity}</td>
                    <td>{Number(item.unitPrice).toLocaleString('vi-VN')} ₫</td>
                    <td>{Number(item.subtotal).toLocaleString('vi-VN')} ₫</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="total-cell">Tổng cộng</td>
                  <td className="total-cell">{Number(order?.totalAmount || 0).toLocaleString('vi-VN')} ₫</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        {/* Tiến độ sản xuất dạng card giữa */}
        <div className="order-track-progress">
          {productionSteps.map((step) => (
            <div key={step.key}
              className={
                `track-step-card step-${mockProgress[step.key]||'not_started'}`
              }
            >
              <div className="step-icon"></div>
              <div className="step-name">{step.name}</div>
              <div className="step-status">
                {mockProgress[step.key] === 'done' && <span>Đã xong</span>}
                {mockProgress[step.key] === 'processing' && <span>Đang làm</span>}
                {(!mockProgress[step.key] || mockProgress[step.key] === 'not_started') && <span>Chưa bắt đầu</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default OrderDetailPage;
