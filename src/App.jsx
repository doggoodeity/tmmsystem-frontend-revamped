import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PlanningRFQDetail from './pages/planning/PlanningRFQDetail';
import QuoteManagement from './pages/internal/QuoteManagement';
//import QuoteDetail from './pages/internal/QuoteDetail';


// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import QuoteRequest from './pages/customer/QuoteRequest';

// Internal Staff Pages
import InternalDashboard from './pages/internal/Dashboard';
import QuoteRequests from './pages/internal/QuoteRequests';
import RFQDetail from './pages/internal/RFQDetail';

// Planning Department Pages
import PlanningQuoteRequests from './pages/planning/PlanningQuoteRequests';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="main-container">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Customer Routes */}
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/quote-request" element={<QuoteRequest />} />
            
            {/* Internal Staff Routes */}
            <Route path="/internal/dashboard" element={<InternalDashboard />} />
            <Route path="/internal/quotes" element={<QuoteRequests />} />
            <Route path="/internal/quote-requests" element={<QuoteRequests />} />
            <Route path="/internal/rfq-detail/:id" element={<RFQDetail />} />
            
            {/* Planning Department Routes */}
            <Route path="/planning/quote-requests" element={<PlanningQuoteRequests />} />

            <Route path="/planning/rfq-detail/:id" element={<PlanningRFQDetail />} />
            
            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
            <Route path="/internal/quotes/management" element={<QuoteManagement />} />
      
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
