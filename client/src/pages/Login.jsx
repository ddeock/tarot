import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 이미 로그인이 되어있는지 확인
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const { token } = JSON.parse(loggedInUser);
      if (token) {
        navigate('/');
      }
    }
  }, [navigate]);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/users/login`, {
        email,
        password,
      });

      console.log('Login Response:', res.data);

      if (res.data.success) {
        // 유저 정보와 토큰 저장
        const userData = {
          ...res.data.data,
          token: res.data.token
        };
        
        console.log('Saving User Data to LocalStorage:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Storage 이벤트 강제 발생 (Navbar 업데이트용)
        window.dispatchEvent(new Event('storage'));
        
        alert('로그인에 성공했습니다!');
        navigate('/');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.response?.data?.error || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Social Login Section */}
        <div className="social-login">
          <button className="social-btn kakao">
            <span className="icon">💬</span> 카카오로 시작하기
          </button>
          <button className="social-btn naver">
            <span className="icon">N</span> 네이버로 시작하기
          </button>
          <button className="social-btn google">
            <span className="icon">G</span> Google로 시작하기
          </button>
        </div>

        <div className="separator">또는</div>

        {/* Email Login Form */}
        <form className="login-form" onSubmit={onSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={email}
              onChange={onChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={password}
              onChange={onChange}
              required
            />
          </div>

          <div className="login-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              로그인상태유지
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="form-links">
          <Link to="/register">회원가입</Link>
          <Link to="/find-account">아이디 · 비밀번호 찾기</Link>
        </div>

        <div className="separator">또는</div>

        <button className="non-member-btn">
          비회원 주문배송 조회
        </button>
      </div>
    </div>
  );
};

export default Login;
