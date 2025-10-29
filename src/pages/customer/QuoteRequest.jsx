import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { productService } from '../../api/productService';
import { quoteService } from '../../api/quoteService';
import '../../styles/QuoteRequest.css';

const QuoteRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [quoteItems, setQuoteItems] = useState([{
    productId: '',
    size: '',
    quantity: ''
  }]);
  const [deliveryDate, setDeliveryDate] = useState('');

  // Handle pre-selected product from navigation
  useEffect(() => {
    if (location.state?.preSelectedProduct) {
      const preSelected = location.state.preSelectedProduct;
      setQuoteItems([{
        productId: preSelected.id.toString(),
        size: preSelected.size || preSelected.dimensions || '',
        quantity: '1'
      }]);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productData = await productService.getAllProducts();
        setProducts(productData || []);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải danh sách sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setQuoteItems([...quoteItems, {
      productId: '',
      size: '',
      quantity: ''
    }]);
  };

  const handleRemoveProduct = (index) => {
    if (quoteItems.length > 1) {
      const newItems = quoteItems.filter((_, i) => i !== index);
      setQuoteItems(newItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...quoteItems];
    newItems[index][field] = value;

    // If product changes, reset size
    if (field === 'productId') {
      newItems[index].size = '';
    }

    setQuoteItems(newItems);
  };

  const getAvailableSizes = (productId) => {
    if (!productId) return [];

    const selectedProduct = products.find(p => p.id.toString() === productId);
    if (!selectedProduct) return [];

    // Use standardDimensions from your API
    const availableSizes = [
      selectedProduct.standardDimensions
    ].filter(size => size && size !== 'undefined' && size !== null);

    // If no standardDimensions, show contact message
    if (availableSizes.length === 0) {
      return ['Liên hệ để biết kích thước'];
    }

    return availableSizes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that we have items
    if (quoteItems.length === 0 || quoteItems.some(item => !item.productId || !item.quantity)) {
      alert('Vui lòng chọn ít nhất một sản phẩm và điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    
    try {
      // Get user info from localStorage
      const customerId = localStorage.getItem('customerId');
      
      if (!customerId) {
        alert('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
        return;
      }
      
      console.log('Submitting RFQ with customer ID:', customerId);
      
      // Prepare the RFQ data
      const rfqData = {
        customerId: parseInt(customerId),
        expectedDeliveryDate: deliveryDate,
        details: quoteItems.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          size: item.size || 'Standard'
        }))
      };
      
      console.log('RFQ data to submit:', rfqData);
      
      // Submit to API
      const result = await quoteService.submitQuoteRequest(rfqData);
      console.log('RFQ submitted successfully:', result);
      
      // Show success message
      alert('Yêu cầu báo giá đã được gửi thành công!');
      
      // Reset form
      setQuoteItems([{
        productId: '',
        size: '',
        quantity: ''
      }]);
      setDeliveryDate('');
      
      // Optionally redirect to dashboard
      navigate('/customer/dashboard');
      
    } catch (error) {
      console.error('RFQ submission error:', error);
      alert('Có lỗi xảy ra khi gửi yêu cầu báo giá: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-layout">
      <Header />

      <div className="d-flex">
        <Sidebar />

        <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid className="p-4">
            <Row className="justify-content-center">
              <Col lg={8} xl={6}>
                <Card className="quote-request-card shadow">
                  <Card.Body className="p-5">
                    <div className="quote-header mb-4">
                      <h2 className="quote-title">Tạo yêu cầu báo giá</h2>
                      <p className="quote-subtitle text-muted">
                        Chọn sản phẩm, kích thước, số lượng và ngày giao hàng mong muốn.
                      </p>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                      {quoteItems.map((item, index) => (
                        <div key={index} className="product-item-section mb-4">
                          <Row>
                            <Col md={12} className="mb-3">
                              <Form.Label>Sản phẩm</Form.Label>
                              <Form.Select
                                value={item.productId}
                                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                required
                              >
                                <option value="">Chọn sản phẩm</option>
                                {products.map(product => (
                                  <option key={product.id} value={product.id}>
                                    {product.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Col>

                            <Col md={6} className="mb-3">
                              <Form.Label>Kích thước</Form.Label>
                              <Form.Select
                                value={item.size}
                                onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                              >
                                <option value="">Chọn sản phẩm trước</option>
                                {getAvailableSizes(item.productId).map(size => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </Form.Select>
                            </Col>

                            <Col md={6} className="mb-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <Form.Label>Số lượng</Form.Label>
                                {quoteItems.length > 1 && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleRemoveProduct(index)}
                                  >
                                    <FaTrash />
                                  </Button>
                                )}
                              </div>
                              <Form.Control
                                type="number"
                                placeholder="Nhập số lượng"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                min="1"
                                required
                              />
                            </Col>
                          </Row>
                        </div>
                      ))}

                      <div className="text-center mb-4">
                        <Button
                          variant="warning"
                          onClick={handleAddProduct}
                          className="add-product-btn"
                        >
                          <FaPlus className="me-2" />
                          Thêm sản phẩm
                        </Button>
                      </div>

                      <div className="delivery-date-section mb-4">
                        <Form.Label>Ngày giao hàng mong muốn</Form.Label>
                        <Form.Control
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                          required
                        />
                        <Form.Text className="text-muted">
                          Vui lòng chọn ngày từ ngày mai trở đi
                        </Form.Text>
                      </div>

                      <div className="text-end">
                        <Button
                          type="submit"
                          className="submit-btn"
                          disabled={loading || quoteItems.length === 0}
                        >
                          {loading ? 'Đang gửi...' : 'Gửi yêu cầu báo giá'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequest;
