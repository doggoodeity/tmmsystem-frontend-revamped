import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Badge, Modal } from 'react-bootstrap';
import { FaEye, FaCheck, FaTimes, FaFileDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { quoteService } from '../../api/quoteService';


const CustomerQuotations = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCustomerQuotations = async () => {
      setLoading(true);
      try {
        const customerId = localStorage.getItem('customerId');
        if (!customerId) {
          setError('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
          return;
        }

        // Get all quotes and filter by customer
        const allQuotes = await quoteService.getAllQuotes();
        const customerQuotes = allQuotes.filter(quote => 
          quote.rfq?.customerId?.toString() === customerId
        );
        
        console.log('Customer quotations:', customerQuotes);
        setQuotations(customerQuotes);
      } catch (error) {
        console.error('Error fetching quotations:', error);
        setError('Không thể tải danh sách báo giá. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerQuotations();
  }, []);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ phản hồi';
      case 'SENT': return 'Đã gửi';
      case 'ACCEPTED': return 'Đã chấp nhận';
      case 'REJECTED': return 'Đã từ chối';
      case 'EXPIRED': return 'Hết hạn';
      case 'CANCELED': return 'Đã hủy';
      default: return status || 'Chờ phản hồi';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'SENT': return 'info';
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'danger';
      case 'EXPIRED': return 'secondary';
      case 'CANCELED': return 'dark';
      default: return 'warning';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleViewDetails = (quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailModal(true);
  };

  const handleAcceptQuotation = async (quotationId) => {
    setActionLoading(true);
    try {
      // Update quotation status to ACCEPTED
      await quoteService.updateQuotationStatus(quotationId, 'ACCEPTED');
      
      // Create order automatically
      const orderData = {
        quotationId: quotationId,
        status: 'CONFIRMED',
        orderDate: new Date().toISOString()
      };
      
      await quoteService.createOrderFromQuotation(orderData);
      
      setSuccess('✅ Báo giá đã được chấp nhận và đơn hàng đã được tạo!');
      setShowDetailModal(false);
      
      // Refresh quotations
      const customerId = localStorage.getItem('customerId');
      const allQuotes = await quoteService.getAllQuotes();
      const customerQuotes = allQuotes.filter(quote => 
        quote.rfq?.customerId?.toString() === customerId
      );
      setQuotations(customerQuotes);
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('Error accepting quotation:', error);
      setError('❌ Lỗi khi chấp nhận báo giá: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectQuotation = async (quotationId) => {
    setActionLoading(true);
    try {
      await quoteService.updateQuotationStatus(quotationId, 'REJECTED');
      
      setSuccess('✅ Báo giá đã được từ chối.');
      setShowDetailModal(false);
      
      // Refresh quotations
      const customerId = localStorage.getItem('customerId');
      const allQuotes = await quoteService.getAllQuotes();
      const customerQuotes = allQuotes.filter(quote => 
        quote.rfq?.customerId?.toString() === customerId
      );
      setQuotations(customerQuotes);
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      setError('❌ Lỗi khi từ chối báo giá: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const isExpired = (validUntil) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const canAcceptOrReject = (quotation) => {
    return quotation.status === 'PENDING' || quotation.status === 'SENT';
  };

  return (
    <div className="customer-layout">
      <Header />

      <div className="d-flex">
        <Sidebar />

        <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid className="p-4">
            <div className="customer-quotations-page">
              {/* Status Messages */}
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              {/* Page Header */}
              <div className="page-header mb-4">
                <h1 className="page-title">Báo giá của tôi</h1>
                <p className="page-subtitle">Xem và phản hồi các báo giá từ công ty</p>
              </div>

              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-3">Đang tải danh sách báo giá...</p>
                </div>
              ) : quotations.length === 0 ? (
                <Card className="text-center p-5">
                  <Card.Body>
                    <h5>Chưa có báo giá nào</h5>
                    <p className="text-muted">Hãy tạo yêu cầu báo giá để nhận báo giá từ chúng tôi.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/customer/quote-request')}
                    >
                      Tạo yêu cầu báo giá
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <Card className="quotations-card shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">Danh sách báo giá ({quotations.length})</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table responsive className="quotations-table mb-0">
                      <thead className="table-header">
                        <tr>
                          <th>Mã báo giá</th>
                          <th>Ngày tạo</th>
                          <th>Tổng giá trị</th>
                          <th>Hạn báo giá</th>
                          <th>Trạng thái</th>
                          <th className="text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotations.map((quotation, index) => (
                          <tr key={quotation.id || index}>
                            <td>
                              <span className="quotation-code">
                                {quotation.quotationNumber || `QUOTE-${String(index + 1).padStart(3, '0')}`}
                              </span>
                            </td>
                            <td>{formatDate(quotation.createdAt)}</td>
                            <td>
                              <span className="total-amount">
                                {formatCurrency(quotation.totalAmount || 0)}
                              </span>
                            </td>
                            <td>
                              <span className={isExpired(quotation.validUntil) ? 'text-danger' : 'text-success'}>
                                {formatDate(quotation.validUntil)}
                                {isExpired(quotation.validUntil) && <small className="d-block">(Đã hết hạn)</small>}
                              </span>
                            </td>
                            <td>
                              <Badge bg={getStatusColor(quotation.status)}>
                                {getStatusDisplay(quotation.status)}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewDetails(quotation)}
                                className="me-2"
                              >
                                <FaEye /> Xem
                              </Button>
                              {canAcceptOrReject(quotation) && !isExpired(quotation.validUntil) && (
                                <>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleAcceptQuotation(quotation.id)}
                                    disabled={actionLoading}
                                    className="me-1"
                                  >
                                    <FaCheck /> Chấp nhận
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleRejectQuotation(quotation.id)}
                                    disabled={actionLoading}
                                  >
                                    <FaTimes /> Từ chối
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </div>
          </Container>
        </div>
      </div>

      {/* Quotation Detail Modal */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết báo giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuotation && (
            <div className="quotation-details">
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Mã báo giá:</strong>
                  <p>{selectedQuotation.quotationNumber || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <strong>Ngày tạo:</strong>
                  <p>{formatDate(selectedQuotation.createdAt)}</p>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Hạn báo giá:</strong>
                  <p className={isExpired(selectedQuotation.validUntil) ? 'text-danger' : 'text-success'}>
                    {formatDate(selectedQuotation.validUntil)}
                    {isExpired(selectedQuotation.validUntil) && <small className="d-block">(Đã hết hạn)</small>}
                  </p>
                </Col>
                <Col md={6}>
                  <strong>Trạng thái:</strong>
                  <p>
                    <Badge bg={getStatusColor(selectedQuotation.status)}>
                      {getStatusDisplay(selectedQuotation.status)}
                    </Badge>
                  </p>
                </Col>
              </Row>

              <div className="pricing-breakdown">
                <h6>Chi tiết giá:</h6>
                <Table size="sm">
                  <tbody>
                    <tr>
                      <td>Nguyên vật liệu:</td>
                      <td className="text-end">{formatCurrency(selectedQuotation.materialCost || 0)}</td>
                    </tr>
                    <tr>
                      <td>Chi phí gia công:</td>
                      <td className="text-end">{formatCurrency(selectedQuotation.processingCost || 0)}</td>
                    </tr>
                    <tr>
                      <td>Chi phí hoàn thiện:</td>
                      <td className="text-end">{formatCurrency(selectedQuotation.finishingCost || 0)}</td>
                    </tr>
                    <tr>
                      <td>Lợi nhuận ({selectedQuotation.profitMargin || 0}%):</td>
                      <td className="text-end">
                        {formatCurrency(
                          (selectedQuotation.totalAmount || 0) - 
                          (selectedQuotation.materialCost || 0) - 
                          (selectedQuotation.processingCost || 0) - 
                          (selectedQuotation.finishingCost || 0)
                        )}
                      </td>
                    </tr>
                    <tr className="fw-bold border-top">
                      <td>Tổng cộng:</td>
                      <td className="text-end">{formatCurrency(selectedQuotation.totalAmount || 0)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {selectedQuotation.notes && (
                <div className="mt-3">
                  <strong>Ghi chú:</strong>
                  <p className="text-muted">{selectedQuotation.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedQuotation && canAcceptOrReject(selectedQuotation) && !isExpired(selectedQuotation.validUntil) && (
            <>
              <Button
                variant="success"
                onClick={() => handleAcceptQuotation(selectedQuotation.id)}
                disabled={actionLoading}
              >
                <FaCheck className="me-2" />
                {actionLoading ? 'Đang xử lý...' : 'Chấp nhận báo giá'}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleRejectQuotation(selectedQuotation.id)}
                disabled={actionLoading}
              >
                <FaTimes className="me-2" />
                Từ chối báo giá
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomerQuotations;