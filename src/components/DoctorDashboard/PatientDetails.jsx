import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Checkbox, Divider, Grid, Select, MenuItem, FormControl, InputLabel, TablePagination } from '@mui/material';
import { ArrowBack, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../auth/AuthProvider';
import { timestampToDate, dateToTimestamp, formatDateForInput, formatDateTimeForInput } from '../../utils/DateUtils';

const PatientDetails = ({ moroccanId, onBack }) => {
    const { currentUser } = useAuth();
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [newAppointment, setNewAppointment] = useState({
        appointmentDate: '',
        notes: '',
        prescribedMedicine: '',
        done: false
    });
    const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
    const [openEditPatientDialog, setOpenEditPatientDialog] = useState(false);
    const [openAddAppointmentDialog, setOpenAddAppointmentDialog] = useState(false);
    const [editablePatient, setEditablePatient] = useState(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(2);

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
        setOpenAppointmentDialog(true);
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
                setOpenAppointmentDialog(false);
            } catch (error) {
                console.error('Error updating appointment:', error);
            }
        }
    };

    const handleAddAppointment = async () => {
        try {
            await addDoc(collection(db, 'appointments'), {
                ...newAppointment,
                moroccanId: patient.moroccanId,
                doctorId: currentUser.uid,
                appointmentDate: dateToTimestamp(new Appointment.appointmentDate),
                createdDate: Timestamp.fromDate(new Date())
            });
            setNewAppointment({
                appointmentDate: '',
                notes: '',
                prescribedMedicine: '',
                done: false
            });
            setOpenAddAppointmentDialog(false);
            fetchAppointments();
        } catch (error) {
            console.error('Error adding appointment:', error);
        }
    };

    const handleOpenEditPatientDialog = () => {
        setEditablePatient(patient);
        setOpenEditPatientDialog(true);
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
                setOpenEditPatientDialog(false);
            } catch (error) {
                console.error('Error updating patient:', error);
            }
        }
    };

    const handleCancelEditPatient = () => {
        setEditablePatient(patient);
        setOpenEditPatientDialog(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditablePatient({ ...editablePatient, [name]: value });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className='w-full h-[80vh] w-full flex justify-start items-center flex-col bg-white rounded-lg mt-12'>
            <div className='w-full flex justify-between items-center flex-row mb-10'>
                <IconButton onClick={onBack}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4" textAlign="center" sx={{ flexGrow: 1 }}>Détails du patient</Typography>
                <IconButton color="primary" onClick={handleOpenEditPatientDialog}>
                    <EditIcon />
                </IconButton>
            </div>
            {patient && (
                <div className='w-full p-x-4'>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Box>
                                <h1 className='font-bold text-2xl mb-6'>Informations de base</h1>
                                <Typography><strong>Nom Prénom:</strong> {patient.patientName}</Typography>
                                <Typography><strong>CIN:</strong> {patient.moroccanId}</Typography>
                                <Typography><strong>Date de naissance:</strong> {timestampToDate(patient.dateOfBirth)?.toLocaleDateString()}</Typography>
                                <Typography><strong>Âge:</strong> {patient.dateOfBirth ? new Date().getFullYear() - timestampToDate(patient.dateOfBirth).getFullYear() : 'N/A'}</Typography>
                                <Typography><strong>Sexe:</strong> {patient.gender}</Typography>
                                <Typography><strong>Groupe sanguin:</strong> {patient.bloodGroup}</Typography>
                                <Typography><strong>Profession:</strong> {patient.profession}</Typography>
                                <Typography><strong>Adresse:</strong> {patient.city}</Typography>
                                <Typography><strong>Couverture sociale:</strong> {patient.socialCoverage}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box>
                                <h1 className='font-bold text-2xl mb-3'>Contact</h1>
                                <Typography><strong>Mobile:</strong> {patient.mobilePhone}</Typography>
                                <Typography><strong>Fix:</strong> {patient.landlinePhone}</Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <h1 className='font-bold text-2xl mb-3'>Antécédents du patient</h1>
                                <Typography><strong>Personnels:</strong> {patient.personalHistory}</Typography>
                                <Typography><strong>Allergies:</strong> {patient.allergies}</Typography>
                                <Typography><strong>Chirurgicaux:</strong> {patient.surgicalHistory}</Typography>
                                <Typography><strong>Habitudes toxiques:</strong> {patient.toxicHabits}</Typography>
                                <Typography><strong>Familiaux:</strong> {patient.familyHistory}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 6 }} />
                    <Typography variant="h5" mb={2} textAlign="center">Rendez-vous</Typography>
                    <IconButton color="primary" onClick={() => setOpenAddAppointmentDialog(true)}>
                        <AddIcon /> Ajouter un rendez-vous
                    </IconButton>
                    {appointments.length > 0 ? (
                        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                            <Table stickyHeader>
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
                                    {appointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((appointment) => (
                                        <TableRow key={appointment.id}>
                                            <TableCell>
                                                <Typography variant="body1">
                                                    {timestampToDate(appointment.appointmentDate)?.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{appointment.notes}</TableCell>
                                            <TableCell>{appointment.prescribedMedicine}</TableCell>
                                            <TableCell>{appointment.done ? 'Terminé' : 'En attente'}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEdit(appointment)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={appointments.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[2]}
                                style={{ display: "flex", width: "100%", justifyContent: "end", alignItems: "center" }}
                            />
                        </TableContainer>
                    ) : (
                        <Typography variant="body1" textAlign="center">Ce patient n'a pas encore de rendez-vous.</Typography>
                    )}
                </div>
            )}

            <Dialog open={openAppointmentDialog} onClose={() => setOpenAppointmentDialog(false)}>
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
                    <Button onClick={() => setOpenAppointmentDialog(false)} color="secondary">Annuler</Button>
                    <Button onClick={handleSaveAppointment} color="primary">Enregistrer</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAddAppointmentDialog} onClose={() => setOpenAddAppointmentDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Ajouter un rendez-vous</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        label="Date du rendez-vous"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        value={newAppointment.appointmentDate}
                        onChange={e => setNewAppointment({ ...newAppointment, appointmentDate: new Date(e.target.value) })}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="Notes"
                        fullWidth
                        multiline
                        margin="normal"
                        value={newAppointment.notes}
                        onChange={e => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    />
                    <TextField
                        label="Médicaments prescrits"
                        fullWidth
                        margin="normal"
                        value={newAppointment.prescribedMedicine}
                        onChange={e => setNewAppointment({ ...newAppointment, prescribedMedicine: e.target.value })}
                    />
                    <Box display="flex" alignItems="center">
                        <Checkbox
                            checked={newAppointment.done}
                            onChange={e => setNewAppointment({ ...newAppointment, done: e.target.checked })}
                            color="primary"
                        />
                        <Typography>Terminé</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddAppointmentDialog(false)} color="secondary">Annuler</Button>
                    <Button onClick={handleAddAppointment} color="primary">Enregistrer</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditPatientDialog} onClose={handleCancelEditPatient} maxWidth="md" fullWidth>
                <DialogTitle>Modifier les informations du patient</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField label="Nom Prénom" name="patientName" fullWidth margin="normal" value={editablePatient?.patientName || ''} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="CIN" name="moroccanId" fullWidth margin="normal" value={editablePatient?.moroccanId || ''} disabled />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Date de naissance" name="dateOfBirth" type="date" fullWidth margin="normal" value={formatDateForInput(timestampToDate(editablePatient?.dateOfBirth)) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Sexe</InputLabel>
                                <Select name="gender" value={editablePatient?.gender || ''} onChange={handleChange}>
                                    <MenuItem value="masculain">Masculain</MenuItem>
                                    <MenuItem value="féminin">Féminin</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Groupe sanguin" name="bloodGroup" fullWidth margin="normal" value={editablePatient?.bloodGroup || ''} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Profession" name="profession" fullWidth margin="normal" value={editablePatient?.profession || ''} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Adresse" name="city" fullWidth margin="normal" value={editablePatient?.city || ''} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Couverture sociale" name="socialCoverage" fullWidth margin="normal" value={editablePatient?.socialCoverage || ''} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Mobile" name="mobilePhone" fullWidth margin="normal" value={editablePatient?.mobilePhone || ''} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Fix" name="landlinePhone" fullWidth margin="normal" value={editablePatient?.landlinePhone || ''} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 2 }}>Antécédents du patient:</Typography>
                            <TextField label="Personnels" name="personalHistory" fullWidth margin="normal" value={editablePatient?.personalHistory || ''} onChange={handleChange} />
                            <TextField label="Allergies" name="allergies" fullWidth margin="normal" value={editablePatient?.allergies || ''} onChange={handleChange} />
                            <TextField label="Chirurgicaux" name="surgicalHistory" fullWidth margin="normal" value={editablePatient?.surgicalHistory || ''} onChange={handleChange} />
                            <TextField label="Habitudes toxiques" name="toxicHabits" fullWidth margin="normal" value={editablePatient?.toxicHabits || ''} onChange={handleChange} />
                            <TextField label="Familiaux" name="familyHistory" fullWidth margin="normal" value={editablePatient?.familyHistory || ''} onChange={handleChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEditPatient} color="secondary">Annuler</Button>
                    <Button onClick={handleSavePatient} color="primary">Enregistrer</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default PatientDetails;