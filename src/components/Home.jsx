// src/components/Home.jsx
import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h2" gutterBottom>Doctor Management System</Typography>
            <Button
                component={Link}
                to="/book-appointment"
                variant="contained"
                color="primary"
            >
                Book Appointment
            </Button>
        </Box>
    );
};

export default Home;