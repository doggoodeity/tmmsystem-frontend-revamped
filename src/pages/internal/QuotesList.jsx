import React, { useEffect, useMemo, useState } from 'react';
import { Container, Card, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaEye } from 'react-icons/fa';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { quoteService } from '../../api/quoteService';

const statusMap = {
  PENDING: { label: 'Chờ phê duyệt', variant: 'warning' },
  SENT: { label: 'Chờ phê duyệt', variant: 'warning' },
  ACCEPTED: { label: 'Đã duyệt', variant: 'success' },
  REJECTED: { label: 'Từ chối', variant: 'danger' },
  EXPIRED: { label: 'Hết hạn', variant: 'secondary' },
  CANCELED: { label: 'Đã hủy', variant: 'dark' }
};

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0,10);
  } catch { return iso; }
};

const QuotesList = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Trying to fetch real quotes from API...');
        const data = await quoteService.getAllQuotes();
        console.log('API returned:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          setQuotes(data);
          console.log('Using real API data');
        } else {
          throw new Error('No quotes from API, using fallback');
        }
      } catch (e) {
        console.warn('API Error, using mock data:', e.message);
        
        // Fallback to mock data if API fails
        const mockQuotes = [
          {
            id: 1,
            quotationNumber: 'QTN-2025-001',
            customer: { contactPerson: 'Nguyễn Văn Hùng' },
            createdAt: '2025-10-10',
            status: 'PENDING'
          },
          {
            id: 2,
            quotationNumber: 'QTN-2025-002',
            customer: { contactPerson: 'Trần Thị Mai' },
            createdAt: '2025-10-11', 
            status: 'ACCEPTED'
          },
          {
            id: 3,
            quotationNumber: 'QTN-2025-003',
            customer: { contactPerson: 'Phạm Minh Đức' },
            createdAt: '2025-10-12',
            status: 'REJECTED'
          },
          {
            id: 4,
            quotationNumber: 'QTN-2025-004',
            customer: { contactPerson: 'Lê Thị Ngọc' },
            createdAt: '2025-10-13',
            status: 'PENDING'
          },
          {
            id: 5,
            quotationNumber: 'QTN-2025-005',
            customer: { contactPerson: 'Hoàng Văn Phúc' },
            createdAt: '2025-10-14',
            status: 'ACCEPTED'
          }
        ];
        
        setQuotes(mockQuotes);
        setError('⚠️ Hiển thị dữ liệu mẫu (API chưa sẵn sàng)');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return quotes;
    return quotes.filter(x => {
      const num = x.quotationNumber || '';
      const rep = x.customer?.contactPerson || '';
      const date = formatDate(x.createdAt) || '';
      return [num, rep, date].some(v => String(v).toLowerCase().includes(keyword));
    });
  }, [q, quotes]);

  return (
    <div className="customer-layout">
      <Header />
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid className="p-4">
            <div className="mb-3">
              <InputGroup style={{ maxWidth: 420 }}>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Tìm kiếm sản phẩm..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </InputGroup>
            </div>

            <h4 className="mb-3">Danh sách Báo giá</h4>

            {error && (
              <div className="alert alert-warning mb-3">
                {error}
              </div>
            )}

            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <Table responsive className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 60 }}>#</th>
                      <th>Mã báo giá</th>
                      <th>Người đại diện</th>
                      <th>Ngày tạo đơn</th>
                      <th>Trạng thái</th>
                      <th style={{ width: 140 }} className="text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                    )}
                    {!loading && !error && filtered.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-4">Không có báo giá</td></tr>
                    )}
                    {!loading && filtered.map((x, idx) => {
                      const s = statusMap[x.status] || statusMap.PENDING;
                      return (
                        <tr key={x.id || idx}>
                          <td>{idx + 1}</td>
                          <td>{x.quotationNumber || `QTN-2025-${String(idx+1).padStart(3,'0')}`}</td>
                          <td>{x.customer?.contactPerson || '—'}</td>
                          <td>{formatDate(x.createdAt)}</td>
                          <td>
                            <Badge bg={s.variant}>{s.label}</Badge>
                          </td>
                          <td className="text-center">
                            <Button size="sm" variant="light" onClick={() => window.location.href = `/internal/quotations/${x.id}` }>
                              <FaEye className="me-1" /> Chi tiết
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
              <Card.Footer className="text-muted">
                Hiển thị {filtered.length} / {quotes.length} báo giá
                {error && <span className="text-warning ms-2">(Dữ liệu mẫu)</span>}
              </Card.Footer>
            </Card>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default QuotesList;
