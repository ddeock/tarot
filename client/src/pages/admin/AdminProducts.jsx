import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Box,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Home,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import './AdminProducts.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await axios.put(`${API_URL}/api/products/${id}`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        setProducts(products.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
      }
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.');
    }
    setActiveMenu(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        const response = await axios.delete(`${API_URL}/api/products/${id}`);
        if (response.data.success) {
          setProducts(products.filter(p => p._id !== id));
          alert('상품이 삭제되었습니다.');
        }
      } catch (error) {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
    setActiveMenu(null);
  };

  const calculateStats = () => {
    const total = products.length;
    const onSale = products.filter(p => p.isActive && p.stock > 0).length;
    const soldOut = products.filter(p => p.stock === 0).length;
    const totalSales = products.reduce((acc, p) => acc + (p.salesCount || 0), 0);
    
    return [
      { title: '전체 상품', value: total.toLocaleString(), change: '+0 이번주', icon: <Box size={20} />, color: '#3b82f6' },
      { title: '판매중', value: onSale.toLocaleString(), change: `${total > 0 ? Math.round((onSale / total) * 100) : 0}% 판매 중`, icon: <TrendingUp size={20} />, color: '#10b981' },
      { title: '품절 상품', value: soldOut.toLocaleString(), change: '재고 확인 필요', icon: <AlertCircle size={20} />, color: '#ef4444' },
      { title: '누적 판매량', value: totalSales.toLocaleString(), change: '전체 누적 수치', icon: <BarChart3 size={20} />, color: '#8b5cf6' },
    ];
  };

  const stats = calculateStats();

  // Pagination Logic
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setActiveMenu(null);
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
            <h1 className="header-title">상품 목록</h1>
            <p className="header-subtitle">등록된 상품을 조회하고 관리합니다.</p>
          </div>
          <div className="header-right">
            <Link to="/admin/products/new" className="add-product-btn">
              <Plus size={18} />
              <span>새 상품 등록</span>
            </Link>
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
              <input type="text" placeholder="상품명, 브랜드, 번호 검색..." />
            </div>
            <button className="filter-btn search-trigger-btn">
              <Search size={18} />
              <span>검색</span>
            </button>
          </div>

          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th className="checkbox-col"><input type="checkbox" /></th>
                  <th>상품번호</th>
                  <th>상품명</th>
                  <th>카테고리</th>
                  <th>판매가</th>
                  <th>재고</th>
                  <th>판매수</th>
                  <th>상태</th>
                  <th>등록일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="10" className="loading-text">로딩 중...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="10" className="empty-text">등록된 상품이 없습니다.</td></tr>
                ) : (
                  currentProducts.map((product) => (
                    <tr key={product._id}>
                      <td><input type="checkbox" /></td>
                      <td className="sku-cell">{product.sku}</td>
                      <td className="product-info-cell">
                        <img 
                          src={product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image.startsWith('/') ? '' : '/'}${product.image}`) : 'https://via.placeholder.com/44'} 
                          alt={product.name} 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/44?text=No+Img'; }}
                        />
                        <div className="product-details">
                          <p className="product-name">{product.name}</p>
                          <p className="product-brand">{product.brand || 'PrimeMuse'}</p>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td className="price-cell">{product.price.toLocaleString()}원</td>
                      <td className={product.stock === 0 ? 'out-of-stock' : ''}>{product.stock}</td>
                      <td>{product.salesCount || 0}</td>
                      <td>
                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'} ${product.stock === 0 ? 'soldout' : ''}`}>
                          {product.stock === 0 ? '품절' : product.isActive ? '판매중' : '판매중지'}
                        </span>
                      </td>
                      <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                      <td className="management-cell">
                        <button 
                          className={`action-btn ${activeMenu === product._id ? 'active' : ''}`}
                          onClick={() => setActiveMenu(activeMenu === product._id ? null : product._id)}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {activeMenu === product._id && (
                          <div className="action-dropdown">
                            <Link to={`/admin/products/edit/${product._id}`} className="dropdown-item">
                              <Edit size={14} />
                              <span>수정</span>
                            </Link>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleToggleStatus(product._id, product.isActive)}
                            >
                              {product.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                              <span>{product.isActive ? '비활성화' : '활성화'}</span>
                            </button>
                            <button 
                              className="dropdown-item delete"
                              onClick={() => handleDelete(product._id)}
                            >
                              <Trash2 size={14} />
                              <span>삭제</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <p className="total-count">총 {products.length}개 상품 (페이지 {currentPage} / {totalPages || 1})</p>
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
                <option value="3">3개</option>
              </select>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminProducts;
