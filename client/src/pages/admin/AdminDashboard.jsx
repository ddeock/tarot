import React from 'react';
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
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const stats = [
    { 
      title: '총 매출', 
      value: '₩12,456,000', 
      change: '+12.5%', 
      trend: 'up', 
      icon: <CreditCard className="stat-icon-inner" />,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6'
    },
    { 
      title: '총 주문', 
      value: '324', 
      change: '+8.2%', 
      trend: 'up', 
      icon: <ShoppingBag className="stat-icon-inner" />,
      iconBg: '#fef2f2',
      iconColor: '#ef4444'
    },
    { 
      title: '신규 고객', 
      value: '156', 
      change: '+23.1%', 
      trend: 'up', 
      icon: <UserPlus className="stat-icon-inner" />,
      iconBg: '#f0fdf4',
      iconColor: '#22c55e'
    },
    { 
      title: '상품 수', 
      value: '89', 
      change: '-2.4%', 
      trend: 'down', 
      icon: <Box className="stat-icon-inner" />,
      iconBg: '#faf5ff',
      iconColor: '#a855f7'
    },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: '김철수', product: '운명의 타로 세트', price: '₩45,000', status: '배송중' },
    { id: '#ORD-002', customer: '이영희', product: '심플 릴렉스 스프레드', price: '₩28,000', status: '완료' },
    { id: '#ORD-003', customer: '박민수', product: '프리미엄 셔플링 매트', price: '₩15,000', status: '취소' },
    { id: '#ORD-004', customer: '최지우', product: '오후의 타로 가이드북', price: '₩12,000', status: '완료' },
  ];

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
              <button className="view-all-btn">전체 보기</button>
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
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="bold">{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td>{order.price}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
              {[
                { name: '김철수', email: 'chulsoo@example.com', date: '2026-05-14' },
                { name: '이영희', email: 'younghee@example.com', date: '2026-05-13' },
                { name: '박민수', email: 'minsoo@example.com', date: '2026-05-13' },
                { name: '최지우', email: 'jiwoo@example.com', date: '2026-05-12' },
              ].map((customer, idx) => (
                <div key={idx} className="customer-item">
                  <div className="customer-avatar">{customer.name[0]}</div>
                  <div className="customer-info">
                    <p className="customer-name">{customer.name}</p>
                    <p className="customer-email">{customer.email}</p>
                  </div>
                  <span className="customer-date">{customer.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
