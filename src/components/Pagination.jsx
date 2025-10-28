import React from 'react';
import '../styles/Pagination.css'; // File CSS riêng

function Pagination({ currentPage, totalPages, onPageChange }) {
    const pageNumbers = [];
    const maxPageButtons = 5; // Số lượng nút trang tối đa hiển thị (ví dụ: 1 ... 4 5 6 ... 10)

    // Logic để tạo danh sách các nút trang cần hiển thị
    if (totalPages <= maxPageButtons) {
        // Hiển thị tất cả nếu ít hơn hoặc bằng max
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        // Điều chỉnh startPage nếu endPage chạm đến giới hạn cuối
        if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - maxPageButtons + 1);
        }
         // Điều chỉnh endPage nếu startPage chạm giới hạn đầu (mặc dù logic trên đã xử lý)
         if (startPage === 1) {
             endPage = Math.min(totalPages, maxPageButtons);
         }


        if (startPage > 1) {
            pageNumbers.push(1); // Luôn hiển thị trang 1
            if (startPage > 2) {
                pageNumbers.push('...'); // Thêm dấu ... nếu có khoảng cách
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push('...'); // Thêm dấu ...
            }
            pageNumbers.push(totalPages); // Luôn hiển thị trang cuối
        }
    }


    if (totalPages <= 1) {
        return null; // Không hiển thị phân trang nếu chỉ có 1 trang
    }

    return (
        <nav className="pagination-container" aria-label="Pagination">
            <button
                className="pagination-button prev"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous Page"
            >
                &laquo; {/* Dấu mũi tên trái */}
            </button>

            {pageNumbers.map((number, index) => (
                number === '...' ? (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                    <button
                        key={number}
                        className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                        onClick={() => onPageChange(number)}
                        aria-current={currentPage === number ? 'page' : undefined}
                    >
                        {number}
                    </button>
                )
            ))}

            <button
                className="pagination-button next"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
            >
                &raquo; {/* Dấu mũi tên phải */}
            </button>
        </nav>
    );
}

export default Pagination;