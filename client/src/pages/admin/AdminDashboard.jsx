import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShoppingBag, 
  UserPlus, 
  Box, 
  TrendingUp, 
  TrendingDown, 
  Home,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }
        const { token } = JSON.parse(userStr);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/api/orders`, config),
          axios.get(`${API_URL}/api/users`, config),
          axios.get(`${API_URL}/api/products`)
        ]);

        if (ordersRes.data.success) setOrders(ordersRes.data.data.reverse()); // 최신순으로 정렬되게
        if (usersRes.data.success) setUsers(usersRes.data.data.reverse());
        if (productsRes.data.success) setProducts(productsRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const totalRevenue = orders.reduce((sum, order) => {
    if (order.orderStatus !== '주문취소') {
      return sum + (order.totalPrice || 0);
    }
    return sum;
  }, 0);

  const stats = [
    { 
      title: '총 매출', 
      value: `₩${totalRevenue.toLocaleString()}`, 
      change: '누적 데이터', 
      trend: 'up', 
      icon: <CreditCard className="stat-icon-inner" />,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6'
    },
    { 
      title: '총 주문', 
      value: orders.length.toString(), 
      change: '누적 데이터', 
      trend: 'up', 
      icon: <ShoppingBag className="stat-icon-inner" />,
      iconBg: '#fef2f2',
      iconColor: '#ef4444'
    },
    { 
      title: '총 고객', 
      value: users.length.toString(), 
      change: '누적 데이터', 
      trend: 'up', 
      icon: <UserPlus className="stat-icon-inner" />,
      iconBg: '#f0fdf4',
      iconColor: '#22c55e'
    },
    { 
      title: '상품 수', 
      value: products.length.toString(), 
      change: '등록된 상품', 
      trend: 'up', 
      icon: <Box className="stat-icon-inner" />,
      iconBg: '#faf5ff',
      iconColor: '#a855f7'
    },
  ];

  const recentOrders = orders.slice(0, 5).map(order => ({
    id: order._id,
    customer: order.shippingAddress?.recipientName || (order.user ? order.user.name : '알수없음'),
    product: order.orderItems.length > 1 ? `${order.orderItems[0]?.name} 외 ${order.orderItems.length - 1}건` : order.orderItems[0]?.name,
    productImage: order.orderItems[0]?.image,
    price: `₩${order.totalPrice.toLocaleString()}`,
    status: order.orderStatus
  }));

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case '결제대기': return 'inactive';
      case '결제완료': return 'active';
      case '상품준비중': return 'active'; 
      case '배송중': return 'active';
      case '배송완료': return 'active';
      case '주문취소': return 'soldout';
      default: return '';
    }
  };

  const recentCustomers = users.slice(0, 4).map(u => ({
    name: u.name,
    email: u.email,
    date: new Date(u.createdAt).toISOString().split('T')[0]
  }));

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>데이터를 불러오는 중입니다...</h2>
          </div>
        </main>
      </div>
    );
  }

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
            <h1 className="header-title">대시보드</h1>
            <p className="header-subtitle">PrimeMuse 타로 쇼핑몰 관리자 페이지에 오신 것을 환영합니다.</p>
          </div>
          <div className="header-right">
            <Link to="/admin/products/new" className="add-product-btn">
              <Plus size={18} />
              <span>새 상품 등록</span>
            </Link>
          </div>
        </header>

        <section className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-card-header">
                <span className="stat-title">{stat.title}</span>
                <div className="stat-icon" style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}>
                  {stat.icon}
                </div>
              </div>
              <div className="stat-card-body">
                <h2 className="stat-value">{stat.value}</h2>
                <div className={`stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{stat.change} 지난 달 대비</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="dashboard-content">
          <div className="content-card">
            <div className="content-card-header">
              <h3>최근 주문</h3>
              <Link to="/admin/orders" className="view-all-btn">전체 보기</Link>
            </div>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>주문 ID</th>
                    <th>고객명</th>
                    <th>상품</th>
                    <th>결제액</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>최근 주문 내역이 없습니다.</td></tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="bold" style={{fontSize: '0.85rem'}}>{order.id}</td>
                        <td>{order.customer}</td>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={order.productImage ? (order.productImage.startsWith('http') ? order.productImage : `http://localhost:5000${order.productImage.startsWith('/') ? '' : '/'}${order.productImage}`) : 'https://placehold.co/44?text=No+Img'} 
                            alt={order.product || '상품 이미지'} 
                            style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #f1f5f9' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/44?text=No+Img'; }}
                          />
                          <div className="product-details">
                            <p className="product-name" style={{ margin: 0, fontWeight: 600 }}>{order.product}</p>
                          </div>
                        </td>
                        <td>{order.price}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="content-card">
            <div className="content-card-header">
              <h3>최근 고객</h3>
              <button className="view-all-btn">전체 보기</button>
            </div>
            <div className="recent-customers-list">
              {recentCustomers.length === 0 ? (
                 <div style={{textAlign: 'center', padding: '2rem', color: '#666'}}>최근 가입한 고객이 없습니다.</div>
              ) : (
                recentCustomers.map((customer, idx) => (
                  <div key={idx} className="customer-item">
                    <div className="customer-avatar">{customer.name[0]}</div>
                    <div className="customer-info">
                      <p className="customer-name">{customer.name}</p>
                      <p className="customer-email">{customer.email}</p>
                    </div>
                    <span className="customer-date">{customer.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
