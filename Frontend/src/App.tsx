import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
// New Pages & Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import FarmerDashboard from './pages/FarmerDashboard';
import CropDiseaseDetector from './pages/CropDiseaseDetector';
import BusinessAdvisor from './pages/BusinessAdvisor';
import GreenCredit from './pages/GreenCredit';
import ValidatorDashboard from './pages/ValidatorDashboard'; // New
import BuyerDashboard from './pages/BuyerDashboard';         // New

// Placeholder Validator/Buyer (To be ported)
// Placeholder Validator/Buyer (To be ported) - REMOVED

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPage type="login" />} />
        <Route path="/signup" element={<AuthPage type="signup" />} />

        {/* Protected Routes */}
        <Route
          path="/farmer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/disease-detector"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <CropDiseaseDetector />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business-advisor"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <BusinessAdvisor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/green-credit"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <GreenCredit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/validator-dashboard"
          element={
            <ProtectedRoute allowedRoles={['validator']}>
              <ValidatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

import { BlockchainProvider } from './contexts/BlockchainContext';

export default function App() {
  return (
    <Router>
      <BlockchainProvider>
        <AppProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </AppProvider>
      </BlockchainProvider>
    </Router>
  );
}