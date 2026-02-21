import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import TripsPage from './pages/TripsPage';
import DispatchPage from './pages/DispatchPage';
import MaintenancePage from './pages/MaintenancePage';
import FuelPage from './pages/FuelPage';
import ExpensesPage from './pages/ExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/drivers" element={<DriversPage />} />
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/dispatch" element={<DispatchPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/fuel" element={<FuelPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#0f172a',
              borderRadius: '14px',
              padding: '12px 18px',
              fontSize: '13px',
              fontWeight: 500,
              border: '1px solid #f1f5f9',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
