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
    const [patientsWithAppointments, setPatientsWithAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [showAddPatient, setShowAddPatient] = useState(false);
    const [exportData, setExportData] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        const fetchAppointments = async () => {
            try {
                const q = query(collection(db, 'appointments'), where('doctorId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
                const appointments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Process appointments to get unique patients
                const patientMap = {};
                appointments.forEach(app => {
                    if (!patientMap[app.moroccanId]) {
                        patientMap[app.moroccanId] = {
                            patientName: app.patientName,
                            moroccanId: app.moroccanId,
                            appointments: []
                        };
                    }
                    patientMap[app.moroccanId].appointments.push(app);
                });

                const patientsList = Object.values(patientMap);
                setPatientsWithAppointments(patientsList);

                setExportData(patientsList.map(patient => ({
                    PatientName: patient.patientName,
                    MoroccanID: patient.moroccanId,
                    AppointmentCount: patient.appointments.length
                })));
            } catch (error) {
                console.error('Error fetching patients: ', error);
            }
        };

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
                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Patient Name</TableCell>
                                            <TableCell>Moroccan ID</TableCell>
                                            <TableCell>Appointment Count</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {patientsWithAppointments.map((patient) => (
                                            <TableRow
                                                key={patient.moroccanId}
                                                className="clickable-row"
                                                onClick={() => setSelectedPatient(patient.moroccanId)}
                                            >
                                                <TableCell>{patient.patientName}</TableCell>
                                                <TableCell>{patient.moroccanId}</TableCell>
                                                <TableCell>{patient.appointments.length}</TableCell>
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