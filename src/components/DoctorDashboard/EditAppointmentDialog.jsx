import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';

const EditAppointmentDialog = ({ open, handleClose, handleSave, appointmentData, setAppointmentData }) => {
  if (!appointmentData) {
    // Provide default empty values
    appointmentData = {
      patientName: '',
      moroccanId: '',
      done: false,
      notes: '',
      prescribedMedicine: '',
    };
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData({ ...appointmentData, [name]: value });
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Modifier le rendez-vous</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Modifier les informations du rendez-vous ci-dessous.
        </DialogContentText>
        <TextField
          margin="dense"
          label="Nom prénom"
          name="patientName"
          type="text"
          fullWidth
          value={appointmentData.patientName || ''}
          disabled
        />
        <TextField
          margin="dense"
          label="CIN"
          name="moroccanId"
          type="text"
          fullWidth
          value={appointmentData.moroccanId || ''}
          disabled
        />
        <TextField
          margin="dense"
          label="Notes"
          name="notes"
          type="text"
          fullWidth
          multiline
          value={appointmentData.notes || ''}
          onChange={handleInputChange}
        />
        <TextField
          margin="dense"
          label="Médicaments prescrits"
          name="prescribedMedicine"
          type="text"
          fullWidth
          multiline
          value={appointmentData.prescribedMedicine || ''}
          onChange={handleInputChange}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Statut</InputLabel>
          <Select
            name="done"
            value={appointmentData.done ? 'Terminé' : 'En attente'}
            onChange={(e) => setAppointmentData({ ...appointmentData, done: e.target.value === 'Terminé' })}
          >
            <MenuItem value="En attente">En attente</MenuItem>
            <MenuItem value="Terminé">Terminé</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Annuler</Button>
        <Button onClick={() => handleSave(appointmentData)} color="primary">Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAppointmentDialog;