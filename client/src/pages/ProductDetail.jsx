import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ChevronDown, Minus, Plus, ShoppingCart, CreditCard } from 'lucide-react';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('detail');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // First try the backend
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.data);
        }
      } catch (err) {
        // Fallback to mock data if it's from the Best Sellers on Home
        // In a real app we'd handle this better, but we have mixed mock/DB products on Home
        const bestSellers = [
          { id: '1', name: 'THE STARCHILD TAROT', brand: 'Danielle Noel', price: 78000, image: 'https://images.unsplash.com/photo-1601024445121-e5b82f121a71?auto=format&fit=crop&q=80&w=600&h=800', description: '스타차일드 타로는 아름답고 신비로운 우주의 에너지를 담은 덱입니다.' },
          { id: '2', name: 'RIDER WAITE TAROT', brand: 'Arthur Edward Waite', price: 32000, image: 'https://images.unsplash.com/photo-1635332511475-4c07c1303102?auto=format&fit=crop&q=80&w=600&h=800', description: '클래식한 라이더 웨이트 타로입니다.' },
          { id: '3', name: 'THE LIGHT SEER\'S TAROT', brand: 'Chris-Anne', price: 33000, image: 'https://images.unsplash.com/photo-1590424768472-391807664687?auto=format&fit=crop&q=80&w=600&h=800', description: '빛의 에너지를 담은 현대적인 타로 덱입니다.' },
          { id: '4', name: 'THE WILD UNKNOWN TAROT', brand: 'Kim Krans', price: 45000, image: 'https://images.unsplash.com/photo-1615147342761-9238e15d8b96?auto=format&fit=crop&q=80&w=600&h=800', description: '자연과 동물의 원형을 담은 신비로운 덱입니다.' },
          { id: '5', name: 'SHADOWSCAPES TAROT', brand: 'Stephanie Pui-Mun Law', price: 68000, image: 'https://images.unsplash.com/photo-1590424768314-5d336829707b?auto=format&fit=crop&q=80&w=600&h=800', description: '섬세한 수채화풍의 아름다운 타로 덱입니다.' },
        ];

        const mockProduct = bestSellers.find(p => p.id === id);
        if (mockProduct) {
          setProduct(mockProduct);
        } else {
          setError('상품을 찾을 수 없습니다.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (type) => {
    if (type === 'decrease' && quantity > 1) {
      setQuantity(q => q - 1);
    } else if (type === 'increase') {
      setQuantity(q => q + 1);
    }
  };

  const handleAddToCart = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    
    // For mock products from Best Sellers that don't have MongoDB ObjectIds
    const productId = product._id || product.id;
    
    // Very basic check if it's a mock ID (e.g., '1', '2') instead of 24-char hex
    if (productId.length < 24) {
      alert('이 상품은 미리보기용 데모 상품입니다 (DB 미존재). 실제 상품을 등록 후 이용해주세요.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/cart',
        {
          productId: productId,
          quantity: quantity
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      if (response.data.success) {
        window.dispatchEvent(new Event('storage'));
        if (window.confirm('장바구니에 상품이 성공적으로 담겼습니다.\n장바구니 페이지로 이동하시겠습니까?')) {
          navigate('/cart');
        }
      }
    } catch (error) {
      console.error('장바구니 담기 오류:', error);
      alert(error.response?.data?.error || '장바구니 담기 중 오류가 발생했습니다.');
    }
  };

  const handleBuyNow = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    const productId = product._id || product.id;
    if (productId.length < 24) {
      alert('이 상품은 미리보기용 데모 상품입니다 (DB 미존재). 실제 상품을 등록 후 이용해주세요.');
      return;
    }

    const itemsPrice = product.price * quantity;
    const shippingPrice = itemsPrice >= 50000 ? 0 : 3000;
    const totalPrice = itemsPrice + shippingPrice;

    const cartItems = [{
      product: product,
      quantity: quantity
    }];

    navigate('/checkout', { 
      state: { 
        cartItems, 
        itemsPrice, 
        shippingPrice, 
        totalPrice 
      } 
    });
  };

  if (loading) return <div className="product-detail-loading">상품 정보를 불러오는 중입니다...</div>;
  if (error || !product) return <div className="product-detail-error">{error || '상품이 존재하지 않습니다.'}</div>;

  const totalPrice = product.price * quantity;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">

        {/* Top Section */}
        <div className="product-top-section">
          {/* Images */}
          <div className="product-gallery">
            <div className="main-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="thumbnail-list">
              <div className="thumbnail active">
                <img src={product.image} alt="thumb" />
              </div>
              {/* If we had more images, they would go here */}
            </div>
          </div>

          {/* Info & Purchase Form */}
          <div className="product-info-panel">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-brand">{product.brand || 'Tarot'}</p>
            <div className="product-price-row">
              <span className="price-value">{product.price.toLocaleString()}</span>
              <span className="price-currency">원</span>
            </div>

            <div className="product-meta-list">
              <div className="meta-item">
                <span className="meta-label">배송정보</span>
                <span className="meta-value">전상품 무료배송</span>
              </div>
            </div>

            <div className="product-options">
              <div className="quantity-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.95rem', color: '#495057', fontWeight: '500' }}>상품 구매 수량</label>
                <div className="quantity-control">
                  <button onClick={() => handleQuantityChange('decrease')}><Minus size={14} /></button>
                  <input type="text" value={quantity} readOnly />
                  <button onClick={() => handleQuantityChange('increase')}><Plus size={14} /></button>
                </div>
              </div>
            </div>

            <div className="total-price-row">
              <span>총 상품금액</span>
              <span className="total-value">{totalPrice.toLocaleString()}원</span>
            </div>

            <div className="action-buttons">
              <button className="btn-wishlist">
                <Heart size={24} />
              </button>
              <button className="btn-cart" onClick={handleAddToCart}>장바구니</button>
              <button className="btn-buy" onClick={handleBuyNow}>구매하기</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Content Section */}
      <div className="product-content-section">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('detail')}
          >
            상세정보
          </button>
          <button
            className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            리뷰 (0)
          </button>
          <button
            className={`tab-btn ${activeTab === 'qna' ? 'active' : ''}`}
            onClick={() => setActiveTab('qna')}
          >
            Q&A
          </button>
          <button
            className={`tab-btn ${activeTab === 'policy' ? 'active' : ''}`}
            onClick={() => setActiveTab('policy')}
          >
            반품/교환정보
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'detail' && (
            <div className="detail-content-area">
              {product.description && (
                <div className="product-description-text">
                  {product.description}
                </div>
              )}
              {/* Mocking long image scroll with the product image repeated for design purpose */}
              <div className="long-detail-images">
                <img src={product.image} alt="Detail 1" />
                <img src={product.image} alt="Detail 2" />
                <img src={product.image} alt="Detail 3" />
              </div>
            </div>
          )}
          {activeTab === 'review' && <div className="placeholder-text">등록된 리뷰가 없습니다.</div>}
          {activeTab === 'qna' && <div className="placeholder-text">등록된 문의가 없습니다.</div>}
          {activeTab === 'policy' && <div className="placeholder-text">반품 및 교환 관련 정책 안내입니다.</div>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
