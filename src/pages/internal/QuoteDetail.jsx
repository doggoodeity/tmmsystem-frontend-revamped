import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { quoteService } from '../../api/quoteService';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(v||0);
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('vi-VN') : 'N/A';

const statusMap = {
  PENDING: { label: 'Chờ phê duyệt', variant: 'warning' },
  SENT: { label: 'Chờ phê duyệt', variant: 'warning' },
  ACCEPTED: { label: 'Đã duyệt', variant: 'success' },
  REJECTED: { label: 'Từ chối', variant: 'danger' },
};

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // MOCK DATA - Replace with real API later
        const mockQuoteDetails = {
          1: {
            id: 1,
            quotationNumber: 'QTN-2025-001',
            customer: { 
              contactPerson: 'Nguyễn Văn Hùng',
              companyName: 'Công ty TNHH ABC'
            },
            createdAt: '2025-10-10',
            status: 'PENDING',
            materialCost: 150000,
            processingCost: 45000,
            finishingCost: 50000,
            totalAmount: 245000,
            profitMargin: 0
          },
          2: {
            id: 2,
            quotationNumber: 'QTN-2025-002',
            customer: { 
              contactPerson: 'Trần Thị Mai',
              companyName: 'Công ty XYZ'
            },
            createdAt: '2025-10-11',
            status: 'ACCEPTED',
            materialCost: 200000,
            processingCost: 60000,
            finishingCost: 40000,
            totalAmount: 300000,
            profitMargin: 0
          },
          3: {
            id: 3,
            quotationNumber: 'QTN-2025-003',
            customer: { 
              contactPerson: 'Phạm Minh Đức',
              companyName: 'Công ty DEF'
            },
            createdAt: '2025-10-12',
            status: 'REJECTED',
            materialCost: 180000,
            processingCost: 50000,
            finishingCost: 45000,
            totalAmount: 275000,
            profitMargin: 0
          },
          4: {
            id: 4,
            quotationNumber: 'QTN-2025-004',
            customer: { 
              contactPerson: 'Lê Thị Ngọc',
              companyName: 'Công ty GHI'
            },
            createdAt: '2025-10-13',
            status: 'PENDING',
            materialCost: 120000,
            processingCost: 40000,
            finishingCost: 35000,
            totalAmount: 195000,
            profitMargin: 0
          },
          5: {
            id: 5,
            quotationNumber: 'QTN-2025-005',
            customer: { 
              contactPerson: 'Hoàng Văn Phúc',
              companyName: 'Công ty JKL'
            },
            createdAt: '2025-10-14',
            status: 'ACCEPTED',
            materialCost: 250000,
            processingCost: 70000,
            finishingCost: 60000,
            totalAmount: 380000,
            profitMargin: 0
          }
        };
        
        const mockQuote = mockQuoteDetails[id];
        if (mockQuote) {
          setQuote(mockQuote);
        } else {
          setError('Không tìm thấy báo giá');
        }
      } catch (e) { 
        setError(e.message||'Lỗi khi tải báo giá'); 
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, [id]);

  const onSendToCustomer = async () => {
    if (!quote?.id) return;
    setSending(true);
    setError('');
    try {
      // Mock successful send
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('✅ Đã gửi báo giá cho khách hàng thành công!');
      setTimeout(()=> navigate('/internal/quotations'), 2000);
    } catch (e) { 
      setError(e.message || 'Gửi báo giá thất bại'); 
    } finally { 
      setSending(false); 
      setConfirmSend(false); 
    }
  };

  return (
    <div className="customer-layout">
      <Header />
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid className="p-4">
            <Button variant="outline-secondary" className="mb-3" onClick={() => navigate('/internal/quotations')}>
              <FaArrowLeft className="me-2"/> Quay lại danh sách
            </Button>

            {error && <Alert variant="danger" onClose={()=>setError('')} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={()=>setSuccess('')} dismissible>{success}</Alert>}

            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Chi tiết báo giá</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-4">Đang tải...</div>
                ) : quote ? (
                  <>
                    <Row className="mb-3">
                      <Col md={6}><strong>Mã báo giá:</strong> {quote.quotationNumber}</Col>
                      <Col md={6}><strong>Ngày tạo:</strong> {formatDate(quote.createdAt)}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}><strong>Khách hàng:</strong> {quote.customer?.companyName} ({quote.customer?.contactPerson})</Col>
                      <Col md={6}><strong>Trạng thái:</strong> <Badge bg={(statusMap[quote.status]||statusMap.PENDING).variant}>{(statusMap[quote.status]||statusMap.PENDING).label}</Badge></Col>
                    </Row>

                    <h6 className="mt-4 mb-3">Chi tiết giá</h6>
                    <Table size="sm" className="mb-4" bordered>
                      <tbody>
                        <tr>
                          <td><strong>Nguyên vật liệu</strong></td>
                          <td className="text-end">{formatCurrency(quote.materialCost)}</td>
                        </tr>
                        <tr>
                          <td><strong>Chi phí gia công</strong></td>
                          <td className="text-end">{formatCurrency(quote.processingCost)}</td>
                        </tr>
                        <tr>
                          <td><strong>Chi phí hoàn thiện</strong></td>
                          <td className="text-end">{formatCurrency(quote.finishingCost)}</td>
                        </tr>
                        <tr className="fw-bold bg-light">
                          <td><strong>Tổng cộng</strong></td>
                          <td className="text-end text-primary"><strong>{formatCurrency(quote.totalAmount)}</strong></td>
                        </tr>
                      </tbody>
                    </Table>

                    <div className="d-flex justify-content-end">
                      <Button 
                        variant="success" 
                        disabled={sending || quote.status === 'ACCEPTED'} 
                        onClick={() => setConfirmSend(true)}
                        size="lg"
                      >
                        <FaPaperPlane className="me-2"/> Gửi khách hàng
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-muted">Không tìm thấy báo giá</div>
                )}
              </Card.Body>
            </Card>

            <Modal show={confirmSend} onHide={() => setConfirmSend(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Xác nhận gửi báo giá</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>Bạn có chắc chắn muốn gửi báo giá <strong>{quote?.quotationNumber}</strong> cho khách hàng <strong>{quote?.customer?.contactPerson}</strong>?</p>
                <p className="text-muted small">Sau khi gửi, khách hàng sẽ nhận được thông báo và có thể xem, chấp nhận hoặc từ chối báo giá này.</p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setConfirmSend(false)}>
                  <FaTimes className="me-1"/> Hủy
                </Button>
                <Button variant="success" onClick={onSendToCustomer} disabled={sending}>
                  {sending ? 'Đang gửi...' : 'Xác nhận gửi'}
                </Button>
              </Modal.Footer>
            </Modal>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;
