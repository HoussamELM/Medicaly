import React, { useState } from 'react';
import { TextField, Button, Box, MenuItem, Select, InputLabel, FormControl, Typography, Grid, Alert } from '@mui/material';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../auth/AuthProvider';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AddPatient = ({ onPatientAdded }) => {
    const { currentUser } = useAuth();
    const [patientData, setPatientData] = useState({
        patientName: '',
        moroccanId: '',
        bloodGroup: '',
        dateOfBirth: null,
        gender: '',
        mobilePhone: '',
        landlinePhone: '',
        socialCoverage: '',
        profession: '',
        city: '',
        personalHistory: '',
        allergies: '',
        surgicalHistory: '',
        toxicHabits: '',
        regularTreatment: '',
        familyHistory: '',
    });
    const [successMessage, setSuccessMessage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientData({ ...patientData, [name]: value });
    };

    const handleDateChange = (date) => {
        setPatientData({ ...patientData, dateOfBirth: date });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await addDoc(collection(db, 'patients'), {
                ...patientData,
                doctorId: currentUser.uid,
                dateOfBirth: patientData.dateOfBirth ? Timestamp.fromDate(patientData.dateOfBirth) : null,
                dateRecorded: Timestamp.fromDate(new Date())
            });

            // Show success message
            setSuccessMessage('Patient ajouté avec succès !');
            
            // Refresh the page after a short delay
            setTimeout(() => {
                onPatientAdded();
                window.location.reload(); // Reload the page
            }, 2000); // 2 seconds

        } catch (error) {
            console.error('Erreur lors de l\'ajout du patient:', error);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {successMessage && <Alert severity="success">{successMessage}</Alert>}
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        label="Nom prénom"
                        name="patientName"
                        value={patientData.patientName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="CIN"
                        name="moroccanId"
                        value={patientData.moroccanId}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Groupe sanguin"
                        name="bloodGroup"
                        value={patientData.bloodGroup}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12} width="100%">
                    <FormControl fullWidth margin="normal" width="100%">
                        <DatePicker
                            selected={patientData.dateOfBirth}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={100}
                            customInput={<TextField />}
                            fullWidth
                            className='w-full'
                            placeholderText='Date de naissance'
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>sexe</InputLabel>
                        <Select
                            name="gender"
                            value={patientData.gender}
                            onChange={handleInputChange}
                            fullWidth
                        >
                            <MenuItem value="masculain">masculain</MenuItem>
                            <MenuItem value="féminin">féminin</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="téléphone portable"
                        name="mobilePhone"
                        value={patientData.mobilePhone}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="téléphone fix (optionnel)"
                        name="landlinePhone"
                        value={patientData.landlinePhone}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Couverture sociale"
                        name="socialCoverage"
                        value={patientData.socialCoverage}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Profession"
                        name="profession"
                        value={patientData.profession}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Adresse ou ville"
                        name="city"
                        value={patientData.city}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2 }}>Antécédents du patient:</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="personnels"
                        name="personalHistory"
                        value={patientData.personalHistory}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="allergies"
                        name="allergies"
                        value={patientData.allergies}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="A.chirurgicaux"
                        name="surgicalHistory"
                        value={patientData.surgicalHistory}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Habitudes toxiques (alcool, fumeur...)"
                        name="toxicHabits"
                        value={patientData.toxicHabits}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Traitement habituel"
                        name="regularTreatment"
                        value={patientData.regularTreatment}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="A.familiaux"
                        name="familyHistory"
                        value={patientData.familyHistory}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Ajouter Patient
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AddPatient;