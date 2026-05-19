import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import TarotSpread from './components/TarotSpread';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductRegistration from './pages/admin/ProductRegistration';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import './App.css';

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tarot" element={<TarotSpread />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/success/:id" element={<OrderSuccess />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/products/new" element={<ProductRegistration />} />
        <Route path="/admin/products/edit/:id" element={<ProductRegistration />} />
      </Routes>
    </>
  );
}

export default App
