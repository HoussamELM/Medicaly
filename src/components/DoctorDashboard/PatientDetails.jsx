// src/components/DoctorDashboard/PatientDetails.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Checkbox, Divider, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ArrowBack, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../auth/AuthProvider';
import { timestampToDate, dateToTimestamp, formatDateForInput, formatDateTimeForInput } from '../../utils/DateUtils';

const PatientDetails = ({ moroccanId, onBack }) => {
    const { currentUser } = useAuth();
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editablePatient, setEditablePatient] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const fetchPatientDetails = async () => {
            try {
                const docRef = doc(db, 'patients', moroccanId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const patientData = docSnap.data();
                    setPatient({ id: docSnap.id, ...patientData });
                    setEditablePatient({ id: docSnap.id, ...patientData });
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error('Error fetching patient details: ', error);
            }
        };

        const fetchAppointments = async () => {
            try {
                const q = query(collection(db, 'appointments'), where('moroccanId', '==', moroccanId), where('doctorId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
                const appointmentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAppointments(appointmentsList);
            } catch (error) {
                console.error('Error fetching appointments: ', error);
            }
        };

        fetchPatientDetails();
        fetchAppointments();
    }, [moroccanId, currentUser]);

    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment);
        setOpenDialog(true);
    };

    const handleSaveAppointment = async () => {
        if (selectedAppointment) {
            try {
                const appointmentRef = doc(db, 'appointments', selectedAppointment.id);
                await updateDoc(appointmentRef, {
                    ...selectedAppointment,
                    appointmentDate: dateToTimestamp(selectedAppointment.appointmentDate)
                });
                setAppointments(appointments.map(app => app.id === selectedAppointment.id ? selectedAppointment : app));
                setOpenDialog(false);
            } catch (error) {
                console.error('Error updating appointment:', error);
            }
        }
    };

    const handleSavePatient = async () => {
        if (editablePatient) {
            try {
                const patientRef = doc(db, 'patients', editablePatient.id);
                await updateDoc(patientRef, {
                    patientName: editablePatient.patientName,
                    bloodGroup: editablePatient.bloodGroup,
                    dateOfBirth: dateToTimestamp(editablePatient.dateOfBirth),
                    gender: editablePatient.gender,
                    mobilePhone: editablePatient.mobilePhone,
                    landlinePhone: editablePatient.landlinePhone,
                    socialCoverage: editablePatient.socialCoverage,
                    profession: editablePatient.profession,
                    city: editablePatient.city,
                    personalHistory: editablePatient.personalHistory,
                    allergies: editablePatient.allergies,
                    surgicalHistory: editablePatient.surgicalHistory,
                    toxicHabits: editablePatient.toxicHabits,
                    regularTreatment: editablePatient.regularTreatment,
                    familyHistory: editablePatient.familyHistory,
                });
                setPatient(editablePatient);
                setEditMode(false);
            } catch (error) {
                console.error('Error updating patient:', error);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditablePatient(patient);
        setEditMode(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditablePatient({ ...editablePatient, [name]: value });
    };

    return (
        <Box sx={{ mt: 8 }}>
            <IconButton onClick={onBack}>
                <ArrowBack />
            </IconButton>
            <Typography variant="h4" mb={2} textAlign="center">Détails du patient</Typography>
            {patient && (
                <Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Box>
                                <Typography variant="h6">Informations de base</Typography>
                                {editMode ? (
                                    <>
                                        <TextField label="Nom Prénom" name="patientName" fullWidth margin="normal" value={editablePatient.patientName} onChange={handleChange} />
                                        <TextField label="CIN" name="moroccanId" fullWidth margin="normal" value={editablePatient.moroccanId} disabled />
                                        <TextField label="Date de naissance" name="dateOfBirth" type="date" fullWidth margin="normal" value={formatDateForInput(timestampToDate(editablePatient.dateOfBirth))} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                                        <TextField label="Âge" name="age" fullWidth margin="normal" value={editablePatient.dateOfBirth ? new Date().getFullYear() - new Date(editablePatient.dateOfBirth.seconds * 1000).getFullYear() : 'N/A'} disabled />
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Sexe</InputLabel>
                                            <Select name="gender" value={editablePatient.gender} onChange={handleChange}>
                                                <MenuItem value="masculain">Masculain</MenuItem>
                                                <MenuItem value="féminin">Féminin</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField label="Groupe sanguin" name="bloodGroup" fullWidth margin="normal" value={editablePatient.bloodGroup} onChange={handleChange} />
                                        <TextField label="Profession" name="profession" fullWidth margin="normal" value={editablePatient.profession} onChange={handleChange} />
                                        <TextField label="Adresse" name="city" fullWidth margin="normal" value={editablePatient.city} onChange={handleChange} />
                                        <TextField label="Couverture sociale" name="socialCoverage" fullWidth margin="normal" value={editablePatient.socialCoverage} onChange={handleChange} />
                                    </>
                                ) : (
                                    <>
                                        <Typography><strong>Nom Prénom:</strong> {patient.patientName}</Typography>
                                        <Typography><strong>CIN:</strong> {patient.moroccanId}</Typography>
                                        <Typography><strong>Date de naissance:</strong> {timestampToDate(patient.dateOfBirth)?.toLocaleDateString()}</Typography>
                                        <Typography><strong>Âge:</strong> {patient.dateOfBirth ? new Date().getFullYear() - timestampToDate(patient.dateOfBirth).getFullYear() : 'N/A'}</Typography>
                                        <Typography><strong>Sexe:</strong> {patient.gender}</Typography>
                                        <Typography><strong>Groupe sanguin:</strong> {patient.bloodGroup}</Typography>
                                        <Typography><strong>Profession:</strong> {patient.profession}</Typography>
                                        <Typography><strong>Adresse:</strong> {patient.city}</Typography>
                                        <Typography><strong>Couverture sociale:</strong> {patient.socialCoverage}</Typography>
                                    </>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box>
                                <Typography variant="h6">Contact</Typography>
                                {editMode ? (
                                    <>
                                        <TextField label="Mobile" name="mobilePhone" fullWidth margin="normal" value={editablePatient.mobilePhone} onChange={handleChange} />
                                        <TextField label="Fix" name="landlinePhone" fullWidth margin="normal" value={editablePatient.landlinePhone} onChange={handleChange} />
                                    </>
                                ) : (
                                    <>
                                        <Typography><strong>Mobile:</strong> {patient.mobilePhone}</Typography>
                                        <Typography><strong>Fix:</strong> {patient.landlinePhone}</Typography>
                                    </>
                                )}
                            </Box>
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6">Antécédents du patient</Typography>
                                {editMode ? (
                                    <>
                                        <TextField label="Personnels" name="personalHistory" fullWidth margin="normal" value={editablePatient.personalHistory} onChange={handleChange} />
                                        <TextField label="Allergies" name="allergies" fullWidth margin="normal" value={editablePatient.allergies} onChange={handleChange} />
                                        <TextField label="Chirurgicaux" name="surgicalHistory" fullWidth margin="normal" value={editablePatient.surgicalHistory} onChange={handleChange} />
                                        <TextField label="Habitudes toxiques" name="toxicHabits" fullWidth margin="normal" value={editablePatient.toxicHabits} onChange={handleChange} />
                                        <TextField label="Familiaux" name="familyHistory" fullWidth margin="normal" value={editablePatient.familyHistory} onChange={handleChange} />
                                    </>
                                ) : (
                                    <>
                                        <Typography><strong>Personnels:</strong> {patient.personalHistory}</Typography>
                                        <Typography><strong>Allergies:</strong> {patient.allergies}</Typography>
                                        <Typography><strong>Chirurgicaux:</strong> {patient.surgicalHistory}</Typography>
                                        <Typography><strong>Habitudes toxiques:</strong> {patient.toxicHabits}</Typography>
                                        <Typography><strong>Familiaux:</strong> {patient.familyHistory}</Typography>
                                    </>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                        {editMode ? (
                            <>
                                <IconButton color="primary" onClick={handleSavePatient}>
                                    <SaveIcon />
                                </IconButton>
                                <IconButton color="secondary" onClick={handleCancelEdit}>
                                    <CancelIcon />
                                </IconButton>
                            </>
                        ) : (
                            <IconButton color="primary" onClick={() => setEditMode(true)}>
                                <EditIcon />
                            </IconButton>
                        )}
                    </Box>
                    <Divider sx={{ my: 4 }} />
                </Box>
            )}
            <Typography variant="h5" mb={2} textAlign="center">Rendez-vous</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date du rendez-vous</TableCell>
                            <TableCell>Notes</TableCell>
                            <TableCell>Médicaments prescrits</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                                <TableCell>
                                    <Typography variant="body1">
                                        {timestampToDate(appointment.appointmentDate)?.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                                    </Typography>
                                </TableCell>
                                <TableCell>{appointment.notes}</TableCell>
                                <TableCell>{appointment.prescribedMedicine}</TableCell>
                                <TableCell>{appointment.done ? 'Oui' : 'Non'}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(appointment)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Modifier le rendez-vous</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Date du rendez-vous"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        value={formatDateTimeForInput(timestampToDate(selectedAppointment?.appointmentDate)) || ''}
                        onChange={(e) => setSelectedAppointment({
                            ...selectedAppointment,
                            appointmentDate: dateToTimestamp(new Date(e.target.value))
                        })}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="Notes"
                        fullWidth
                        multiline
                        margin="normal"
                        value={selectedAppointment?.notes || ''}
                        onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                    />
                    <TextField
                        label="Médicaments prescrits"
                        fullWidth
                        margin="normal"
                        value={selectedAppointment?.prescribedMedicine || ''}
                        onChange={(e) => setSelectedAppointment({ ...selectedAppointment, prescribedMedicine: e.target.value })}
                    />
                    <Box display="flex" alignItems="center">
                        <Checkbox
                            checked={selectedAppointment?.done || false}
                            onChange={(e) => setSelectedAppointment({ ...selectedAppointment, done: e.target.checked })}
                            color="primary"
                        />
                        <Typography>Terminé</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">Annuler</Button>
                    <Button onClick={handleSaveAppointment} color="primary">Enregistrer</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PatientDetails;