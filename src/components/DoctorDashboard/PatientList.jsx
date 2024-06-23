import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const PatientList = ({ patients, appointments, handleEditPatient, handleDeletePatient, setSelectedPatient }) => {
    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nom prénom</TableCell>
                        <TableCell>CIN</TableCell>
                        <TableCell>Rendez-vous passés</TableCell>
                        <TableCell>Rendez-vous en attente</TableCell>
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
                                    <Button onClick={() => setSelectedPatient(patient.moroccanId)}>Voir</Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PatientList;