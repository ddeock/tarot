import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Users,
  UserCheck,
  UserPlus,
  Home,
  Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import './AdminProducts.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/login');
        return;
      }
      const { token } = JSON.parse(userStr);
      
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        // 회원가입 최신순으로 정렬
        const sortedCustomers = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCustomers(sortedCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 회원을 삭제하시겠습니까?')) return;
    try {
      const userStr = localStorage.getItem('user');
      const { token } = JSON.parse(userStr);

      const response = await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCustomers(customers.filter(c => c._id !== id));
        alert('회원이 삭제되었습니다.');
      }
    } catch (error) {
      alert('회원 삭제 중 오류가 발생했습니다.');
    }
  };

  const calculateStats = () => {
    const total = customers.length;
    const adminCount = customers.filter(c => c.user_type === '관리자').length;
    const userCount = customers.filter(c => c.user_type === '사용자').length;
    
    // 최근 7일 내 가입자 수 계산
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newCount = customers.filter(c => new Date(c.createdAt) > oneWeekAgo).length;

    return [
      { title: '전체 회원', value: total.toLocaleString(), change: '누적 가입자', icon: <Users size={20} />, color: '#3b82f6' },
      { title: '일반 회원', value: userCount.toLocaleString(), change: '사용자', icon: <UserCheck size={20} />, color: '#10b981' },
      { title: '신규 회원', value: newCount.toLocaleString(), change: '최근 7일', icon: <UserPlus size={20} />, color: '#f59e0b' },
      { title: '관리자', value: adminCount.toLocaleString(), change: '시스템 권한', icon: <Users size={20} />, color: '#8b5cf6' },
    ];
  };

  const stats = calculateStats();

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <main className="admin-main">
        <div className="top-navigation">
          <Link to="/" className="back-to-shop-btn">
            <Home size={18} />
            <span>쇼핑몰로 돌아가기</span>
          </Link>
        </div>

        <header className="admin-header">
          <div className="header-left">
            <h1 className="header-title">고객 관리</h1>
            <p className="header-subtitle">회원가입한 고객 목록을 조회하고 관리합니다.</p>
          </div>
        </header>

        <section className="products-stats">
          {stats.map((stat, index) => (
            <div key={index} className="products-stat-card">
              <div className="stat-icon-box" style={{ color: stat.color, backgroundColor: `${stat.color}15` }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <p className="stat-label">{stat.title}</p>
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-change">{stat.change}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="products-table-container">
          <div className="table-controls">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="이름, 이메일 검색..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>회원번호</th>
                  <th>이름 (성별)</th>
                  <th>이메일</th>
                  <th>연락처</th>
                  <th>회원유형</th>
                  <th>가입일시</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="loading-text">로딩 중...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="7" className="empty-text">검색된 회원 내역이 없습니다.</td></tr>
                ) : (
                  currentItems.map((customer) => (
                    <tr key={customer._id}>
                      <td className="sku-cell" style={{ fontSize: '0.85rem' }}>{customer._id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{customer.name}</div>
                        {customer.gender && <div style={{ fontSize: '0.8rem', color: '#888' }}>{customer.gender}</div>}
                      </td>
                      <td>{customer.email}</td>
                      <td>{customer.phone || '-'}</td>
                      <td>
                        <span className={`status-badge ${customer.user_type === '관리자' ? 'active' : 'inactive'}`}>
                          {customer.user_type}
                        </span>
                      </td>
                      <td>{new Date(customer.createdAt).toLocaleString()}</td>
                      <td className="management-cell">
                         <button 
                            className="action-btn"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleDelete(customer._id)}
                            title="삭제"
                          >
                            <Trash2 size={18} />
                          </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <p className="total-count">총 {filteredCustomers.length}건 (페이지 {currentPage} / {totalPages || 1})</p>
            <div className="pagination">
              <button 
                className="page-btn" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button 
                  key={index + 1}
                  className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              
              <button 
                className="page-btn"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="page-size">
              <span>페이지당</span>
              <select value={itemsPerPage} readOnly>
                <option value="10">10개</option>
              </select>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminCustomers;
