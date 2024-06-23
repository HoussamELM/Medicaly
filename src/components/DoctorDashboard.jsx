import React, { useEffect, useState } from 'react';
import {
    TextField, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Button,
    IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, FormControl, InputLabel,
    Select, MenuItem
} from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs, query, where, runTransaction, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../auth/AuthProvider';
import PatientDetails from './PatientDetails';
import CalendarView from './CalendarView';
import AddPatient from './AddPatient';
import { CSVLink } from 'react-csv';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import './DoctorDashboard.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DoctorDashboard = () => {
    const { currentUser } = useAuth();
    const [patients, setPatients] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [showAddPatient, setShowAddPatient] = useState(false);
    const [exportData, setExportData] = useState([]);
    const [editPatientData, setEditPatientData] = useState(null);
    const [editAppointmentData, setEditAppointmentData] = useState(null);
    const [showEditPatientDialog, setShowEditPatientDialog] = useState(false);
    const [showDeletePatientDialog, setShowDeletePatientDialog] = useState(false);
    const [showEditAppointmentDialog, setShowEditAppointmentDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
                const patientSnapshot = await getDocs(patientQuery);
                const patientsList = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPatients(patientsList);
                setAllPatients(patientsList); // Keep a copy of all patients for search functionality
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

    const handleEditAppointment = (appointment) => {
        setEditAppointmentData(appointment);
        setShowEditAppointmentDialog(true);
    };

    const handleCloseEditAppointmentDialog = () => {
        setShowEditAppointmentDialog(false);
        setEditAppointmentData(null);
    };

    const handleSaveEditAppointment = async () => {
        if (!editAppointmentData) return;

        try {
            const appointmentDocRef = doc(db, 'appointments', editAppointmentData.id);

            await updateDoc(appointmentDocRef, {
                done: editAppointmentData.done,
                notes: editAppointmentData.notes,
                prescribedMedicine: editAppointmentData.prescribedMedicine
            });

            alert('Appointment updated successfully!');
            setShowEditAppointmentDialog(false);
            setEditAppointmentData(null);

            // Refresh appointments
            const appointmentQuery = query(collection(db, 'appointments'), where('doctorId', '==', currentUser.uid));
            const appointmentSnapshot = await getDocs(appointmentQuery);
            setAppointments(appointmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error updating appointment:', error);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchQuery(value);
        const filteredPatients = allPatients.filter(
            (patient) => patient.patientName.toLowerCase().includes(value) || patient.moroccanId.toLowerCase().includes(value)
        );
        setPatients(filteredPatients);
    };

    return (
        <Box sx={{ mt: 8 }}>
            {selectedPatient ? (
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
                                <TextField
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search Patients"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
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
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditPatient(patient);
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeletePatient(patient);
                                                            }}
                                                        >
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
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {appointments.map((appointment) => (
                                            <TableRow key={appointment.id}>
                                                <TableCell>{appointment.patientName}</TableCell>
                                                <TableCell>{appointment.moroccanId}</TableCell>
                                                <TableCell>{appointment.appointmentDate ? appointment.appointmentDate.toDate().toLocaleString() : 'No Appointments'}</TableCell>
                                                <TableCell>{appointment.done ? 'Done' : 'Pending'}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditAppointment(appointment);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {tabValue === 2 && <CalendarView />}
                </>
            )}

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

            {/* Edit Appointment Dialog */}
            <Dialog open={showEditAppointmentDialog} onClose={handleCloseEditAppointmentDialog}>
                <DialogTitle>Edit Appointment</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Patient Name"
                        type="text"
                        fullWidth
                        value={editAppointmentData?.patientName || ''}
                        disabled
                    />
                    <TextField
                        margin="dense"
                        label="Moroccan ID"
                        type="text"
                        fullWidth
                        value={editAppointmentData?.moroccanId || ''}
                        disabled
                    />
                    <FormControl fullWidth margin="normal">
                        <DatePicker
                            selected={editAppointmentData?.appointmentDate ? new Date(editAppointmentData.appointmentDate.seconds * 1000) : null}
                            onChange={(date) => setEditAppointmentData({ ...editAppointmentData, appointmentDate: date })}
                            showTimeSelect
                            dateFormat="Pp"
                        />
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="Notes"
                        type="text"
                        fullWidth
                        multiline
                        value={editAppointmentData?.notes || ''}
                        onChange={(e) => setEditAppointmentData({ ...editAppointmentData, notes: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Prescribed Medicine"
                        type="text"
                        fullWidth
                        multiline
                        value={editAppointmentData?.prescribedMedicine || ''}
                        onChange={(e) => setEditAppointmentData({ ...editAppointmentData, prescribedMedicine: e.target.value })}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={editAppointmentData?.done ? 'Done' : 'Pending'}
                            onChange={(e) => setEditAppointmentData({ ...editAppointmentData, done: e.target.value === 'Done' })}
                        >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Done">Done</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditAppointmentDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleSaveEditAppointment} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DoctorDashboard;