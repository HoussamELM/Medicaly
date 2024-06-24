import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link } from 'react-router-dom';

const DoctorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous error message
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard'); // Redirect to dashboard after successful login
        } catch (err) {
            handleAuthError(err.code);
        }
    };

    const handleAuthError = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-email':
                setError('The email address is badly formatted.');
                break;
            case 'auth/user-disabled':
                setError('This user has been disabled.');
                break;
            case 'auth/user-not-found':
                setError('There is no user record corresponding to this identifier.');
                break;
            case 'auth/wrong-password':
                setError('The password is invalid or the user does not have a password.');
                break;
            default:
                setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <Box sx={{ maxWidth: '500px', margin: 'auto', mt: 8, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
            <Typography variant="h4" mb={2} textAlign="center">Connection Docteur</Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <form onSubmit={handleLogin} noValidate>
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Mot de Passe"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                />
                <span className='text-xs ml-1'>Vous n'êtes pas encore membre ?<Link to="/doctor-signup" className='text-[#549B8C]'> Inscrivez-vous</Link></span>
                <Box mt={4}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Se Connecter
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default DoctorLogin;