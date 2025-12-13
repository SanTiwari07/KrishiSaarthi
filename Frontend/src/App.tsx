import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import RoleSelectionLogin from './components/RoleSelectionLogin';
import FarmerSignup from './components/FarmerSignup';
import FarmerDashboard from './components/FarmerDashboard';
import CropDiseaseDetector from './components/CropDiseaseDetector';
import BusinessAdvisor from './components/BusinessAdvisor';
import GreenCredit from './components/GreenCredit';
import ValidatorDashboard from './components/ValidatorDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import Profile from './components/Profile';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useApp();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useApp();
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role}-dashboard`} /> : <LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/role-login" element={<RoleSelectionLogin />} />
      <Route path="/farmer-signup" element={<FarmerSignup />} />
      
      {/* Farmer Routes */}
      <Route path="/farmer-dashboard" element={
        <ProtectedRoute allowedRoles={['farmer']}>
          <FarmerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/crop-disease" element={
        <ProtectedRoute allowedRoles={['farmer']}>
          <CropDiseaseDetector />
        </ProtectedRoute>
      } />
      <Route path="/business-advisor" element={
        <ProtectedRoute allowedRoles={['farmer']}>
          <BusinessAdvisor />
        </ProtectedRoute>
      } />
      <Route path="/green-credit" element={
        <ProtectedRoute allowedRoles={['farmer']}>
          <GreenCredit />
        </ProtectedRoute>
      } />
      
      {/* Validator Routes */}
      <Route path="/validator-dashboard" element={
        <ProtectedRoute allowedRoles={['validator']}>
          <ValidatorDashboard />
        </ProtectedRoute>
      } />
      
      {/* Buyer Routes */}
      <Route path="/buyer-dashboard" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <BuyerDashboard />
        </ProtectedRoute>
      } />
      
      {/* Common Routes */}
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['farmer', 'validator', 'buyer']}>
          <Profile />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AppProvider>
    </Router>
  );
}