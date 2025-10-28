import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService'; // Để lấy tên user và logout
import '../styles/CustomerNavbar.css'; // File CSS riêng

// SVG Icons (Simple placeholders)
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="22" height="22">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.017 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="22" height="22">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

function CustomerNavbar() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('Khách hàng'); // Default name
  const dropdownRef = useRef(null); // Ref for detecting clicks outside
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.name) {
      // Lấy tên thật nếu có, nếu không giữ 'Khách hàng'
       setUserName(user.name.trim() || user.companyName || 'Khách hàng');
    }

    // Add event listener to close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array means this runs once on mount


  const handleLogout = () => {
    authService.logout();
    navigate('/login'); // Redirect to login page
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  return (
    <nav className="customer-navbar">
      {/* Left Section */}
      <div className="navbar-left">
        <Link to="/customer/dashboard" className="navbar-logo-link">
          <img src="/logo.png" alt="My Duc Towel Logo" className="navbar-logo" />
        </Link>
      </div>

      {/* Center Section */}
      <div className="navbar-center">
        <div className="search-bar">
          <span className="search-icon"><SearchIcon /></span>
          <input type="text" placeholder="Tìm kiếm sản phẩm..." />
        </div>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        <button className="create-rfq-button" onClick={() => navigate('/customer/create-rfq')}> {/* Thêm link sau */}
          Tạo yêu cầu báo giá
        </button>
        <div className="navbar-icon notification-icon">
          <BellIcon />
          <span className="notification-badge">2</span> {/* Badge thông báo */}
        </div>
        <div className="navbar-user-menu" ref={dropdownRef}>
          <button className="user-button" onClick={toggleUserDropdown} aria-haspopup="true" aria-expanded={userDropdownOpen}>
            <span className="user-icon"><UserIcon /></span>
            <span className="user-name">{userName}</span>
            {/* Simple arrow, replace with SVG if needed */}
            <span className={`dropdown-arrow ${userDropdownOpen ? 'open' : ''}`}>▼</span>
          </button>
          {userDropdownOpen && (
            <div className="user-dropdown">
              <Link to="/customer/profile" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}> {/* Thêm link sau */}
                Xem thông tin
              </Link>
              <button onClick={handleLogout} className="dropdown-item logout">
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default CustomerNavbar;