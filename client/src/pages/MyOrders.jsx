import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Truck, ChevronRight } from 'lucide-react';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('전체');
  const navigate = useNavigate();

  const tabs = ['전체', '결제대기', '결제완료', '상품준비중', '배송중', '배송완료', '주문취소'];

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }

        const userData = JSON.parse(userStr);
        const { token } = userData;
        
        const isAdminUser = userData?.user_type === '관리자' || userData?.user_type === 'admin' || userData?.role === 'admin';
        
        const endpoint = isAdminUser 
          ? 'http://localhost:5000/api/orders' 
          : 'http://localhost:5000/api/orders/myorders';
          
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setOrders(res.data.data);
        } else {
          console.error('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [navigate]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const userStr = localStorage.getItem('user');
      const { token } = JSON.parse(userStr);

      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        orderStatus: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setOrders(orders.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order));
        alert('주문 상태가 변경되었습니다.');
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('주문 상태 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="myorders-loading">주문 내역을 불러오는 중입니다...</div>;
  }

  const filteredOrders = activeTab === '전체' ? orders : orders.filter(order => order.orderStatus === activeTab);

  return (
    <div className="myorders-page">
      <div className="myorders-container">
        <h1 className="page-title">내 주문 목록</h1>
        <p className="page-subtitle">지금까지 주문하신 내역을 확인하실 수 있습니다.</p>

        <div className="status-tabs">
          {tabs.map(tab => {
            const count = tab === '전체' ? orders.length : orders.filter(o => o.orderStatus === tab).length;
            return (
              <button
                key={tab}
                className={`status-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab} {count > 0 && <span className="tab-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <Package size={64} className="empty-icon" />
            <h2>해당하는 주문 내역이 없습니다.</h2>
            <p>다양한 타로카드와 악세사리를 만나보세요!</p>
            <Link to="/" className="btn-shop-now">쇼핑하러 가기</Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-date-info">
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="order-id">주문번호: {order._id}</span>
                  </div>
                  <Link to={`/order/success/${order._id}`} className="order-detail-link">
                    상세보기 <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="order-body">
                  <div className="order-status-display">
                    {order.orderStatus === '결제완료' ? <Package size={18} className="status-icon" /> : <Truck size={18} className="status-icon" />}
                    <span className="status-text">{order.orderStatus}</span>
                  </div>

                  <div className="order-items">
                    {order.orderItems.map((item, index) => (
                      <div key={item._id || index} className="order-item">
                        <img src={item.image} alt={item.name} className="item-image" />
                        <div className="item-info">
                          <h4 className="item-name">{item.name}</h4>
                          <p className="item-price">
                            {item.quantity}개 / {(item.price * item.quantity).toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="status-select-wrapper">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="결제대기">결제대기</option>
                        <option value="결제완료">결제완료</option>
                        <option value="상품준비중">상품준비중</option>
                        <option value="배송중">배송중</option>
                        <option value="배송완료">배송완료</option>
                        <option value="주문취소">주문취소</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="total-label">총 결제금액</span>
                      <span className="total-price">{order.totalPrice.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
