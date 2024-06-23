import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../auth/AuthProvider';

const AddPatient = ({ onPatientAdded }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        patientName: '',
        moroccanId: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.patientName || !formData.moroccanId) {
            setError('Please fill in both fields.');
            return;
        }

        try {
            await addDoc(collection(db, 'appointments'), {
                patientName: formData.patientName,
                moroccanId: formData.moroccanId,
                doctorId: currentUser.uid,
                appointmentDate: null,
                done: false,
                notes: '',
                prescribedMedicine: ''
            });

            alert('Patient added successfully!');
            onPatientAdded();
            setFormData({ patientName: '', moroccanId: '' });

        } catch (error) {
            console.error("Error adding patient: ", error);
            setError('Error adding patient. Please try again later.');
        }
    };

    return (
        <Box sx={{ maxWidth: '500px', margin: 'auto', mt: 8, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
            <Typography variant="h4" mb={2} textAlign="center">Add New Patient</Typography>
            {error && <Typography color="error">{error}</Typography>}
            <form onSubmit={handleSubmit} noValidate>
                <TextField
                    fullWidth
                    label="Patient Name"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Moroccan ID"
                    name="moroccanId"
                    value={formData.moroccanId}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <Box mt={4}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Add Patient
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default AddPatient;