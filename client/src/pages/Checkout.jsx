import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, itemsPrice, shippingPrice, totalPrice } = location.state || {};

  const [shippingAddress, setShippingAddress] = useState({
    recipientName: '',
    recipientPhone: '',
    postalCode: '',
    address: '',
    detailAddress: '',
    deliveryRequest: '문앞에 두고 가주세요'
  });

  const [paymentMethod, setPaymentMethod] = useState('신용카드');

  useEffect(() => {
    // 포트원(Iamport) 결제 모듈 초기화
    if (window.IMP) {
      window.IMP.init('imp81282285');
    }
  }, []);

  useEffect(() => {
    // If accessed without state, redirect to cart
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    const fetchUserProfile = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const { token } = JSON.parse(userStr);
          const res = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            const userData = res.data.data;
            setShippingAddress(prev => ({
              ...prev,
              recipientName: userData.name || '',
              recipientPhone: userData.phone || '',
              address: userData.address || '',
              detailAddress: userData.detailAddress || ''
            }));
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = async () => {
    if (!shippingAddress.recipientName || !shippingAddress.recipientPhone || !shippingAddress.address) {
      alert('배송지 정보를 모두 입력해주세요.');
      return;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const { token, email } = JSON.parse(userStr);

    if (!window.IMP) {
      alert('결제 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.');
      return;
    }

    if (paymentMethod === '무통장입금') {
      // 무통장입금은 포트원을 거치지 않고 바로 서버에 결제 대기 상태로 주문 생성
      try {
        const orderItems = cartItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          image: item.product.image,
          price: item.product.price,
          product: item.product._id
        }));

        const res = await axios.post(`${API_URL}/api/orders`, {
          orderItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          totalPrice
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          const orderId = res.data.data._id;
          try {
            await axios.delete(`${API_URL}/api/cart`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            window.dispatchEvent(new Event('storage'));
          } catch (cartError) {
            console.error('장바구니 비우기 에러:', cartError);
          }
          navigate(`/order/success/${orderId}`);
        }
      } catch (error) {
        console.error('주문 처리 실패:', error);
        const errorMsg = error.response?.data?.error || error.message;
        alert(`주문 처리 중 오류가 발생했습니다.\n사유: ${errorMsg}\n고객센터에 문의해주세요.`);
      }
      return;
    }

    let pg = 'html5_inicis'; // default
    let pay_method = 'card';
    
    if (paymentMethod === '카카오페이') {
      pg = 'kakaopay';
    } else if (paymentMethod === '네이버페이') {
      pg = 'naverpay';
    }

    const orderName = cartItems.length > 1 
      ? `${cartItems[0].product.name} 외 ${cartItems.length - 1}건` 
      : cartItems[0].product.name;

    const data = {
      pg: pg,
      pay_method: pay_method,
      merchant_uid: `mid_${new Date().getTime()}`,
      name: orderName,
      amount: totalPrice,
      buyer_email: email || 'buyer@example.com',
      buyer_name: shippingAddress.recipientName,
      buyer_tel: shippingAddress.recipientPhone,
      buyer_addr: `${shippingAddress.address} ${shippingAddress.detailAddress}`.trim(),
      buyer_postcode: shippingAddress.postalCode || ''
    };

    window.IMP.request_pay(data, async (response) => {
      if (response.success) {
        try {
          // 1. 주문 생성
          const orderItems = cartItems.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            image: item.product.image,
            price: item.product.price,
            product: item.product._id
          }));

          const res = await axios.post(`${API_URL}/api/orders`, {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            imp_uid: response.imp_uid,
            merchant_uid: response.merchant_uid
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data.success) {
            const orderId = res.data.data._id;
            
            // 2. 장바구니 비우기
            try {
              await axios.delete(`${API_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              window.dispatchEvent(new Event('storage'));
            } catch (cartError) {
              console.error('장바구니 비우기 에러:', cartError);
            }

            navigate(`/order/success/${orderId}`);
          }
        } catch (error) {
          console.error('주문 처리 실패:', error);
          const errorMsg = error.response?.data?.error || error.message;
          alert(`결제는 완료되었으나 주문 처리 중 오류가 발생했습니다.\n사유: ${errorMsg}\n고객센터에 문의해주세요.`);
        }
      } else {
        alert(`결제에 실패하였습니다. 사유: ${response.error_msg}`);
      }
    });
  };

  if (!cartItems) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>결제하기</h1>
        <p>안전하고 간편하게 결제를 진행하세요.</p>
      </div>

      <div className="checkout-container">
        {/* Left Section: Form inputs */}
        <div className="checkout-left">
          
          <section className="checkout-section">
            <h2>주문 상품 정보</h2>
            <div className="order-items-list">
              {cartItems.map((item) => (
                <div key={item.product._id} className="checkout-item">
                  <div className="item-img">
                    <img src={item.product.image} alt={item.product.name} />
                  </div>
                  <div className="item-info">
                    <h4>{item.product.name}</h4>
                    <p className="item-meta">수량: {item.quantity}개</p>
                  </div>
                  <div className="item-price">
                    {(item.product.price * item.quantity).toLocaleString()}원
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="checkout-section">
            <h2>배송지 정보</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>받으시는 분 *</label>
                <input type="text" name="recipientName" value={shippingAddress.recipientName} onChange={handleChange} placeholder="이름을 입력하세요" />
              </div>
              <div className="form-group">
                <label>연락처 *</label>
                <input type="text" name="recipientPhone" value={shippingAddress.recipientPhone} onChange={handleChange} placeholder="010-1234-5678" />
              </div>
              <div className="form-group full-width">
                <label>우편번호</label>
                <div className="zipcode-wrapper">
                  <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleChange} placeholder="우편번호" style={{ width: '150px' }} />
                  <button className="btn-secondary">우편번호 찾기</button>
                </div>
              </div>
              <div className="form-group full-width">
                <label>기본 주소 *</label>
                <input type="text" name="address" value={shippingAddress.address} onChange={handleChange} placeholder="기본 주소를 입력하세요" />
              </div>
              <div className="form-group full-width">
                <label>상세 주소</label>
                <input type="text" name="detailAddress" value={shippingAddress.detailAddress} onChange={handleChange} placeholder="상세 주소를 입력하세요" />
              </div>
              <div className="form-group full-width">
                <label>배송 요청사항</label>
                <select name="deliveryRequest" value={shippingAddress.deliveryRequest} onChange={handleChange}>
                  <option value="문앞에 두고 가주세요">문앞에 두고 가주세요</option>
                  <option value="경비실에 맡겨주세요">경비실에 맡겨주세요</option>
                  <option value="배송 전 연락바랍니다">배송 전 연락바랍니다</option>
                  <option value="직접 수령하겠습니다">직접 수령하겠습니다</option>
                </select>
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2>결제 수단</h2>
            <div className="payment-methods">
              <label className={`payment-method-card ${paymentMethod === '신용카드' ? 'active' : ''}`}>
                <input type="radio" name="paymentMethod" value="신용카드" checked={paymentMethod === '신용카드'} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span>신용카드</span>
              </label>
              <label className={`payment-method-card ${paymentMethod === '카카오페이' ? 'active' : ''}`}>
                <input type="radio" name="paymentMethod" value="카카오페이" checked={paymentMethod === '카카오페이'} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span>카카오페이</span>
              </label>
              <label className={`payment-method-card ${paymentMethod === '네이버페이' ? 'active' : ''}`}>
                <input type="radio" name="paymentMethod" value="네이버페이" checked={paymentMethod === '네이버페이'} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span>네이버페이</span>
              </label>
              <label className={`payment-method-card ${paymentMethod === '무통장입금' ? 'active' : ''}`}>
                <input type="radio" name="paymentMethod" value="무통장입금" checked={paymentMethod === '무통장입금'} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span>무통장입금</span>
              </label>
            </div>
          </section>

        </div>

        {/* Right Section: Sticky Summary */}
        <div className="checkout-right">
          <div className="sticky-summary">
            <h3>결제 요약</h3>
            
            <div className="summary-row">
              <span>총 상품 금액</span>
              <span>{itemsPrice.toLocaleString()}원</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>{shippingPrice === 0 ? '무료' : `+${shippingPrice.toLocaleString()}원`}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row final">
              <span>최종 결제 금액</span>
              <span className="total-amount">{totalPrice.toLocaleString()}원</span>
            </div>

            <button className="btn-pay-now" onClick={handlePayment}>
              {totalPrice.toLocaleString()}원 결제하기
            </button>

            <p className="terms-notice">
              주문 내용을 확인하였으며, 정보 제공 등에 동의합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
