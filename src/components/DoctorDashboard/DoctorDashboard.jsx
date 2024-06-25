import React, { useEffect, useState } from 'react';
import {
    TextField, Typography, Box, Tabs, Tab, Button, InputAdornment, Alert, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { CSVLink } from 'react-csv';
import { Search as SearchIcon } from '@mui/icons-material';
import { collection, getDocs, getDoc, query, where, runTransaction, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../auth/AuthProvider';
import PatientDetails from './PatientDetails';
import CalendarView from './CalendarView';
import AddPatient from './AddPatient';
import EditPatientDialog from './EditPatientDialog';
import DeletePatientDialog from './DeletePatientDialog';
import EditAppointmentDialog from './EditAppointmentDialog';
import PatientList from './PatientList';
import AppointmentsList from './AppointmentsList';
import './DoctorDashboard.css';

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
    const [infoMessage, setInfoMessage] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
                const patientSnapshot = await getDocs(patientQuery);
                const patientsList = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPatients(patientsList);
                setAllPatients(patientsList); // Keep a copy of all patients for search functionality
                setExportData(patientsList.map(patient => ({
                    "Nom prénom": patient.patientName,
                    "CIN": patient.moroccanId,
                    "Groupe sanguin": patient.bloodGroup,
                    // Include additional fields as needed
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
        if (newValue !== null && newValue !== tabValue) {
            setTabValue(newValue);
        }
    };

    const handleEditPatient = (patient) => {
        setEditPatientData(patient);
        setShowEditPatientDialog(true);
    };

    const handleCloseEditPatientDialog = () => {
        setShowEditPatientDialog(false);
        setEditPatientData(null);
    };

    const handleSaveEditPatient = async (updatedPatientData) => {
        if (!updatedPatientData) return;

        try {
            const patientDocRef = doc(db, 'patients', updatedPatientData.id);

            // Check if document exists before updating
            const docSnapshot = await getDoc(patientDocRef);
            if (!docSnapshot.exists()) {
                throw new Error(`No document to update: ${patientDocRef.path}`);
            }

            // Log the document reference for debugging
            console.log("Updating document: ", patientDocRef.path);

            // Ensure dateOfBirth is a valid Date object
            const dateOfBirth = updatedPatientData.dateOfBirth instanceof Date
                ? updatedPatientData.dateOfBirth
                : updatedPatientData.dateOfBirth
                    ? new Date(updatedPatientData.dateOfBirth.seconds * 1000)
                    : null;

            await updateDoc(patientDocRef, {
                patientName: updatedPatientData.patientName,
                bloodGroup: updatedPatientData.bloodGroup,
                dateOfBirth: dateOfBirth ? Timestamp.fromDate(dateOfBirth) : null,
                gender: updatedPatientData.gender,
                mobilePhone: updatedPatientData.mobilePhone,
                landlinePhone: updatedPatientData.landlinePhone,
                socialCoverage: updatedPatientData.socialCoverage,
                profession: updatedPatientData.profession,
                city: updatedPatientData.city,
                personalHistory: updatedPatientData.personalHistory,
                allergies: updatedPatientData.allergies,
                surgicalHistory: updatedPatientData.surgicalHistory,
                toxicHabits: updatedPatientData.toxicHabits,
                regularTreatment: updatedPatientData.regularTreatment,
                familyHistory: updatedPatientData.familyHistory,
            });

            setShowEditPatientDialog(false);
            setEditPatientData(null);
            setInfoMessage('Patient mis à jour avec succès !');

            // Refresh patients
            const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
            const patientSnapshot = await getDocs(patientQuery);
            setPatients(patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Erreur de mise à jour du patient:', error);
            setInfoMessage('Erreur de mise à jour du patient.');
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
                const patientDocRef = doc(db, 'patients', editPatientData.id);

                // Check if the document exists before deleting
                const docSnapshot = await getDoc(patientDocRef);
                if (!docSnapshot.exists()) {
                    throw new Error(`No document to delete: ${patientDocRef.path}`);
                }

                // Log for debugging purposes
                console.log("Deleting document: ", patientDocRef.path);

                transaction.delete(patientDocRef);

                // Also delete related appointments
                const appointmentQuery = query(collection(db, 'appointments'), where('moroccanId', '==', editPatientData.moroccanId));
                const appointmentsSnapshot = await getDocs(appointmentQuery);
                appointmentsSnapshot.forEach((doc) => {
                    transaction.delete(doc.ref);
                });
            });

            setShowDeletePatientDialog(false);
            setEditPatientData(null);
            setInfoMessage('Patient et tous ses rendez-vous supprimés avec succès !');

            // Refresh patients
            const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
            const patientSnapshot = await getDocs(patientQuery);
            setPatients(patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Erreur de suppression du patient:', error);
            setInfoMessage('Erreur de suppression du patient.');
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

    const handleSaveEditAppointment = async (updatedAppointmentData) => {
        if (!updatedAppointmentData) return;

        try {
            const appointmentDocRef = doc(db, 'appointments', updatedAppointmentData.id);

            await updateDoc(appointmentDocRef, {
                done: updatedAppointmentData.done,
                notes: updatedAppointmentData.notes,
                prescribedMedicine: updatedAppointmentData.prescribedMedicine,
            });

            setShowEditAppointmentDialog(false);
            setEditAppointmentData(null);
            setInfoMessage('Rendez-vous mis à jour avec succès !');

            // Refresh appointments
            const appointmentQuery = query(collection(db, 'appointments'), where('doctorId', '==', currentUser.uid));
            const appointmentSnapshot = await getDocs(appointmentQuery);
            setAppointments(appointmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Erreur de mise à jour du rendez-vous:', error);
            setInfoMessage('Erreur de mise à jour du rendez-vous.');
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
            {infoMessage && <Alert onClose={() => setInfoMessage(null)} severity="info">{infoMessage}</Alert>}
            {selectedPatient ? (
                <PatientDetails moroccanId={selectedPatient} onBack={() => setSelectedPatient(null)} />
            ) : (
                <>
                    <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
                        <Tab label="Patients" />
                        <Tab label="Rendez-vous" />
                        <Tab label="Calendrier" />
                    </Tabs>

                    {/*<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <ToggleButtonGroup
                            value={tabValue}
                            exclusive
                            onChange={handleTabChange}
                            aria-label="text alignment"
                            color="primary"
                        >
                            <ToggleButton value={0} aria-label="left aligned">
                                Patients
                            </ToggleButton>
                            <ToggleButton value={1} aria-label="centered">
                                Rendez-vous
                            </ToggleButton>
                            <ToggleButton value={2} aria-label="right aligned">
                                Calendrier
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>*/}


                    {tabValue === 0 && (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} className="mt-8">
                                <CSVLink data={exportData} filename={"patients_data.csv"}>
                                    <Button variant="contained" color="primary">Exporter les données en CSV</Button>
                                </CSVLink>
                                <Button variant="contained" color="secondary" onClick={() => setShowAddPatient(!showAddPatient)}>
                                    {showAddPatient ? "Annuler" : "Ajouter un nouveau patient"}
                                </Button>
                                <TextField
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Rechercher Patients"
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
                            <PatientList
                                patients={patients}
                                appointments={appointments}
                                handleEditPatient={handleEditPatient}
                                handleDeletePatient={handleDeletePatient}
                                setSelectedPatient={setSelectedPatient}
                            />
                        </>
                    )}

                    {tabValue === 1 && (
                        <div className="mt-8">
                            <AppointmentsList
                                appointments={appointments}
                                handleEditAppointment={handleEditAppointment}
                            />
                        </div>
                    )}

                    {tabValue === 2 && (
                        <div className="mt-8">
                            <CalendarView />
                        </div>
                    )}
                </>
            )}

            <EditPatientDialog
                open={showEditPatientDialog}
                handleClose={handleCloseEditPatientDialog}
                handleSave={handleSaveEditPatient}
                patientData={editPatientData}
                setPatientData={setEditPatientData}
            />

            <DeletePatientDialog
                open={showDeletePatientDialog}
                handleClose={handleCloseDeletePatientDialog}
                handleConfirmDelete={handleConfirmDeletePatient}
            />

            <EditAppointmentDialog
                open={showEditAppointmentDialog}
                handleClose={handleCloseEditAppointmentDialog}
                handleSave={handleSaveEditAppointment}
                appointmentData={editAppointmentData}
                setAppointmentData={setEditAppointmentData}
            />
        </Box>
    );
};

export default DoctorDashboard;