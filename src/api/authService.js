import axios from 'axios';

const AUTH_API_URL = 'https://tmmsystem-sep490g143-production.up.railway.app/v1/auth';
const CUSTOMER_API_URL = 'https://tmmsystem-sep490g143-production.up.railway.app/v1/auth/customer';

const login = async (email, password) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/login`, {
      email,
      password,
    });

    if (response.data && response.data.accessToken) {
      localStorage.setItem('userToken', response.data.accessToken);
      localStorage.setItem('userEmail', response.data.email);
      localStorage.setItem('userName', response.data.name || '');

      if (response.data.userId) {
        localStorage.setItem('userRole', response.data.role || 'USER');
        localStorage.setItem('isCustomer', 'false');
        localStorage.removeItem('companyName');
        localStorage.removeItem('customerId');
      } else if (response.data.customerId) {
        localStorage.setItem('userRole', 'CUSTOMER');
        localStorage.setItem('isCustomer', 'true');
        localStorage.setItem('customerId', response.data.customerId);
        localStorage.setItem('companyName', response.data.companyName || '');
      }
    }

    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    const errorMessage =
      error.response?.data?.message || error.response?.data || 'Email hoặc mật khẩu không đúng.';
    throw new Error(errorMessage);
  }
};

const registerCustomer = async (email, password) => {
  try {
    const response = await axios.post(`${CUSTOMER_API_URL}/register`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    const errorMessage =
      error.response?.data?.message || error.response?.data || 'Đăng ký không thành công.';
    throw new Error(errorMessage);
  }
};

const completeCustomerProfile = async (profileData, token) => {
  try {
    const response = await axios.post(`${CUSTOMER_API_URL}/create-company`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ✅ Sau khi cập nhật thành công, cập nhật lại localStorage
    if (profileData.companyName) {
      localStorage.setItem('companyName', profileData.companyName);
    }

    // ✅ Thêm bước cập nhật user sau khi hoàn tất profile
    const updatedUser = getCurrentUser();
    updatedUser.companyName = profileData.companyName;
    updatedUser.needsProfileCompletion = false;
    // Không cần set lại toàn bộ vì hàm getCurrentUser đọc từ localStorage,
    // chỉ cần đảm bảo companyName đã có

    return response.data;
  } catch (error) {
    console.error('Profile completion failed:', error.response?.data || error.message);
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data ||
      'Cập nhật hồ sơ không thành công.';
    throw new Error(errorMessage);
  }
};

const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('isCustomer');
  localStorage.removeItem('companyName');
  localStorage.removeItem('customerId');
  window.location.href = '/login';
};

const getCurrentToken = () => {
  return localStorage.getItem('userToken');
};

const getCurrentUser = () => {
  const token = localStorage.getItem('userToken');
  if (!token) return null;

  const companyName = localStorage.getItem('companyName');

  return {
    token: token,
    email: localStorage.getItem('userEmail'),
    name: localStorage.getItem('userName'),
    role: localStorage.getItem('userRole'),
    isCustomer: localStorage.getItem('isCustomer') === 'true',
    companyName: companyName === '' ? null : companyName,
    customerId: localStorage.getItem('customerId'),
    needsProfileCompletion:
      localStorage.getItem('isCustomer') === 'true' && (!companyName || companyName === ''),
  };
};

export const authService = {
  login,
  registerCustomer,
  completeCustomerProfile,
  logout,
  getCurrentToken,
  getCurrentUser,
};
