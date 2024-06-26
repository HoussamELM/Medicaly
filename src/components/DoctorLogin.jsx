import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';

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
        <div className='h-[80vh] w-full flex justify-center items-center flex-col bg-white rounded-lg'>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <div className='flex justify-center items-center flex-col'>
                <div className='bg-gray-100 rounded-full p-4 flex flex-col justify-center items-center'>
                    <LockIcon color="primary" />
                </div>
            </div>
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
                <Box mt={2} width="100%">
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Se Connecter
                    </Button>
                </Box>
                <span className='text-xs ml-1 self-end mt-3'>Vous n'êtes pas encore membre ?<Link to="/doctor-signup" className='text-[#549B8C]'> Inscrivez-vous</Link></span>
            </form>
        </div>
    );
};

export default DoctorLogin;