import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/CustomerSidebar.css';

// Icons
const UserProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

function CustomerSidebar() {
  return (
    <aside className="customer-sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink
              to="/customer/dashboard"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <span className="nav-icon"><UserProfileIcon /></span>
              <span className="nav-text">Khách hàng</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customer/rfqs"
              className={() => {
                const currentPath = window.location.pathname;
                const baseMatch = currentPath.startsWith('/customer/rfqs');
                return baseMatch ? 'nav-link active' : 'nav-link';
              }}
            >
              <span className="nav-icon"><DocumentTextIcon /></span>
              <span className="nav-text">Yêu cầu báo giá</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customer/orders"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <span className="nav-icon"><BoxIcon /></span>
              <span className="nav-text">Đơn hàng</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default CustomerSidebar;
