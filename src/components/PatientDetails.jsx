// src/components/PatientDetails.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Checkbox } from '@mui/material';
import { ArrowBack, Edit as EditIcon } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../auth/AuthProvider';

const PatientDetails = ({ moroccanId, onBack }) => {
    const { currentUser } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

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
        fetchAppointments();
    }, [moroccanId, currentUser]);

    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment);
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (selectedAppointment) {
            try {
                const appointmentRef = doc(db, 'appointments', selectedAppointment.id);
                await updateDoc(appointmentRef, selectedAppointment);
                setAppointments(appointments.map(app => app.id === selectedAppointment.id ? selectedAppointment : app));
                setOpenDialog(false);
            } catch (error) {
                console.error('Error updating appointment: ', error);
            }
        }
    };

    return (
        <Box sx={{ mt: 8 }}>
            <IconButton onClick={onBack}>
                <ArrowBack />
            </IconButton>
            <Typography variant="h4" mb={2} textAlign="center">Patient Details</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Appointment Date</TableCell>
                            <TableCell>Notes</TableCell>
                            <TableCell>Medicine Prescribed</TableCell>
                            <TableCell>Done</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                                <TableCell>
                                    <Typography variant="body1">
                                        {appointment.appointmentDate.toDate().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                                    </Typography>
                                </TableCell>
                                <TableCell>{appointment.notes}</TableCell>
                                <TableCell>{appointment.prescribedMedicine}</TableCell>
                                <TableCell>{appointment.done ? 'Yes' : 'No'}</TableCell>
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
                <DialogTitle>Edit Appointment</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Appointment Date"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        value={selectedAppointment?.appointmentDate.toDate().toISOString().slice(0, 16) || ''}
                        onChange={(e) => setSelectedAppointment({
                            ...selectedAppointment,
                            appointmentDate: Timestamp.fromDate(new Date(e.target.value))
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
                        label="Medicine Prescribed"
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
                        <Typography>Done</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleSave} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PatientDetails;