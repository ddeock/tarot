import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package, Truck } from 'lucide-react';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }
        
        const { token } = JSON.parse(userStr);
        const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setOrder(res.data.data);
        } else {
          alert('주문 정보를 불러올 수 없습니다.');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        alert('잘못된 접근이거나 권한이 없습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return <div className="order-success-loading">주문 정보를 확인중입니다...</div>;
  }

  if (!order) return null;

  return (
    <div className="order-success-page">
      <div className="success-header">
        <CheckCircle className="success-icon" size={64} />
        <h1>결제가 성공적으로 완료되었습니다!</h1>
        <p>오후의 타로를 이용해 주셔서 감사합니다.</p>
      </div>

      <div className="success-content">
        <div className="order-summary-card">
          <div className="card-header">
            <h3>주문 요약</h3>
            <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="summary-details">
            <div className="detail-row">
              <span className="label">주문번호</span>
              <span className="value highlight">{order._id}</span>
            </div>
            <div className="detail-row">
              <span className="label">주문상태</span>
              <span className="value status-badge">{order.orderStatus}</span>
            </div>
            <div className="detail-row">
              <span className="label">결제수단</span>
              <span className="value">{order.paymentMethod}</span>
            </div>
            <div className="detail-row">
              <span className="label">총 결제금액</span>
              <span className="value price">{order.totalPrice.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        <div className="order-info-grid">
          <div className="info-card">
            <div className="card-title">
              <Package size={20} />
              <h4>주문 상품 ({order.orderItems.length}개)</h4>
            </div>
            <div className="items-list-compact">
              {order.orderItems.map(item => (
                <div key={item._id} className="compact-item">
                  <img src={item.image} alt={item.name} />
                  <div className="compact-item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">{item.quantity}개 / {item.price.toLocaleString()}원</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="info-card">
            <div className="card-title">
              <Truck size={20} />
              <h4>배송지 정보</h4>
            </div>
            <div className="shipping-info">
              <p><strong>수령인:</strong> {order.shippingAddress.recipientName}</p>
              <p><strong>연락처:</strong> {order.shippingAddress.recipientPhone}</p>
              <p><strong>주소:</strong> {order.shippingAddress.address} {order.shippingAddress.detailAddress}</p>
              <p><strong>요청사항:</strong> {order.shippingAddress.deliveryRequest}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="success-actions">
        <Link to="/" className="btn-continue-shopping">쇼핑 계속하기</Link>
        <Link to="/myorders" className="btn-view-orders">주문 내역 보기</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
