import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import './Register.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    user_type: '사용자',
    birthYear: '1990',
    birthMonth: '',
    birthDay: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const { birthYear, birthMonth, birthDay, confirmPassword, ...rest } = formData;
      const birthdate = new Date(`${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`);
      
      const payload = {
        ...rest,
        birthdate: birthdate.toISOString(),
      };

      const response = await axios.post(`${API_URL}/api/users`, payload);
      
      if (response.data.success) {
        alert('회원가입이 완료되었습니다!');
        navigate('/');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.response?.data?.error || '회원가입 중 오류가 발생했습니다.');
    }
  };

  const years = Array.from({ length: 100 }, (_, i) => 2024 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1 className="register-title">회원가입</h1>
        <div className="input-group-stacked">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호 (4자 이상)"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="비밀번호 확인 (4자 이상)"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-section">
          <label className="section-label">이름 <span className="required">*</span></label>
          <input
            type="text"
            name="name"
            placeholder="이름을(를) 입력하세요"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-section">
          <label className="section-label">연락처 <span className="required">*</span></label>
          <input
            type="text"
            name="phone"
            placeholder="연락처"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-section">
          <label className="section-label">생년월일</label>
          <div className="birthdate-group">
            <div className="select-wrapper">
              <select name="birthYear" value={formData.birthYear} onChange={handleChange}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="select-wrapper">
              <select name="birthMonth" value={formData.birthMonth} onChange={handleChange}>
                <option value="">월</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="select-wrapper">
              <select name="birthDay" value={formData.birthDay} onChange={handleChange}>
                <option value="">일</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn">가입하기</button>
      </form>
    </div>
  );
}

export default Register;
