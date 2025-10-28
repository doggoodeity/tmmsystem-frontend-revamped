import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import '../styles/CompleteProfilePage.css';

export default function CompleteProfilePage() {
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = authService.getCurrentToken();
      await authService.completeCustomerProfile({ companyName, address }, token);
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-container">
      <div className="complete-profile-card">
        <img src="/logo.png" alt="Logo" className="profile-logo" />
        <h2 className="profile-title">Hoàn thiện hồ sơ công ty</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="companyName">Tên công ty</label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nhập tên công ty"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Địa chỉ</label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading} className="profile-submit">
            {loading ? 'Đang xử lý...' : 'Hoàn tất'}
          </button>
        </form>
      </div>
    </div>
  );
}
