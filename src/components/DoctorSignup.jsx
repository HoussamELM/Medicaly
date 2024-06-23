// src/components/DoctorSignup.jsx
import React, { useState } from 'react';
import { TextField, Button, Typography, Box, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const specialties = ['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'General'];

const DoctorSignup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        specialty: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            await setDoc(doc(db, 'doctors', user.uid), {
                name: formData.name,
                specialty: formData.specialty
            });
            window.location.href = '/dashboard';
        } catch (error) {
            setError('Error creating account. Please try again.');
            console.error('Error creating doctor: ', error);
        }
    };

    return (
        <Box sx={{ maxWidth: '500px', margin: 'auto', mt: 8, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
            <Typography variant="h4" mb={2} textAlign="center">Doctor Signup</Typography>
            {error && <Typography color="error">{error}</Typography>}
            <form onSubmit={handleSubmit} noValidate>
                <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Specialty</InputLabel>
                    <Select
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        required
                    >
                        {specialties.map((specialty) => (
                            <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box mt={4}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Signup
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default DoctorSignup;