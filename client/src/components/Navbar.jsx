import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import axios from 'axios';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const { token } = JSON.parse(loggedInUser);
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // 토큰이 만료되었거나 유효하지 않으면 로그아웃 처리
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for storage changes (for login/logout across tabs or within same tab)
    const handleStorageChange = () => {
      fetchUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Side: Logo */}
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="오후의 타로" className="logo-img" />
          </Link>
        </div>

        {/* Center: Navigation Menu */}
        <ul className="navbar-menu">
          <li><Link to="/about">타로카드</Link></li>
          <li><Link to="/product">악세사리</Link></li>
          <li><Link to="/tarot">오늘의운세</Link></li>
        </ul>

        {/* Right Side: Utilities */}
        <div className="navbar-utils">
          {user ? (
            <>
              <span className="welcome-msg">{user.name}님 환영합니다.</span>
              <button onClick={handleLogout} className="util-link logout-btn">로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="util-link">로그인</Link>
              <Link to="/register" className="util-link">회원가입</Link>
            </>
          )}
          <Link to="/cart" className="util-link">장바구니</Link>
          {(user?.user_type === '관리자' || user?.user_type === 'admin' || user?.role === 'admin') && (
            <Link to="/admin" className="admin-nav-btn" title="관리자 페이지">
              <Shield size={18} />
              <span className="admin-btn-text">관리자</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
