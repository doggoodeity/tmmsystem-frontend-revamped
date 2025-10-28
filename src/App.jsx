import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import CustomerLayout from './components/CustomerLayout.jsx';
import CustomerHomePage from './pages/CustomerHomePage.jsx';
import CreateRfqPage from './pages/CreateRfqPage.jsx';
import RfqManagementPage from './pages/RfqManagementPage.jsx';
import QuotationDetailPage from './pages/QuotationDetailPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import OrderListPage from './pages/OrderListPage.jsx';
import { authService } from './api/authService.js';

function ProtectedRoute({ allowedRoles }) {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.isCustomer && currentUser.needsProfileCompletion && window.location.pathname !== '/customer/complete-profile') {
    return <Navigate to="/customer/complete-profile" replace />;
  }
  if (!currentUser.isCustomer && window.location.pathname === '/customer/complete-profile') {
    return <Navigate to="/internal/dashboard" replace />;
  }
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

function LayoutRoute({ LayoutComponent }) {
  return (
    <LayoutComponent>
      <Outlet />
    </LayoutComponent>
  );
}

function App() {
  const internalUserRoles = ['ADMIN', 'SALE_STAFF', 'PLANNING_DEPT', 'DIRECTOR', 'QC_STAFF', 'PRODUCTION_LEAD', 'WORKER', 'USER'];
  const currentUser = authService.getCurrentUser();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={currentUser ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<div>Forgot Password Placeholder</div>} />

        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route path="/customer/complete-profile" element={<CompleteProfilePage />} />
          <Route element={<LayoutRoute LayoutComponent={CustomerLayout} />}>
            <Route path="/customer/dashboard" element={<CustomerHomePage />} />
            <Route path="/customer/create-rfq" element={<CreateRfqPage />} />
            <Route path="/customer/rfqs" element={<RfqManagementPage />} />
            <Route path="/customer/quotations/:id" element={<QuotationDetailPage />} />
            <Route path="/customer/orders" element={<OrderListPage />} />
            <Route path="/customer/orders/:id" element={<OrderDetailPage />} />
            <Route path="/customer/profile" element={<div>Customer Profile Page Placeholder</div>} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={internalUserRoles} />}>
          <Route path="/internal/dashboard" element={<div>Internal Dashboard Placeholder</div>} />
        </Route>

        <Route
          path="/"
          element={
            currentUser ? (
              currentUser.isCustomer && currentUser.needsProfileCompletion ? (
                <Navigate to="/customer/complete-profile" replace />
              ) : currentUser.isCustomer ? (
                <Navigate to="/customer/dashboard" replace />
              ) : (
                <Navigate to="/internal/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
