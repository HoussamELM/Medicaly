import React, { useEffect, useState } from 'react';
import {
    TextField, Box, Tabs, Tab, Button, InputAdornment, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Container, Typography
} from '@mui/material';
import { CSVLink } from 'react-csv';
import { writeBatch } from 'firebase/firestore';
import { Search as SearchIcon } from '@mui/icons-material';
import { collection, getDocs, getDoc, query, where, runTransaction, doc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../auth/AuthProvider';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import Papa from 'papaparse';
import PatientDetails from './PatientDetails';
import CalendarView from './CalendarView';
import AddPatient from './AddPatient';
import EditPatientDialog from './EditPatientDialog';
import DeletePatientDialog from './DeletePatientDialog';
import EditAppointmentDialog from './EditAppointmentDialog';
import PatientList from './PatientList';
import AppointmentsList from './AppointmentsList';
import './DoctorDashboard.css';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ContactsIcon from '@mui/icons-material/Contacts';

const parseDate = (dateString) => {
    const [datePart, timePart, period] = dateString.split(/[\s,:]+/);
    const [month, day, year] = datePart.split('/');
    const [hours, minutes] = [parseInt(timePart[0]), parseInt(timePart[1])];
    const parsedHours = period === 'PM' && hours < 12 ? hours + 12 : hours;
    return new Date(year, month - 1, day, parsedHours, minutes);
};

const DoctorDashboard = () => {
    const { currentUser, doctorName } = useAuth();
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
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(7);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
                const patientSnapshot = await getDocs(patientQuery);
                const patientsList = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPatients(patientsList);
                setAllPatients(patientsList);
                setExportData(patientsList.map(patient => ({
                    "Nom prénom": patient.patientName,
                    "CIN": patient.moroccanId,
                    "Groupe sanguin": patient.bloodGroup,
                    "Date de naissance": patient.dateOfBirth ? patient.dateOfBirth.toDate().toLocaleString() : 'N/A',
                    "Sexe": patient.gender,
                    "Téléphone portable": patient.mobilePhone,
                    "Téléphone fixe": patient.landlinePhone,
                    "Couverture sociale": patient.socialCoverage,
                    "Profession": patient.profession,
                    "Adresse": patient.city,
                    "Personnels": patient.personalHistory,
                    "Allergies": patient.allergies,
                    "Chirurgicaux": patient.surgicalHistory,
                    "Habitudes toxiques": patient.toxicHabits,
                    "Familiaux": patient.familyHistory,
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
                appointmentsList.sort((a, b) => a.appointmentDate.toDate() - b.appointmentDate.toDate());
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

            const docSnapshot = await getDoc(patientDocRef);
            if (!docSnapshot.exists()) {
                throw new Error(`No document to update: ${patientDocRef.path}`);
            }

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
                familyHistory: updatedPatientData.familyHistory,
            });

            setShowEditPatientDialog(false);
            setEditPatientData(null);
            setInfoMessage('Patient mis à jour avec succès !');

            const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
            const patientSnapshot = await getDocs(patientQuery);
            setPatients(patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Erreur de mise à jour du patient:', error);
            setInfoMessage('Erreur de mise à jour du patient.');
            //log patient data
            console.log(updatedPatientData);
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

                const docSnapshot = await getDoc(patientDocRef);
                if (!docSnapshot.exists()) {
                    throw new Error(`No document to delete: ${patientDocRef.path}`);
                }

                transaction.delete(patientDocRef);

                const appointmentQuery = query(collection(db, 'appointments'), where('moroccanId', '==', editPatientData.moroccanId));
                const appointmentsSnapshot = await getDocs(appointmentQuery);
                appointmentsSnapshot.forEach((doc) => {
                    transaction.delete(doc.ref);
                });
            });

            setShowDeletePatientDialog(false);
            setEditPatientData(null);
            setInfoMessage('Patient et tous ses rendez-vous supprimés avec succès !');

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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                complete: handleFileParseComplete,
                header: true,
                skipEmptyLines: true // Skip empty lines to prevent errors.
            });
        }
    };

    const handleFileParseComplete = async (results) => {
        const data = results.data.filter(row => row.CIN && row.CIN.trim());

        if (data.length === 0) {
            setInfoMessage('Le fichier CSV ne contient aucun patient valide.');
            return;
        }

        try {
            const batch = writeBatch(db);

            data.forEach((patient) => {
                const patientRef = doc(db, 'patients', patient.CIN);
                batch.set(patientRef, {
                    patientName: patient['Nom prénom'],
                    moroccanId: patient.CIN,
                    bloodGroup: patient['Groupe sanguin'],
                    dateOfBirth: patient['Date de naissance'] ? Timestamp.fromDate(parseDate(patient['Date de naissance'])) : null,
                    gender: patient.Sexe,
                    mobilePhone: patient['Téléphone portable'],
                    landlinePhone: patient['Téléphone fixe'],
                    socialCoverage: patient['Couverture sociale'],
                    profession: patient.Profession,
                    city: patient.Adresse,
                    personalHistory: patient.Personnels,
                    allergies: patient.Allergies,
                    surgicalHistory: patient.Chirurgicaux,
                    toxicHabits: patient['Habitudes toxiques'],
                    familyHistory: patient.Familiaux,
                    doctorId: currentUser.uid,
                    dateRecorded: Timestamp.fromDate(new Date())
                });
            });

            await batch.commit();
            setInfoMessage('Patients importés avec succès!');
            const patientQuery = query(collection(db, 'patients'), where('doctorId', '==', currentUser.uid));
            const patientSnapshot = await getDocs(patientQuery);
            setPatients(patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        } catch (error) {
            console.error('Erreur d\'importation des patients:', error);
            setInfoMessage('Erreur d\'importation des patients.');
        }
    };

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = '/';
    };

    return (
        <div className='h-[80vh] w-full flex justify-center items-center flex-row bg-white rounded-lg'>
            <div className='flex justify-between items-center flex-col w-[25%] h-[80vh] border-r-2 pt-[5%] pb-[5%]'>
                <div className='w-[90%] flex justify-center items-center flex-col'>
                    <div className='flex justify-center items-center flex-row gap-3'>
                        <div className='flex justify-center items-center w-[60px] h-[60px] bg-slate-100 rounded-full'>
                            <PersonIcon />
                        </div>
                        <div>
                            <p className='font-bold text-xl'>Bienvenue Dr. {capitalizeFirstLetter(doctorName)}</p>
                            <p className='text-sm'>Gerer vos Patient et rendez-vous</p>
                        </div>
                    </div>
                    <hr className='border-slate-200 w-[60%] my-8' />
                </div>
                <div className='w-[70%] h-full flex justify-start items-start flex-col gap-3 pt-2'>
                    <ul className='flex justify-center items-center flex-col gap-2 w-[100%]'>
                        <li className={`w-full ${tabValue === 0 ? 'selected-tab bg-gray-100 rounded-lg' : ''}`}>
                            <Button
                                className={`w-full ${tabValue === 0 ? 'selected-tab' : ''}`}
                                sx={{ borderRadius: '10px', textTransform: "none" }}
                                onClick={() => { setTabValue(0); }}
                                color='tabs'
                            >
                                <ContactsIcon color={`${tabValue === 0 ? 'primary' : 'gray'}`} />
                                <p className='w-full text-left ml-3'>
                                    Gestion des Patients
                                </p>
                            </Button>
                        </li>
                        <li className={`w-full ${tabValue === 1 ? 'selected-tab bg-gray-100 rounded-lg' : ''}`}>
                            <Button
                                className={`w-full ${tabValue === 1 ? 'selected-tab' : ''}`}
                                sx={{ borderRadius: '10px', textTransform: "none" }}
                                onClick={() => { setTabValue(1); }}
                                color='tabs'
                            >
                                <EventAvailableIcon color={`${tabValue === 1 ? 'primary' : 'gray'}`} />
                                <p className='w-full text-left ml-3'>
                                    Mes Rendez-vous
                                </p>
                            </Button>
                        </li>
                        <li className={`w-full ${tabValue === 2 ? 'selected-tab bg-gray-100 rounded-lg' : ''}`}>
                            <Button
                                className={`w-full ${tabValue === 2 ? 'selected-tab' : ''}`}
                                sx={{ borderRadius: '10px', textTransform: "none" }}
                                onClick={() => { setTabValue(2); }}
                                color='tabs'>
                                <CalendarMonthIcon color={`${tabValue === 2 ? 'primary' : 'gray'}`} />
                                <p className='w-full text-left ml-3'>
                                    Mon Calendrier
                                </p>
                            </Button>
                        </li>
                    </ul>
                </div>
                <div className='flex justify-center items-center flex-col w-full gap-4'>
                    <div className='flex justify-center items-center flex-col gap-3 w-[70%]'>
                        {infoMessage && <Alert onClose={() => setInfoMessage(null)} severity="info">{infoMessage}</Alert>}
                        <Button variant="contained" size="large" color="secondary" onClick={() => setShowAddPatient(true)} fullWidth={true} sx={{ borderRadius: '10px', textTransform: "none" }}>
                            Ajouter Patient
                        </Button>
                    </div>
                    <hr className='border-slate-200 w-[60%] my-2' />
                    <div className='flex justify-center items-center flex-col gap-4 w-[100%]' >
                        <Button variant="contained" component="label" size="large" color="primary" className='w-[70%]' sx={{ borderRadius: '10px', textTransform: "none" }}>
                            Importer via CSV
                            <input type="file" accept=".csv" hidden onChange={handleFileChange} />
                        </Button>
                        <CSVLink data={exportData} filename={"patients_data.csv"} className='w-[70%]'>
                            <Button variant="contained" color="gray" fullWidth={true} size="large" sx={{ borderRadius: '10px', textTransform: "none" }}>
                                Exporter via CSV
                            </Button>
                        </CSVLink>
                        <Button sx={{ textTransform: "none" }} onClick={handleLogout} ><LogoutIcon /> &nbsp; Se Déconnecter</Button>
                    </div>
                </div>
            </div>
            <div className='flex justify-start items-center gap-6 flex-col w-[75%] h-[80vh] p-[30px] mt-12'>


                {selectedPatient ? (
                    <PatientDetails moroccanId={selectedPatient} onBack={() => setSelectedPatient(null)} />
                ) : (
                    <>
                        {tabValue === 0 && (
                            <>
                                <div className='flex justify-center items-center flex-col w-[100%] gap-3'>
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
                                        sx={{ width: '100%' }}
                                    />
                                </div>
                                <PatientList
                                    patients={patients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
                                    appointments={appointments}
                                    handleEditPatient={handleEditPatient}
                                    handleDeletePatient={handleDeletePatient}
                                    setSelectedPatient={setSelectedPatient}
                                />
                                <TablePagination
                                    component="div"
                                    count={patients.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[]}
                                    style={{ display: "flex", width: "100%", justifyContent: "end", alignItems: "center" }}
                                />
                            </>
                        )}

                        {tabValue === 1 && (
                            <>
                                <AppointmentsList
                                    appointments={appointments}
                                    handleEditAppointment={handleEditAppointment}
                                />
                            </>
                        )}

                        {tabValue === 2 && (
                            <>
                                <Container>
                                    <div className="mt-8 h-[65vh] overflow-y-scroll">
                                        <CalendarView />
                                    </div>
                                </Container>
                            </>
                        )}
                    </>
                )}

                <Dialog open={showAddPatient} onClose={() => setShowAddPatient(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Ajouter un nouveau patient</DialogTitle>
                    <DialogContent dividers>
                        <AddPatient onPatientAdded={() => setShowAddPatient(false)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowAddPatient(false)} color="primary">
                            Annuler
                        </Button>
                    </DialogActions>
                </Dialog>

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
            </div>
        </div>
    );
};

export default DoctorDashboard;