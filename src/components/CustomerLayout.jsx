import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import CustomerNavbar from './CustomerNavbar.jsx';
import CustomerSidebar from './CustomerSidebar.jsx';
import { authService } from '../api/authService.js';
import '../styles/CustomerLayout.css';

function CustomerLayout() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  React.useEffect(() => {
    if (!currentUser || !currentUser.isCustomer) {
      authService.logout();
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser || !currentUser.isCustomer) {
    return null;
  }

  return (
    <div className="customer-layout">
      <CustomerNavbar />
      <div className="layout-body">
        <CustomerSidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CustomerLayout;
