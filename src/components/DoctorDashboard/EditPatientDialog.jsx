import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EditPatientDialog = ({ open, handleClose, handleSave, patientData, setPatientData }) => {
    if (!patientData) {
        patientData = {
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
        };
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientData({ ...patientData, [name]: value });
    };

    const handleDateChange = (date) => {
        setPatientData({ ...patientData, dateOfBirth: date });
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Modifier le patient</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Modifier les informations du patient ci-dessous.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Nom prénom"
                    name="patientName"
                    type="text"
                    fullWidth
                    value={patientData.patientName || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="CIN"
                    name="moroccanId"
                    type="text"
                    fullWidth
                    value={patientData.moroccanId || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Groupe sanguin"
                    name="bloodGroup"
                    type="text"
                    fullWidth
                    value={patientData.bloodGroup || ''}
                    onChange={handleInputChange}
                />
                <FormControl fullWidth margin="normal">
                    <DatePicker
                        selected={patientData.dateOfBirth ? new Date(patientData.dateOfBirth.seconds ? patientData.dateOfBirth.seconds * 1000 : patientData.dateOfBirth) : null}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        customInput={<TextField />}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel>sexe</InputLabel>
                    <Select
                        name="gender"
                        value={patientData.gender || ''}
                        onChange={handleInputChange}
                    >
                        <MenuItem value="masculain">masculain</MenuItem>
                        <MenuItem value="féminin">féminin</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    margin="dense"
                    label="téléphone portable"
                    name="mobilePhone"
                    type="text"
                    fullWidth
                    value={patientData.mobilePhone || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="téléphone fix (optionnel)"
                    name="landlinePhone"
                    type="text"
                    fullWidth
                    value={patientData.landlinePhone || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Couverture sociale"
                    name="socialCoverage"
                    type="text"
                    fullWidth
                    value={patientData.socialCoverage || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Profession"
                    name="profession"
                    type="text"
                    fullWidth
                    value={patientData.profession || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Adresse ou ville"
                    name="city"
                    type="text"
                    fullWidth
                    value={patientData.city || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="personnels"
                    name="personalHistory"
                    type="text"
                    fullWidth
                    value={patientData.personalHistory || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="allergies"
                    name="allergies"
                    type="text"
                    fullWidth
                    value={patientData.allergies || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="A.chirurgicaux"
                    name="surgicalHistory"
                    type="text"
                    fullWidth
                    value={patientData.surgicalHistory || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Habitudes toxiques (alcool, fumeur...)"
                    name="toxicHabits"
                    type="text"
                    fullWidth
                    value={patientData.toxicHabits || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Traitement habituel"
                    name="regularTreatment"
                    type="text"
                    fullWidth
                    value={patientData.regularTreatment || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="A.familiaux"
                    name="familyHistory"
                    type="text"
                    fullWidth
                    value={patientData.familyHistory || ''}
                    onChange={handleInputChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">Annuler</Button>
                <Button onClick={() => handleSave(patientData)} color="primary">Enregistrer</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditPatientDialog;