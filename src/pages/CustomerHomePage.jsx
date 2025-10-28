import React, { useState, useEffect } from 'react';
import { productService } from '../api/productService.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import '../styles/CustomerHomePage.css';

function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const productsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [productData, categoryData] = await Promise.all([
          productService.getAllProducts(),
          productService.getAllCategories(),
        ]);
        setProducts(productData || []);
        setCategories(categoryData || []);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId?.toString() === selectedCategory);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="customer-home-page">
      <h1 className="page-title">Danh sách sản phẩm</h1>
      <p className="page-subtitle">Chọn sản phẩm và yêu cầu báo giá để được giá tốt nhất</p>

      <div className="filter-container">
        <select className="category-dropdown" value={selectedCategory} onChange={handleCategoryChange}>
          <option value="all">Tất cả sản phẩm</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="loading-message">Đang tải sản phẩm...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <>
          {currentProducts.length > 0 ? (
            <div className="product-grid">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products-message">Không tìm thấy sản phẩm nào.</div>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}

export default CustomerHomePage;
