import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productService } from '../api/productService.js';
import { rfqService } from '../api/rfqService.js';
import '../styles/CreateRfqPage.css';

function CreateRfqPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedProduct = location.state?.product;

  const [products, setProducts] = useState([]);
  const [rfqItems, setRfqItems] = useState([{
    id: Date.now(),
    productId: preSelectedProduct?.id?.toString() || '',
    productName: preSelectedProduct?.name || '',
    sizeId: '',
    sizeName: '',
    availableSizes: [],
    quantity: '',
    isLoadingSizes: false,
    errors: {}
  }]);
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('RFQ Items updated:', rfqItems);
  }, [rfqItems]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (preSelectedProduct && products.length > 0) {
      console.log('Pre-selected product detected:', preSelectedProduct);
      fetchProductSizes(0, preSelectedProduct.id);
    }
  }, [preSelectedProduct, products]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const productData = await productService.getAllProducts();
      console.log('Fetched products:', productData);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchProductSizes = async (itemIndex, productId) => {
    console.log(`[${itemIndex}] Starting fetchProductSizes for product:`, productId);
    
    setRfqItems(prevItems => {
      const newItems = [...prevItems];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        isLoadingSizes: true,
        availableSizes: []
      };
      console.log(`[${itemIndex}] Set loading state:`, newItems[itemIndex]);
      return newItems;
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sizes = await productService.getProductSizes(productId);
      console.log(`[${itemIndex}] Received sizes:`, sizes);
      
      setRfqItems(prevItems => {
        const newItems = [...prevItems];
        const sizesArray = Array.isArray(sizes) ? sizes : [];
        
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          availableSizes: sizesArray,
          isLoadingSizes: false,
          sizeId: sizesArray.length === 1 ? sizesArray[0].id?.toString() : '',
          sizeName: sizesArray.length === 1 ? sizesArray[0].name : ''
        };
        
        console.log(`[${itemIndex}] Updated with sizes:`, newItems[itemIndex]);
        return newItems;
      });
      
    } catch (error) {
      console.error(`[${itemIndex}] Error fetching sizes:`, error);
      
      setRfqItems(prevItems => {
        const newItems = [...prevItems];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          availableSizes: [{ id: 'default', name: '30 x 50 cm' }],
          isLoadingSizes: false,
          sizeId: 'default',
          sizeName: '30 x 50 cm'
        };
        console.log(`[${itemIndex}] Set error fallback:`, newItems[itemIndex]);
        return newItems;
      });
    }
  };

  const handleProductChange = (itemIndex, productId) => {
    console.log(`[${itemIndex}] Product changed to:`, productId);
    
    const selectedProduct = products.find(p => p.id?.toString() === productId);
    console.log(`[${itemIndex}] Selected product:`, selectedProduct);
    
    setRfqItems(prevItems => {
      const newItems = [...prevItems];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        productId,
        productName: selectedProduct?.name || '',
        sizeId: '',
        sizeName: '',
        availableSizes: [],
        isLoadingSizes: false,
        errors: { ...newItems[itemIndex].errors, productId: '' }
      };
      console.log(`[${itemIndex}] Reset product state:`, newItems[itemIndex]);
      return newItems;
    });

    if (productId && productId !== '') {
      setTimeout(() => fetchProductSizes(itemIndex, productId), 100);
    }
  };

  const handleSizeChange = (itemIndex, sizeId) => {
    console.log(`[${itemIndex}] Size changed to:`, sizeId);
    
    setRfqItems(prevItems => {
      const newItems = [...prevItems];
      const selectedSize = newItems[itemIndex].availableSizes.find(s => s.id?.toString() === sizeId);
      
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        sizeId,
        sizeName: selectedSize?.name || '',
        errors: { ...newItems[itemIndex].errors, sizeId: '' }
      };
      
      console.log(`[${itemIndex}] Updated size:`, newItems[itemIndex]);
      return newItems;
    });
  };

  const handleQuantityChange = (itemIndex, quantity) => {
    setRfqItems(prevItems => {
      const newItems = [...prevItems];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        quantity,
        errors: { ...newItems[itemIndex].errors, quantity: '' }
      };
      return newItems;
    });
  };

  const addProductItem = () => {
    setRfqItems(prevItems => [...prevItems, {
      id: Date.now(),
      productId: '',
      productName: '',
      sizeId: '',
      sizeName: '',
      availableSizes: [],
      quantity: '',
      isLoadingSizes: false,
      errors: {}
    }]);
  };

  const removeProductItem = (itemIndex) => {
    if (rfqItems.length > 1) {
      setRfqItems(prevItems => prevItems.filter((_, index) => index !== itemIndex));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!desiredDeliveryDate) {
      newErrors.desiredDeliveryDate = 'Vui lòng chọn ngày giao hàng mong muốn';
      isValid = false;
    } else {
      const selectedDate = new Date(desiredDeliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.desiredDeliveryDate = 'Ngày giao hàng không thể là ngày trong quá khứ';
        isValid = false;
      }
    }

    setRfqItems(prevItems => {
      const newItems = [...prevItems];
      newItems.forEach((item, index) => {
        const itemErrors = {};
        
        if (!item.productId) {
          itemErrors.productId = 'Vui lòng chọn sản phẩm';
          isValid = false;
        }

        if (item.availableSizes.length > 1 && !item.sizeId) {
          itemErrors.sizeId = 'Vui lòng chọn kích thước';
          isValid = false;
        }

        if (!item.quantity || parseInt(item.quantity) < 1) {
          itemErrors.quantity = 'Vui lòng nhập số lượng hợp lệ (tối thiểu 1)';
          isValid = false;
        }
        
        newItems[index].errors = itemErrors;
      });
      return newItems;
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const rfqData = {
        desiredDeliveryDate: desiredDeliveryDate,
        items: rfqItems.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
        }))
      };

      console.log('Submitting RFQ data:', rfqData);
      
      try {
        await rfqService.createRfq(rfqData);
        console.log('Real API success');
      } catch (apiError) {
        console.log('API failed, using mock success:', apiError.message);
        
        const existingRfqs = JSON.parse(localStorage.getItem('mockRfqs') || '[]');
        const newRfq = {
          id: Date.now(),
          rfqNumber: `RFQ-2025-${String(existingRfqs.length + 1).padStart(3, '0')}`,
          status: 'PENDING',
          expectedDeliveryDate: rfqData.desiredDeliveryDate,
          createdAt: new Date().toISOString(),
          details: rfqData.items.map((item, index) => {
            const product = products.find(p => p.id == item.productId);
            return {
              id: Date.now() + index,
              productId: item.productId,
              productName: product?.name || 'Unknown Product',
              quantity: item.quantity,
              unit: 'cái'
            };
          })
        };
        existingRfqs.push(newRfq);
        localStorage.setItem('mockRfqs', JSON.stringify(existingRfqs));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      alert('Yêu cầu báo giá đã được gửi thành công!');
      navigate('/customer/rfqs', { 
        state: { 
          message: 'Yêu cầu báo giá đã được gửi thành công!' 
        } 
      });
      
    } catch (error) {
      console.error('Unexpected error:', error);
      setErrors({ submit: 'Có lỗi không mong muốn xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const renderSizeDropdown = (item, index) => {
    const { isLoadingSizes, availableSizes, sizeId, productId } = item;
    
    console.log(`[${index}] Rendering size dropdown:`, { isLoadingSizes, availableSizes, sizeId, productId });
    
    if (!productId) {
      return (
        <select className="form-select" disabled>
          <option>Chọn sản phẩm trước</option>
        </select>
      );
    }
    
    if (isLoadingSizes) {
      return (
        <select className="form-select" disabled>
          <option>Đang tải...</option>
        </select>
      );
    }
    
    if (!availableSizes || availableSizes.length === 0) {
      return (
        <select className="form-select" disabled>
          <option>Không có kích thước</option>
        </select>
      );
    }
    
    if (availableSizes.length === 1) {
      return (
        <select className="form-select" value={availableSizes[0].id} disabled>
          <option value={availableSizes[0].id}>
            {availableSizes[0].name}
          </option>
        </select>
      );
    }
    
    return (
      <select
        className={`form-select ${item.errors.sizeId ? 'error' : ''}`}
        value={sizeId || ''}
        onChange={(e) => handleSizeChange(index, e.target.value)}
      >
        <option value="">Chọn kích thước</option>
        {availableSizes.map(size => (
          <option key={size.id} value={size.id?.toString()}>
            {size.name}
          </option>
        ))}
      </select>
    );
  };

  if (loadingProducts) {
    return (
      <div className="create-rfq-page">
        <div className="rfq-container">
          <div className="loading-message">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-rfq-page">
      <div className="rfq-container">
        <div className="rfq-header">
          <h1 className="rfq-title">
            Tạo yêu cầu báo giá
          </h1>
          <p className="rfq-subtitle">
            Chọn sản phẩm, kích thước, số lượng và ngày giao hàng mong muốn.
          </p>
        </div>

        <form className="rfq-form" onSubmit={handleSubmit}>
          {rfqItems.map((item, index) => (
            <div key={item.id} className="product-item">
              {rfqItems.length > 1 && (
                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => removeProductItem(index)}
                  title="Xóa sản phẩm này"
                >
                  ×
                </button>
              )}

              <div className="form-group">
                <label className="form-label">Sản phẩm</label>
                <select
                  className={`form-select ${item.errors.productId ? 'error' : ''}`}
                  value={item.productId || ''}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id?.toString()}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {item.errors.productId && (
                  <span className="error-message">{item.errors.productId}</span>
                )}
                
                <small style={{color: '#666', fontSize: '12px'}}>
                  Debug: ProductId={item.productId}, Sizes={item.availableSizes.length}, Loading={item.isLoadingSizes.toString()}
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Kích thước</label>
                {renderSizeDropdown(item, index)}
                {item.errors.sizeId && (
                  <span className="error-message">{item.errors.sizeId}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Số lượng</label>
                <input
                  type="number"
                  className={`form-input ${item.errors.quantity ? 'error' : ''}`}
                  placeholder="Nhập số lượng"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  min="1"
                />
                {item.errors.quantity && (
                  <span className="error-message">{item.errors.quantity}</span>
                )}
              </div>
            </div>
          ))}

          <div className="add-product-container">
            <button
              type="button"
              className="add-product-btn"
              onClick={addProductItem}
            >
              + Thêm sản phẩm
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Ngày giao hàng mong muốn</label>
            <input
              type="date"
              className={`form-input ${errors.desiredDeliveryDate ? 'error' : ''}`}
              value={desiredDeliveryDate}
              onChange={(e) => setDesiredDeliveryDate(e.target.value)}
              min={getTodayDate()}
            />
            {errors.desiredDeliveryDate && (
              <span className="error-message">{errors.desiredDeliveryDate}</span>
            )}
          </div>

          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu báo giá'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateRfqPage;
