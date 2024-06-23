// src/components/LandingPage.jsx
import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h3" gutterBottom>Welcome to Doctor Management System</Typography>
            <Box sx={{ mt: 4 }}>
                <Button component={Link} to="/book-appointment" variant="contained" color="primary" sx={{ mr: 2 }}>
                    Book Appointment
                </Button>
                <Button component={Link} to="/doctor-login" variant="outlined" color="primary" sx={{ mr: 2 }}>
                    Doctor Login
                </Button>
                <Button component={Link} to="/doctor-signup" variant="outlined" color="primary">
                    Doctor Signup
                </Button>
            </Box>
        </Box>
    );
};

export default LandingPage;