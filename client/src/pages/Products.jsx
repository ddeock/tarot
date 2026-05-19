import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ShoppingCart } from 'lucide-react';
import './Products.css';
import heroBg from '../assets/hero_bg.png';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // URL에서 카테고리 쿼리 파라미터 읽기 (예: ?category=카드)
  const searchParams = new URLSearchParams(location.search);
  const categoryQuery = searchParams.get('category');

  const activeCategory = categoryQuery || '전체';

  const categories = [
    { name: '전체', value: '전체' },
    { name: '타로카드', value: '카드' },
    { name: '악세사리', value: '악세사리' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data.success) {
          let fetchedProducts = response.data.data;

          // 카테고리 필터링
          if (activeCategory !== '전체') {
            fetchedProducts = fetchedProducts.filter(p => p.category === activeCategory);
          }

          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  const handleCategoryClick = (value) => {
    if (value === '전체') {
      navigate('/products');
    } else {
      navigate(`/products?category=${value}`);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/300x400';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="products-page">
      {/* Top Banner */}
      <div
        className="products-banner"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="products-banner-content">
          <h1>오후의 타로 {activeCategory === '카드' ? '타로카드' : activeCategory === '전체' ? '전체상품' : activeCategory}</h1>
          <p>{activeCategory === '카드' ? 'TAROT DECK' : 'COLLECTION'}</p>
        </div>
      </div>

      <div className="products-container">
        {/* Left Sidebar */}
        <aside className="products-sidebar">
          <h2 className="sidebar-title">오후의 타로</h2>
          <ul className="sidebar-menu">
            {categories.map((cat) => (
              <li key={cat.value}>
                <button
                  className={activeCategory === cat.value ? 'active' : ''}
                  onClick={() => handleCategoryClick(cat.value)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right Grid */}
        <main className="products-grid-container">
          {loading ? (
            <div className="empty-message">상품을 불러오는 중입니다...</div>
          ) : products.length === 0 ? (
            <div className="empty-message">등록된 상품이 없습니다.</div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <Link to={`/product/${product._id}`} key={product._id} className="product-card">
                  <div className="product-image-wrapper">
                    <img src={getImageUrl(product.image)} alt={product.name} />

                    {/* Badges (Mock based on condition or random for UI representation) */}
                    <div className="badges">
                      {product.stock > 0 && product.stock < 10 && <span className="badge hot">HOT</span>}
                      {product.price >= 50000 && <span className="badge free">무료배송</span>}
                      {product.onSale && <span className="badge best">BEST</span>}
                      {new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && <span className="badge new">NEW</span>}
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          // TODO: 찜하기 로직
                          alert('준비중입니다.');
                        }}
                      >
                        <Heart size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          // TODO: 장바구니 담기 로직
                          alert('상세페이지에서 담아주세요.');
                        }}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">
                      {product.price.toLocaleString()}원
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer style={{ background: '#333', color: '#fff', padding: '20px', textAlign: 'center', fontSize: '0.8rem' }}>
        <p>© 2026 오후의 타로 All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Products;
