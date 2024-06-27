import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TablePagination } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

const AppointmentsList = ({ appointments, handleEditAppointment }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    // Handle change of page
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle change of rows per page
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page
    };

    // Slicing data for pagination
    const paginatedAppointments = appointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <TableContainer component={Paper} sx={{ mt: 2, height: "695px" }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nom prénom</TableCell>
                        <TableCell>CIN</TableCell>
                        <TableCell>Date du rendez-vous</TableCell>
                        <TableCell>Motif de consultation</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                            <TableCell>{appointment.patientName}</TableCell>
                            <TableCell>{appointment.moroccanId}</TableCell>
                            <TableCell>{appointment.appointmentDate ? appointment.appointmentDate.toDate().toLocaleString() : 'Aucun rendez-vous'}</TableCell>
                            <TableCell>{appointment.consultationReason || 'Not specified'}</TableCell>
                            <TableCell>{appointment.done ? 'Terminé' : 'En attente'}</TableCell>
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
            <TablePagination
                component="div"
                count={appointments.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[4, 7, 10]} // Option to change rows per page
                style={{ display: "flex", width: "100%", justifyContent: "end", alignItems: "center", alignSelf: "end" }}
            />
        </TableContainer>
    );
};

export default AppointmentsList;