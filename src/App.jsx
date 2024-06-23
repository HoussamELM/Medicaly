import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container, ThemeProvider, createTheme } from '@mui/material';
import LandingPage from './components/LandingPage';
import BookAppointment from './components/BookAppointment';
import DoctorLogin from './components/DoctorLogin';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorSignup from './components/DoctorSignup';
import Home from './components/Home';
import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import RedirectIfAuthenticated from './auth/RedirectIfAuthenticated';
import Header from './components/Header';
import './styles.css'; // Import global styles

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header />
          <Container maxWidth="md">
            <Routes>
              <Route
                path="/"
                element={
                  <RedirectIfAuthenticated>
                    <LandingPage />
                  </RedirectIfAuthenticated>
                }
              />
              <Route
                path="/book-appointment"
                element={
                  <RedirectIfAuthenticated>
                    <BookAppointment />
                  </RedirectIfAuthenticated>
                }
              />
              <Route
                path="/doctor-login"
                element={
                  <RedirectIfAuthenticated>
                    <DoctorLogin />
                  </RedirectIfAuthenticated>
                }
              />
              <Route
                path="/doctor-signup"
                element={
                  <RedirectIfAuthenticated>
                    <DoctorSignup />
                  </RedirectIfAuthenticated>
                }
              />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;