import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { OrganizationProvider, useOrganization } from './hooks/useOrganization';
import { InventoryProvider } from './hooks/useInventory';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Login } from './features/auth/Login';
import { Signup } from './features/auth/Signup';
import { DashboardHome } from './features/dashboard/DashboardHome';
import { ProductList } from './features/products/ProductList';
import { OrderManager } from './features/orders/OrderManager';
import { OnboardingWizard } from './features/onboarding/OnboardingWizard';
import { AnalyticsView } from './features/analytics/AnalyticsView';
import { InvoiceList } from './features/invoices/InvoiceList';
import { StaffManagement } from './features/settings/StaffManagement'; // Updated Path
import { BillingDashboard } from './features/billing/BillingDashboard';
import { SettingsView } from './features/settings/SettingsView';
import { STORAGE_KEY_THEME } from './constants';
import { BeginnerGuide } from './features/onboarding/BeginnerGuide';
import { CreateBusiness } from './features/onboarding/CreateBusiness'; // New Import

import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { PortalApp } from './features/portal/PortalApp';

const AdminApp: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: orgLoading } = useOrganization();
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setShowSignup(false);
    }
    setCurrentPath('dashboard');
  }, [user?.id, !!user]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_THEME, next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  if (authLoading || orgLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return showSignup
      ? <Signup onToggleForm={() => setShowSignup(false)} />
      : <Login onToggleForm={() => setShowSignup(true)} />;
  }

  // GUARD 1: Business Must Exist
  if (!user.businessId) {
    return <CreateBusiness />;
  }

  // GUARD 2: Onboarding Tour (Optional)
  if (!user.hasCompletedOnboarding) {
    return <BeginnerGuide onComplete={() => setCurrentPath('products')} />;
  }

  const renderContent = () => {
    switch (currentPath) {
      case 'dashboard':
        return <DashboardHome onNavigate={setCurrentPath} />;
      case 'products':
        return <ProductList />;
      case 'orders':
        return <OrderManager onNavigate={setCurrentPath} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'invoices':
        return <InvoiceList />;
      case 'staff':
        return <StaffManagement />;
      case 'billing':
        return <BillingDashboard />;
      case 'settings':
        return <SettingsView />;
      case 'guide':
        return <BeginnerGuide onComplete={() => setCurrentPath('products')} />;
      case 'wizard':
        return <OnboardingWizard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-background dark:bg-gray-950">
      <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />
      <main className="flex-1 ml-64">
        <Topbar isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/portal/:businessId/*" element={<PortalApp />} />
      <Route path="/*" element={
        <AuthProvider>
          <OrganizationProvider>
            <InventoryProvider>
              <AdminApp />
            </InventoryProvider>
          </OrganizationProvider>
        </AuthProvider>
      } />
    </Routes>
  </Router>
);

export default App;
