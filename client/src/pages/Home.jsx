import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  ChevronRight,
  Truck,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Hash
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

// Import images for reliable background rendering
import heroBg from '../assets/hero_bg.png';
import newArrivalsBg from '../assets/new_arrivals_banner.png';
import accessoriesBg from '../assets/accessories_banner.png';

// Mock data for Best Sellers
const bestSellers = [
  { id: 1, name: 'THE STARCHILD TAROT', brand: 'Danielle Noel', price: 78000, image: 'https://images.unsplash.com/photo-1601024445121-e5b82f121a71?auto=format&fit=crop&q=80&w=300&h=400' },
  { id: 2, name: 'RIDER WAITE TAROT', brand: 'Arthur Edward Waite', price: 32000, image: 'https://images.unsplash.com/photo-1635332511475-4c07c1303102?auto=format&fit=crop&q=80&w=300&h=400' },
  { id: 3, name: 'THE LIGHT SEER\'S TAROT', brand: 'Chris-Anne', price: 33000, image: 'https://images.unsplash.com/photo-1590424768472-391807664687?auto=format&fit=crop&q=80&w=300&h=400' },
  { id: 4, name: 'THE WILD UNKNOWN TAROT', brand: 'Kim Krans', price: 45000, image: 'https://images.unsplash.com/photo-1615147342761-9238e15d8b96?auto=format&fit=crop&q=80&w=300&h=400' },
  { id: 5, name: 'SHADOWSCAPES TAROT', brand: 'Stephanie Pui-Mun Law', price: 68000, image: 'https://images.unsplash.com/photo-1590424768314-5d336829707b?auto=format&fit=crop&q=80&w=300&h=400' },
];

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data.success && response.data.data.length > 0) {
          setProducts(response.data.data.slice(0, 5));
        } else {
          setProducts(bestSellers);
        }
      } catch (error) {
        setProducts(bestSellers);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${heroBg})` }}>
        <div className="hero-content">
          <h1 className="hero-title">Discover<br />What's Within</h1>
          <p className="hero-subtitle">
            당신의 직관이 이끄는 순간.<br />
            타로는 더 깊은 이야기를 들려줍니다.
          </p>
          <button className="hero-cta">
            SHOP TAROT DECKS <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="section best-sellers">
        <h2 className="section-title">BEST SELLERS</h2>
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id || product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <button className="wishlist-btn"><Heart size={18} /></button>
                <div className="badge">BEST</div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-brand">{product.brand || 'PrimeMuse'}</p>
                <p className="product-price">₩ {product.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Banners */}
      <section className="promo-section">
        <div className="promo-banner new-arrivals" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${newArrivalsBg})` }}>
          <div className="promo-content">
            <h3>NEW ARRIVALS</h3>
            <p>새롭게 입고된 타로와 오라클을<br />가장 먼저 만나보세요.</p>
            <Link to="/products" className="promo-link">VIEW ALL <ChevronRight size={16} /></Link>
          </div>
        </div>
        <div className="promo-banner accessories" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${accessoriesBg})` }}>
          <div className="promo-content">
            <h3>TAROT ACCESSORIES</h3>
            <p>타로 리딩을 더욱 특별하게 만들어 줄<br />다양한 액세서리를 만나보세요.</p>
            <button className="promo-btn">SHOP NOW <ChevronRight size={16} /></button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2026 All rights reserved.</p>
          <div className="footer-links">
            <span>이용약관</span>
            <span>개인정보처리방침</span>
            <span>위치기반서비스 이용약관</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
