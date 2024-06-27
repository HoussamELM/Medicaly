import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container, ThemeProvider, createTheme, Box } from '@mui/material';
import LandingPage from './components/LandingPage';
import BookAppointment from './components/BookAppointment';
import DoctorLogin from './components/DoctorLogin';
import DoctorDashboard from './components/DoctorDashboard/DoctorDashboard';
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
      main: '#549B8C',
    },
    secondary: {
      main: '#9c27b0',
    },
    white: {
      main: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
    },
    gray: {
      main: "#C0C0C0",
    },
    tabs: {
      main: "#000000",
      contrastText: "##000000",
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
          {/* Apply the background color to the Box */}
          <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', minWidth: "80%" }}>
            <Header />
            <div className="h-[80vh]">
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
            </div>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;