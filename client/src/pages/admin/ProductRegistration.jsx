import React, { useState } from 'react';
import {
  ArrowLeft,
  LayoutDashboard,
  Package,
  Info,
  DollarSign,
  Image as ImageIcon,
  PlusCircle,
  Tag,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductRegistration.css';

const ProductRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    description: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    minStockAlert: 10,
    onSale: false,
    tags: '',
    weight: 0,
    brand: '',
    isActive: true
  });

  const [images, setImages] = useState([]);

  // Cloudinary settings from environment variables
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleOpenWidget = () => {
    if (!window.cloudinary) {
      alert('Cloudinary widget is not loaded');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        multiple: true,
        maxFiles: 5,
        sources: ['local', 'url', 'camera']
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setImages((prev) => [...prev, result.info.secure_url]);
        }
      }
    );
    widget.open();
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert('최소 하나 이상의 이미지를 업로드해주세요.');
      return;
    }

    const productData = {
      ...formData,
      image: images[0],
      images: images
    };

    try {
      const response = await axios.post('http://localhost:5000/api/products', productData);

      if (response.data.success) {
        alert('상품이 성공적으로 등록되었습니다!');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error registering product:', error);
      alert(error.response?.data?.error || '상품 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="registration-container">
      <header className="registration-header">
        <div className="header-nav">
          <button onClick={() => navigate(-1)} className="back-link">
            <ArrowLeft size={20} />
            <span>뒤로가기</span>
          </button>
          <div className="breadcrumb">
            <LayoutDashboard size={16} />
            <span>관리자</span>
            <span className="separator">/</span>
            <Package size={16} />
            <span>상품 등록</span>
          </div>
        </div>
        <div className="header-title-area">
          <h1>새 상품 등록</h1>
          <p>새로운 상품의 정보를 입력하세요. <span className="required-mark">*</span> 표시는 필수 항목입니다.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="registration-form">
        {/* 기본 정보 */}
        <section className="form-section">
          <div className="section-header">
            <Info size={20} className="section-icon" />
            <h2>기본 정보</h2>
          </div>
          <div className="section-body">
            <div className="form-group full">
              <label>상품명 <span className="required-mark">*</span></label>
              <input
                type="text"
                name="name"
                placeholder="상품명을 입력하세요"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>카테고리 <span className="required-mark">*</span></label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">카테고리 선택</option>
                  <option value="카드">카드</option>
                  <option value="악세사리">악세사리</option>
                </select>
              </div>
              <div className="form-group">
                <label>SKU (상품 코드)</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="sku"
                    placeholder="SKU-001"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="form-group full">
              <label>상품 설명</label>
              <textarea
                name="description"
                placeholder="상품에 대한 자세한 설명을 입력하세요"
                rows="4"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </section>

        {/* 가격 및 재고 */}
        <section className="form-section">
          <div className="section-header">
            <DollarSign size={20} className="section-icon" />
            <h2>가격 및 재고</h2>
          </div>
          <div className="section-body">
            <div className="form-row">
              <div className="form-group">
                <label>판매가 <span className="required-mark">*</span></label>
                <div className="input-with-icon">
                  <span className="input-prefix">₩</span>
                  <input
                    type="number"
                    name="price"
                    placeholder="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>정가 (할인 전 가격)</label>
                <div className="input-with-icon">
                  <span className="input-prefix">₩</span>
                  <input
                    type="number"
                    name="originalPrice"
                    placeholder="0"
                    value={formData.originalPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>재고 수량 <span className="required-mark">*</span></label>
                <input
                  type="number"
                  name="stock"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>최소 재고 알림</label>
                <input
                  type="number"
                  name="minStockAlert"
                  placeholder="10"
                  value={formData.minStockAlert}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group toggle-group">
              <div className="toggle-info">
                <label>할인 중</label>
                <span>이 상품에 할인은 적용됩니다</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  name="onSale"
                  checked={formData.onSale}
                  onChange={handleChange}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </section>

        {/* 상품 이미지 */}
        <section className="form-section">
          <div className="section-header">
            <ImageIcon size={20} className="section-icon" />
            <h2>상품 이미지</h2>
          </div>
          <div className="section-body">
            <div className="image-upload-grid">
              {images.map((url, index) => (
                <div key={index} className="image-preview-box">
                  <img src={url} alt={`Preview ${index}`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    <PlusCircle size={16} style={{ transform: 'rotate(45deg)' }} />
                  </button>
                  {index === 0 && <span className="main-badge">대표</span>}
                </div>
              ))}

              {images.length < 5 && (
                <div className="image-upload-box main" onClick={handleOpenWidget}>
                  <PlusCircle size={32} />
                  <span>이미지 추가</span>
                </div>
              )}
            </div>
            <p className="upload-hint">최대 5장까지 업로드 가능합니다. 첫 번째 이미지가 대표 이미지로 설정됩니다.</p>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="prod-reg-submit-btn">상품 등록</button>
        </div>
      </form>
    </div>
  );
};

export default ProductRegistration;
