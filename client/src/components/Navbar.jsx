import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }

    // Listen for storage changes (for login/logout across tabs or within same tab)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
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
          <li><Link to="/about">소개</Link></li>
          <li><Link to="/tarot">타로카드</Link></li>
          <li><Link to="/accessories">액세서리</Link></li>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
