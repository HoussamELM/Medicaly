import React, { useEffect, useState } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Button, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs, query, where, runTransaction, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../auth/AuthProvider';
import PatientDetails from './PatientDetails';
import CalendarView from './CalendarView';
import AddPatient from './AddPatient';
import { CSVLink } from 'react-csv';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { currentUser } = useAuth();
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [showAddPatient, setShowAddPatient] = useState(false);
    const [exportData, setExportData] = useState([]);
    const [editPatientData, setEditPatientData] = useState(null);
    const [showEditPatientDialog, setShowEditPatientDialog] = useState(false);
    const [showDeletePatientDialog, setShowDeletePatientDialog] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
                const patientSnapshot = await getDocs(patientQuery);
                const patientsList = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPatients(patientsList);
                setExportData(patientsList.map(patient => ({
                    PatientName: patient.patientName,
                    MoroccanID: patient.moroccanId
                })));
            } catch (error) {
                console.error('Error fetching patients:', error);
            }
        };

        const fetchAppointments = async () => {
            try {
                const appointmentQuery = query(collection(db, 'appointments'), where('doctorId', '==', currentUser.uid));
                const appointmentSnapshot = await getDocs(appointmentQuery);
                const appointmentsList = appointmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAppointments(appointmentsList);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        if (currentUser) {
            fetchPatients();
            fetchAppointments();
        }
    }, [currentUser]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditPatient = (patient) => {
        setEditPatientData(patient);
        setShowEditPatientDialog(true);
    };

    const handleCloseEditPatientDialog = () => {
        setShowEditPatientDialog(false);
        setEditPatientData(null);
    };

    const handleSaveEditPatient = async () => {
        if (!editPatientData) return;

        try {
            const patientDocRef = doc(db, 'patients', editPatientData.moroccanId);
            await updateDoc(patientDocRef, {
                patientName: editPatientData.patientName
            });
            alert('Patient updated successfully!');
            setShowEditPatientDialog(false);
            setEditPatientData(null);

            // Refresh patients
            const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
            const patientSnapshot = await getDocs(patientQuery);
            setPatients(patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error updating patient:', error);
        }
    };

    const handleDeletePatient = (patient) => {
        setEditPatientData(patient);
        setShowDeletePatientDialog(true);
    };

    const handleCloseDeletePatientDialog = () => {
        setShowDeletePatientDialog(false);
        setEditPatientData(null);
    };

    const handleConfirmDeletePatient = async () => {
        if (!editPatientData) return;

        try {
            await runTransaction(db, async (transaction) => {
                const patientDocRef = doc(db, 'patients', editPatientData.moroccanId);
                transaction.delete(patientDocRef);

                // Delete related appointments
                const appointmentQuery = query(collection(db, 'appointments'), where('moroccanId', '==', editPatientData.moroccanId));
                const appointmentsSnapshot = await getDocs(appointmentQuery);
                appointmentsSnapshot.forEach((doc) => {
                    transaction.delete(doc.ref);
                });
            });

            alert('Patient and related appointments deleted successfully!');

            setShowDeletePatientDialog(false);
            setEditPatientData(null);

            // Refresh patients
            const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
            const patientSnapshot = await getDocs(patientQuery);
            setPatients(patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error deleting patient:', error);
        }
    };

    return (
        <Box sx={{ mt: 8 }}>
            {
                selectedPatient ? (
                    <PatientDetails moroccanId={selectedPatient} onBack={() => setSelectedPatient(null)} />
                ) : (
                    <>
                        <Typography variant="h4" mb={2} textAlign="center">Doctor Dashboard</Typography>
                        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
                            <Tab label="Patients" />
                            <Tab label="Appointments" />
                            <Tab label="Calendar" />
                        </Tabs>
                        {tabValue === 0 && (
                            <>
                                <Typography variant="subtitle1" mb={2} textAlign="center">
                                    Click on a patient row to see their history
                                </Typography>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <CSVLink data={exportData} filename={"patients_data.csv"}>
                                        <Button variant="contained" color="primary">Export Data as CSV</Button>
                                    </CSVLink>
                                    <Button variant="contained" color="secondary" onClick={() => setShowAddPatient(!showAddPatient)}>
                                        {showAddPatient ? "Cancel" : "Add New Patient"}
                                    </Button>
                                </Box>
                                {showAddPatient && <AddPatient onPatientAdded={() => setShowAddPatient(false)} />}
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Patient Name</TableCell>
                                                <TableCell>Moroccan ID</TableCell>
                                                <TableCell>Past Appointments</TableCell>
                                                <TableCell>Pending Appointments</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {patients.map((patient) => {
                                                const patientAppointments = appointments.filter(app => app.moroccanId === patient.moroccanId);
                                                const pastAppointments = patientAppointments.filter(app => app.done);
                                                const pendingAppointments = patientAppointments.filter(app => !app.done);

                                                return (
                                                    <TableRow key={patient.id}>
                                                        <TableCell>{patient.patientName}</TableCell>
                                                        <TableCell>{patient.moroccanId}</TableCell>
                                                        <TableCell>{pastAppointments.length}</TableCell>
                                                        <TableCell>{pendingAppointments.length}</TableCell>
                                                        <TableCell>
                                                            <IconButton onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditPatient(patient);
                                                            }}>
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeletePatient(patient);
                                                            }}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                            <Button onClick={() => setSelectedPatient(patient.moroccanId)}>View</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}

                        {tabValue === 1 && (
                            <>
                                <Typography variant="subtitle1" mb={2} textAlign="center">
                                    All Appointments
                                </Typography>
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Patient Name</TableCell>
                                                <TableCell>Moroccan ID</TableCell>
                                                <TableCell>Appointment Date</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {appointments.map((appointment) => (
                                                <TableRow key={appointment.id}>
                                                    <TableCell>{appointment.patientName}</TableCell>
                                                    <TableCell>{appointment.moroccanId}</TableCell>
                                                    <TableCell>{appointment.appointmentDate ? appointment.appointmentDate.toDate().toLocaleString() : 'No Appointments'}</TableCell>
                                                    <TableCell>{appointment.done ? 'Done' : 'Pending'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}

                        {tabValue === 2 && <CalendarView />}
                    </>
                )
            }

            {/* Edit Patient Dialog */}
            <Dialog open={showEditPatientDialog} onClose={handleCloseEditPatientDialog}>
                <DialogTitle>Edit Patient</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Edit the patient's information below.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Patient Name"
                        type="text"
                        fullWidth
                        value={editPatientData?.patientName || ''}
                        onChange={(e) => setEditPatientData({ ...editPatientData, patientName: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditPatientDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleSaveEditPatient} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Patient Dialog */}
            <Dialog open={showDeletePatientDialog} onClose={handleCloseDeletePatientDialog}>
                <DialogTitle>Delete Patient</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this patient and all their related appointments? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeletePatientDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleConfirmDeletePatient} color="primary">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DoctorDashboard;