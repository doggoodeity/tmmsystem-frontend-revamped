import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService.js'; // Import service
import '../styles/RegisterPage.css'; // Sẽ tạo file CSS sau

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Để thông báo đăng ký thành công
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    // Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    // Kiểm tra độ dài và phức tạp mật khẩu (có thể thêm sau nếu muốn)
    // Ví dụ: if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }

    setLoading(true);

    try {
      // Gọi API đăng ký từ authService
      const result = await authService.registerCustomer(email, password);
      console.log('Registration successful:', result);
      setSuccessMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      // Có thể tự động chuyển hướng sau vài giây hoặc để người dùng tự bấm link
      setTimeout(() => {
        navigate('/login'); // Chuyển về trang đăng nhập sau khi thành công
      }, 3000); // Chờ 3 giây

    } catch (err) {
      // Lỗi từ API (ví dụ: email đã tồn tại)
      setError(err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
      console.error('Registration error details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <img src="/logo.png" alt="Company Logo" className="register-logo" />
        <h2 className="register-title">Đăng ký tài khoản</h2>

        {/* Chỉ hiển thị form khi chưa đăng ký thành công */}
        {!successMessage && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email-register" className="form-label">Email</label>
              <input
                type="email"
                id="email-register" // Đổi id để tránh trùng với login page nếu dùng chung layout
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="Nhập email của bạn"
                autoComplete='email'
              />
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="form-label">Mật khẩu</label>
              {/* Có thể thêm icon mắt ẩn/hiện ở đây giống trang Login nếu muốn */}
              <input
                type="password"
                id="password-register"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                autoComplete="new-password"
              />
               {/* Gợi ý yêu cầu mật khẩu nếu có */}
               <small style={{ color: '#6c757d', fontSize: '0.8em', marginTop: '5px', display: 'block' }}>
                   Mật khẩu phải chứa chữ cái và số.
               </small>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
              />
            </div>

            {/* Hiển thị lỗi đăng ký */}
            {error && <p className="error-message">{error}</p>}

            <button type="submit" disabled={loading} className="register-button">
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>
        )}

        {/* Hiển thị thông báo thành công */}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="register-links">
          <span>Bạn đã có tài khoản? </span>
          <Link to="/login" className="register-link">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;