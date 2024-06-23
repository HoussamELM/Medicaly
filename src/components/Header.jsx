// src/components/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Header = () => {
    const { currentUser } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = '/';
    };

    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Doctor Management System
                </Typography>
                {currentUser && (
                    <Box>
                        <Typography variant="body1" sx={{ display: 'inline', mr: 2 }}>
                            Signed in as {currentUser.email}
                        </Typography>
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;