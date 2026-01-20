import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import PublicOrderTracking from './pages/PublicOrderTracking';
import ScratchCards from './pages/ScratchCards';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/track-order" element={<OrderTracking />} />
        <Route path="/public-tracking" element={<PublicOrderTracking />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        <Route path="/scratch-cards" element={<ScratchCards />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="/admin/menu" element={<ProtectedAdminRoute><MenuManagement /></ProtectedAdminRoute>} />
        <Route path="/admin/orders" element={<ProtectedAdminRoute><OrderManagement /></ProtectedAdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
