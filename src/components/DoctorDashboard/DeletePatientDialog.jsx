import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const DeletePatientDialog = ({ open, handleClose, handleConfirmDelete }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Supprimer le patient</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Êtes-vous sûr de vouloir supprimer ce patient et tous ses rendez-vous associés? Cette action ne peut pas être annulée.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">Annuler</Button>
                <Button onClick={handleConfirmDelete} color="primary">Supprimer</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeletePatientDialog;