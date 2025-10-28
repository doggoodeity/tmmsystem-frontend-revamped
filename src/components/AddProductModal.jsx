import React, { useState, useEffect } from 'react';
import { productService } from '../api/productService.js';
import '../styles/AddProductModal.css';

function AddProductModal({ rfqId, onClose, onSave }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [availableSizes, setAvailableSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductSizes(selectedProduct);
    } else {
      setAvailableSizes([]);
      setSelectedSize('');
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productData = await productService.getAllProducts();
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductSizes = async (productId) => {
    try {
      const sizes = await productService.getProductSizes(productId);
      setAvailableSizes(Array.isArray(sizes) ? sizes : []);
      if (sizes.length === 1) {
        setSelectedSize(sizes[0].id?.toString());
      }
    } catch (error) {
      console.error('Error fetching sizes:', error);
      setAvailableSizes([{ id: 'default', name: '30 x 50 cm' }]);
      setSelectedSize('default');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity || (!selectedSize && availableSizes.length > 1)) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const product = products.find(p => p.id?.toString() === selectedProduct);
    const size = availableSizes.find(s => s.id?.toString() === selectedSize);

    const newProduct = {
      id: Date.now(),
      productId: parseInt(selectedProduct),
      productName: product?.name || 'Unknown Product',
      size: size?.name || '30 x 50 cm',
      quantity: parseInt(quantity),
      unit: 'cái'
    };

    console.log('Adding product to RFQ:', rfqId, newProduct);
    
    alert('Sản phẩm đã được thêm vào RFQ');
    onSave();
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-loading">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Thêm sản phẩm vào lô hàng</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Sản phẩm</label>
            <select
              className="form-select"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
            >
              <option value="">Chọn sản phẩm</option>
              {products.map(product => (
                <option key={product.id} value={product.id?.toString()}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Kích thước</label>
            {availableSizes.length === 0 ? (
              <select className="form-select" disabled>
                <option>Chọn sản phẩm trước</option>
              </select>
            ) : availableSizes.length === 1 ? (
              <select className="form-select" value={availableSizes[0].id} disabled>
                <option value={availableSizes[0].id}>
                  {availableSizes[0].name}
                </option>
              </select>
            ) : (
              <select
                className="form-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                required
              >
                <option value="">Chọn kích thước</option>
                {availableSizes.map(size => (
                  <option key={size.id} value={size.id?.toString()}>
                    {size.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Số lượng</label>
            <input
              type="number"
              className="form-input"
              placeholder="Nhập số lượng"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
            />
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-save">
              Lưu sản phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
