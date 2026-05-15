import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Layers, 
  CreditCard, 
  Settings 
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: '대시보드', path: '/admin', icon: <LayoutDashboard size={18} />, group: '메인 메뉴' },
    { name: '상품 관리', path: '/admin/products', icon: <Package size={18} />, group: '메인 메뉴' },
    { name: '주문 관리', path: '/admin/orders', icon: <ShoppingCart size={18} />, group: '메인 메뉴' },
    { name: '고객 관리', path: '/admin/customers', icon: <Users size={18} />, group: '메인 메뉴' },
    { name: '카테고리', path: '/admin/categories', icon: <Layers size={18} />, group: '관리' },
    { name: '결제 내역', path: '/admin/payments', icon: <CreditCard size={18} />, group: '관리' },
    { name: '설정', path: '/admin/settings', icon: <Settings size={18} />, group: '관리' },
  ];

  const mainItems = menuItems.filter(item => item.group === '메인 메뉴');
  const managementItems = menuItems.filter(item => item.group === '관리');

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Admin Panel</h2>
      </div>

      <div className="sidebar-content">
        <div className="menu-group">
          <p className="group-title">메인 메뉴</p>
          <ul className="menu-list">
            {mainItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`menu-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-text">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="menu-group">
          <p className="group-title">관리</p>
          <ul className="menu-list">
            {managementItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`menu-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-text">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
