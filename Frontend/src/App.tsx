import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import WasteToValue from './pages/WasteToValue';
import Onboarding from './pages/Onboarding';

// Placeholder Validator/Buyer (To be ported)
// Placeholder Validator/Buyer (To be ported) - REMOVED

function AppRoutes() {
  const location = useLocation();
  const isDashboardRoute = ['/farmer-dashboard', '/validator-dashboard', '/buyer-dashboard'].includes(location.pathname);

  return (
    <Routes>
      {/* Dashboard Routes (No Layout) */}
      <Route
        path="/farmer-dashboard"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
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

      {/* Regular Routes (With Layout) */}
      <Route path="/" element={<Layout><Landing /></Layout>} />
      <Route path="/login" element={<Layout><AuthPage type="login" /></Layout>} />
      <Route path="/signup" element={<Layout><AuthPage type="signup" /></Layout>} />

      <Route
        path="/onboarding"
        element={
          <Layout>
            <ProtectedRoute allowedRoles={['farmer']}>
              <Onboarding />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/disease-detector"
        element={
          <Layout>
            <ProtectedRoute allowedRoles={['farmer']}>
              <CropDiseaseDetector />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/business-advisor"
        element={
          <Layout>
            <ProtectedRoute allowedRoles={['farmer']}>
              <BusinessAdvisor />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/green-credit"
        element={
          <Layout>
            <ProtectedRoute allowedRoles={['farmer']}>
              <GreenCredit />
            </ProtectedRoute>
          </Layout>
        }
      />

      <Route
        path="/waste-to-value"
        element={
          <Layout>
            <ProtectedRoute allowedRoles={['farmer']}>
              <WasteToValue />
            </ProtectedRoute>
          </Layout>
        }
      />
    </Routes>
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