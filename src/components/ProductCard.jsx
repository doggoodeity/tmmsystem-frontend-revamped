import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductCard.css';

function ProductCard({ product }) {
  const navigate = useNavigate();
  
  const imageUrl =
    product.imageUrl ||
    `https://placehold.co/300x200/e9ecef/495057?text=${product.code || 'Image'}`;

  const handleRequestQuote = () => {
    navigate('/customer/create-rfq', { 
      state: { product } 
    });
  };

  return (
    <div className="product-card">
      <img
        src={imageUrl}
        alt={product.name || 'Sản phẩm'}
        className="product-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://placehold.co/300x200/e9ecef/495057?text=Error`;
        }}
      />
      <div className="product-info">
        <h3 className="product-name" title={product.name}>{product.name || 'Chưa có tên'}</h3>
        <p className="product-code">{product.code || 'N/A'}</p>
        {product.standardDimensions && (
          <p className="product-dimensions">Kích thước: {product.standardDimensions}</p>
        )}
        {product.standardWeight && (
          <p className="product-weight">Trọng lượng: {product.standardWeight}g</p>
        )}
        <button 
          className="quote-btn"
          onClick={handleRequestQuote}
        >
          Yêu cầu báo giá
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
