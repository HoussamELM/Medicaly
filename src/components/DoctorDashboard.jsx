// src/components/DoctorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Button } from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../auth/AuthProvider';
import PatientDetails from './PatientDetails';
import CalendarView from './CalendarView';
import AddPatient from './AddPatient';
import { CSVLink } from "react-csv";
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { currentUser } = useAuth();
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [showAddPatient, setShowAddPatient] = useState(false);
    const [exportData, setExportData] = useState([]);

    useEffect(() => {
        if (!currentUser) return;
        console.log("Current User:", currentUser);

        const fetchPatients = async () => {
            try {
                console.log("Fetching patients...");
                const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
                const patientSnapshot = await getDocs(patientQuery);
                const patientsList = patientSnapshot.docs.map(doc => doc.data());
                console.log("Fetched patients:", patientsList);

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
                console.log("Fetching appointments...");
                const appointmentQuery = query(collection(db, 'appointments'), where('doctorId', '==', currentUser.uid));
                const appointmentSnapshot = await getDocs(appointmentQuery);
                const appointmentsList = appointmentSnapshot.docs.map(doc => doc.data());
                console.log("Fetched appointments:", appointmentsList);

                setAppointments(appointmentsList);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        fetchPatients();
        fetchAppointments();
    }, [currentUser]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handlePatientAdded = () => {
        setShowAddPatient(false);
        // Trigger data refresh if necessary
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
                    {tabValue === 0 ? (
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
                            {showAddPatient && <AddPatient onPatientAdded={handlePatientAdded} />}
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Patient Name</TableCell>
                                            <TableCell>Moroccan ID</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {patients.map((patient) => (
                                            <TableRow
                                                key={patient.moroccanId}
                                                className="clickable-row"
                                                onClick={() => setSelectedPatient(patient.moroccanId)}
                                            >
                                                <TableCell>{patient.patientName}</TableCell>
                                                <TableCell>{patient.moroccanId}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    ) : tabValue === 1 ? (
                        <>
                            <Typography variant="subtitle1" mb={2} textAlign="center">
                                All Appointments
                            </Typography>
                            <TableContainer component={Paper}>
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
                                            <TableRow key={appointment.id} className="clickable-row">
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
                    ) : (
                        <CalendarView />
                    )}
                </>
            )}
        </Box>
    );
};

export default DoctorDashboard;