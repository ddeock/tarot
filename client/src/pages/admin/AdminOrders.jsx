import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Home,
  MoreHorizontal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import './AdminProducts.css'; // Reusing the same layout css

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/login');
        return;
      }
      const { token } = JSON.parse(userStr);
      
      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const userStr = localStorage.getItem('user');
      const { token } = JSON.parse(userStr);

      const response = await axios.put(`${API_URL}/api/orders/${id}/status`, {
        orderStatus: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(orders.map(o => o._id === id ? { ...o, orderStatus: newStatus } : o));
        alert('주문 상태가 변경되었습니다.');
      }
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.');
    }
    setActiveMenu(null);
  };

  const calculateStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.orderStatus === '결제대기').length;
    const paid = orders.filter(o => o.orderStatus === '결제완료').length;
    const shipping = orders.filter(o => o.orderStatus === '배송중' || o.orderStatus === '상품준비중').length;
    const completed = orders.filter(o => o.orderStatus === '배송완료').length;
    
    return [
      { title: '전체 주문', value: total.toLocaleString(), change: '누적 데이터', icon: <ShoppingCart size={20} />, color: '#3b82f6' },
      { title: '결제 대기/완료', value: (pending + paid).toLocaleString(), change: '처리 필요', icon: <Package size={20} />, color: '#f59e0b' },
      { title: '배송 처리중', value: shipping.toLocaleString(), change: '배송/준비중', icon: <Truck size={20} />, color: '#10b981' },
      { title: '배송 완료', value: completed.toLocaleString(), change: '완료된 주문', icon: <CheckCircle size={20} />, color: '#8b5cf6' },
    ];
  };

  const stats = calculateStats();

  // Pagination Logic
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setActiveMenu(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case '결제대기': return 'inactive'; // gray-ish
      case '결제완료': return 'active'; // green-ish
      case '상품준비중': return 'active'; 
      case '배송중': return 'active';
      case '배송완료': return 'active';
      case '주문취소': return 'soldout'; // red-ish
      default: return '';
    }
  };

  const availableStatuses = ['결제대기', '결제완료', '상품준비중', '배송중', '배송완료', '주문취소'];

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
            <h1 className="header-title">주문 관리</h1>
            <p className="header-subtitle">고객 주문 내역을 조회하고 상태를 변경합니다.</p>
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
              <input type="text" placeholder="주문번호, 고객명 검색..." />
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
                  <th>주문번호</th>
                  <th>고객명(ID)</th>
                  <th>상품 요약</th>
                  <th>결제액</th>
                  <th>상태</th>
                  <th>주문일시</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="loading-text">로딩 중...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan="7" className="empty-text">주문 내역이 없습니다.</td></tr>
                ) : (
                  currentOrders.map((order) => {
                    const firstItem = order.orderItems[0];
                    const itemSummary = order.orderItems.length > 1 
                      ? `${firstItem?.name} 외 ${order.orderItems.length - 1}건` 
                      : firstItem?.name;

                    return (
                      <tr key={order._id}>
                        <td className="sku-cell" style={{ fontSize: '0.85rem' }}>{order._id}</td>
                        <td>
                          {order.shippingAddress?.recipientName}
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>{order.user?.name || '알수없음'}</div>
                        </td>
                        <td className="product-info-cell">
                          <img 
                            src={firstItem?.image ? (firstItem.image.startsWith('http') ? firstItem.image : `http://localhost:5000${firstItem.image.startsWith('/') ? '' : '/'}${firstItem.image}`) : 'https://placehold.co/44?text=No+Img'} 
                            alt={firstItem?.name || '상품 이미지'} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/44?text=No+Img'; }}
                          />
                          <div className="product-details">
                            <p className="product-name">{itemSummary}</p>
                          </div>
                        </td>
                        <td className="price-cell">{order.totalPrice.toLocaleString()}원</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="management-cell">
                          <button 
                            className={`action-btn ${activeMenu === order._id ? 'active' : ''}`}
                            onClick={() => setActiveMenu(activeMenu === order._id ? null : order._id)}
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {activeMenu === order._id && (
                            <div className="action-dropdown" style={{ right: 0, minWidth: '150px' }}>
                              <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#888', borderBottom: '1px solid #eee' }}>상태 변경</div>
                              {availableStatuses.map(status => (
                                <button 
                                  key={status}
                                  className="dropdown-item"
                                  onClick={() => handleUpdateStatus(order._id, status)}
                                  disabled={order.orderStatus === status}
                                >
                                  <span>{status}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <p className="total-count">총 {orders.length}건 (페이지 {currentPage} / {totalPages || 1})</p>
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

export default AdminOrders;
