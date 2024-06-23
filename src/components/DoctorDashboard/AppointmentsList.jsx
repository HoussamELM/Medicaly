import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

const AppointmentsList = ({ appointments, handleEditAppointment }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nom prénom</TableCell>
            <TableCell>CIN</TableCell>
            <TableCell>Date du rendez-vous</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.patientName}</TableCell>
              <TableCell>{appointment.moroccanId}</TableCell>
              <TableCell>{appointment.appointmentDate ? appointment.appointmentDate.toDate().toLocaleString() : 'Aucun rendez-vous'}</TableCell>
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
    </TableContainer>
  );
};

export default AppointmentsList;