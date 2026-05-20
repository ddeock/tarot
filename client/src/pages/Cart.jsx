import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/login');
        return;
      }
      const { token } = JSON.parse(userStr);
      const res = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data) {
        setCartItems(res.data.data.items || []);
        // Check all by default
        setSelectedItems((res.data.data.items || []).map(item => item.product._id));
      }
    } catch (error) {
      console.error('장바구니 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const { token } = JSON.parse(userStr);

    try {
      // Optimistic update
      setCartItems(prev => prev.map(item =>
        item.product._id === productId ? { ...item, quantity: newQuantity } : item
      ));

      await axios.put(`${API_URL}/api/cart/items/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // trigger navbar update
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('수량 변경 실패:', error);
      fetchCart(); // Revert on failure
    }
  };

  const removeItem = async (productId) => {
    if (!window.confirm('선택하신 상품을 삭제하시겠습니까?')) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const { token } = JSON.parse(userStr);

    try {
      await axios.delete(`${API_URL}/api/cart/items/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(prev => prev.filter(item => item.product._id !== productId));
      setSelectedItems(prev => prev.filter(id => id !== productId));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('상품 삭제 실패:', error);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('장바구니를 비우시겠습니까?')) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const { token } = JSON.parse(userStr);

    try {
      await axios.delete(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems([]);
      setSelectedItems([]);
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('장바구니 비우기 실패:', error);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map(item => item.product._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (productId) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter(id => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const removeSelectedItems = async () => {
    if (selectedItems.length === 0) {
      alert('삭제할 상품을 선택해주세요.');
      return;
    }
    if (!window.confirm('선택하신 상품들을 삭제하시겠습니까?')) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const { token } = JSON.parse(userStr);

    try {
      for (const productId of selectedItems) {
        await axios.delete(`${API_URL}/api/cart/items/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setCartItems(prev => prev.filter(item => !selectedItems.includes(item.product._id)));
      setSelectedItems([]);
      window.dispatchEvent(new Event('storage'));
      alert('선택한 상품이 삭제되었습니다.');
    } catch (error) {
      console.error('선택 상품 삭제 실패:', error);
      fetchCart();
    }
  };

  // Calculations
  const FREE_SHIPPING_THRESHOLD = 0;
  const SHIPPING_FEE = 0;

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.product._id));
  const totalProductPrice = selectedCartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const currentShippingFee = 0; // 전상품 무료 배송
  const finalTotalPrice = totalProductPrice + currentShippingFee;

  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert('결제할 상품을 선택해주세요.');
      return;
    }
    navigate('/checkout', {
      state: {
        cartItems: selectedCartItems,
        itemsPrice: totalProductPrice,
        shippingPrice: currentShippingFee,
        totalPrice: finalTotalPrice
      }
    });
  };

  if (loading) return <div className="cart-loading">장바구니 정보를 불러오는 중입니다...</div>;

  return (
    <div className="cart-page">
      <h1 className="cart-title">장바구니</h1>

      <div className="cart-table-container">
        <table className="cart-table">
          <thead>
            <tr>
              <th className="th-checkbox">
                <input
                  type="checkbox"
                  checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="th-num">번호</th>
              <th className="th-img">사진</th>
              <th className="th-name">제품명</th>
              <th className="th-qty">수량</th>
              <th className="th-mileage">적립</th>
              <th className="th-price">가격</th>
              <th className="th-shipping">배송비</th>
              <th className="th-actions">취소</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-cart-msg">장바구니에 담긴 상품이 없습니다.</td>
              </tr>
            ) : (
              cartItems.map((item, index) => (
                <tr key={item.product._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.product._id)}
                      onChange={() => handleSelectItem(item.product._id)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td className="td-img">
                    <img src={item.product.image} alt={item.product.name} />
                  </td>
                  <td className="td-name">
                    <div className="product-name">{item.product.name}</div>
                    <div className="product-brand-en">{item.product.brand || 'Tarot'}</div>
                  </td>
                  <td className="td-qty">
                    <div className="qty-control">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                  </td>
                  <td className="td-mileage">500</td>
                  <td className="td-price">{(item.product.price * item.quantity).toLocaleString()}원</td>
                  <td className="td-shipping">[기본배송]<br />조건</td>
                  <td className="td-actions">
                    <button className="action-btn-small">상품수정</button>
                    <button className="action-btn-small" onClick={() => removeItem(item.product._id)}>상품삭제</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {cartItems.length > 0 && (
        <>
          <div className="cart-total-summary">
            총 구매금액 : <strong>{totalProductPrice.toLocaleString()}원</strong> + 배송료 <strong>{currentShippingFee.toLocaleString()}원</strong> = <strong className="final-price">{finalTotalPrice.toLocaleString()}원</strong>
          </div>

          <div className="cart-shipping-notice">
            <p className="highlight-notice">전상품 무료배송 혜택이 적용되었습니다!</p>
          </div>

          <button className="btn-free-shipping-rec" onClick={handleCheckout}>결제하기</button>
        </>
      )}

      <div className="cart-bottom-actions">
        <button className="btn-order" onClick={handleCheckout}>주문하기</button>
        <button className="btn-continue" onClick={() => navigate('/')}>계속쇼핑</button>
        <button className="btn-clear" onClick={clearCart}>카트비우기</button>
        <button className="btn-delete-selected" onClick={removeSelectedItems}>선택상품 삭제</button>
      </div>
    </div>
  );
};

export default Cart;
