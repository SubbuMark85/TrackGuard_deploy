import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';

// Common Components
import { InvestorDemoBar } from './components/common/InvestorDemoBar';
import { TopHeader } from './components/common/TopHeader';
import { BottomNavBar } from './components/common/BottomNavBar';
import { ToastContainer } from './components/common/ToastContainer';

// Mobile Screens
import { HomePage } from './pages/HomePage';
import { FamilyTrackingPage } from './pages/FamilyTrackingPage';
import { AIPage } from './pages/AIPage';
import { NavigationPage } from './pages/NavigationPage';
import { SafetyBandPage } from './pages/SafetyBandPage';
import { TamperAlertPage } from './pages/TamperAlertPage';
import { SOSPage } from './pages/SOSPage';
import { EmergencyResponsePage } from './pages/EmergencyResponsePage';
import { TripsPage } from './pages/TripsPage';
import { ProfilePage } from './pages/ProfilePage';
import { WebDashboardPage } from './pages/WebDashboardPage';

// Embedded Login Screen Component
import { AppLoginScreen } from './components/auth/AppLoginScreen.tsx';

const MainAppContent = () => {
  const { activeScreen } = useApp();
  const { firebaseUser, loading } = useAuth();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const location = useLocation();

  const isResponderRoute = location.pathname === '/responder' || activeScreen === 'responder';

  if (isResponderRoute) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <InvestorDemoBar isFullScreen={isFullScreen} setIsFullScreen={setIsFullScreen} />
        <ToastContainer />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <WebDashboardPage />
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090D16' }}>
        <div style={{ textAlign: 'center', color: '#5BC0BE' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #5BC0BE', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spinSlow 1s linear infinite', margin: '0 auto 12px auto' }}></div>
          <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>Initializing TrackGuard Auth Session...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated with Firebase or activeScreen is login, show Login Screen inside phone frame
  if (!firebaseUser || activeScreen === 'login') {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <InvestorDemoBar isFullScreen={isFullScreen} setIsFullScreen={setIsFullScreen} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isFullScreen ? 0 : '16px 0', width: '100%' }}>
          <div className={isFullScreen ? "mobile-view-frame full-width-frame" : "mobile-view-frame"}>
            {!isFullScreen && (
              <div className="mobile-notch-bar">
                <span>9:41</span>
                <div className="notch-pill" />
                <span style={{ fontSize: '0.65rem' }}>5G ⚡ 84%</span>
              </div>
            )}
            <ToastContainer />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <AppLoginScreen />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated state -> Render active dashboard screen
  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomePage />;
      case 'family':
        return <FamilyTrackingPage />;
      case 'ai':
        return <AIPage />;
      case 'navigation':
        return <NavigationPage />;
      case 'band':
        return <SafetyBandPage />;
      case 'tamper':
        return <TamperAlertPage />;
      case 'sos':
        return <SOSPage />;
      case 'emergency':
        return <EmergencyResponsePage />;
      case 'trips':
        return <TripsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <InvestorDemoBar isFullScreen={isFullScreen} setIsFullScreen={setIsFullScreen} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isFullScreen ? 0 : '16px 0', width: '100%' }}>
        <div className={isFullScreen ? "mobile-view-frame full-width-frame" : "mobile-view-frame"}>
          {!isFullScreen && (
            <div className="mobile-notch-bar">
              <span>9:41</span>
              <div className="notch-pill" />
              <span style={{ fontSize: '0.65rem' }}>5G ⚡ 84%</span>
            </div>
          )}
          <TopHeader />
          <ToastContainer />
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {renderActiveScreen()}
          </div>
          <BottomNavBar />
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/*" element={<MainAppContent />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}

export default App;
