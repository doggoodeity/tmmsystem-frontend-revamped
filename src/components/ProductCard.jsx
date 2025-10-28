import React from 'react';
import '../styles/ProductCard.css';

const formatCurrency = (amount) => {
  if (amount == null) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

function ProductCard({ product }) {
  const imageUrl =
    product.imageUrl ||
    `https://placehold.co/300x200/e9ecef/495057?text=${product.code || 'Image'}`;

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
        <p className="product-price">{formatCurrency(product.basePrice)}</p>
      </div>
    </div>
  );
}

export default ProductCard;
