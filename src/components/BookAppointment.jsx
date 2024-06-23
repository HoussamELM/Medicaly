import React, { useState, useEffect, forwardRef } from 'react';
import { TextField, Button, Typography, Box, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, setDoc } from 'firebase/firestore';

const BookAppointment = () => {
    const [formData, setFormData] = useState({
        patientName: '',
        moroccanId: '',
        appointmentDate: null,
        doctorId: ''
    });
    const [doctors, setDoctors] = useState([]);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'doctors'));
                const doctorsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setDoctors(doctorsList);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        const fetchBookedTimes = async () => {
            if (formData.doctorId) {
                try {
                    const q = query(
                        collection(db, 'appointments'),
                        where('doctorId', '==', formData.doctorId),
                        where('appointmentDate', '>=', Timestamp.fromDate(new Date())),
                        where('appointmentDate', '<=', Timestamp.fromDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000))) // Within one week
                    );
                    const querySnapshot = await getDocs(q);
                    const times = querySnapshot.docs.map(doc => doc.data().appointmentDate.toDate().getTime());
                    setBookedTimes(times);
                } catch (error) {
                    console.error('Error fetching booked times:', error);
                }
            }
        };
        fetchBookedTimes();
    }, [formData.doctorId]);

    const handleDateChange = (date) => {
        setFormData({
            ...formData,
            appointmentDate: date
        });
    };

    const filterPassedTime = (time) => {
        const selectedDate = new Date(time);
        return selectedDate.getTime() >= new Date().getTime() && selectedDate.getTime() <= new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).getTime();
    };

    const filterTime = (date) => {
        const selectedDate = new Date(date);
        const hours = selectedDate.getHours();
        const minutes = selectedDate.getMinutes();
        const time = selectedDate.setSeconds(0, 0);

        const isUnavailable = bookedTimes.includes(time);

        return hours >= 8 && hours < 17 && minutes % 30 === 0 && !isUnavailable;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (!formData.appointmentDate) {
                setError('Please select an appointment date.');
                return;
            }

            const appointmentDate = Timestamp.fromDate(formData.appointmentDate);

            // Check for existing patient
            const patientQuery = query(
                collection(db, 'patients'),
                where('moroccanId', '==', formData.moroccanId)
            );
            const patientSnapshot = await getDocs(patientQuery);

            if (!patientSnapshot.empty) {
                const patientData = patientSnapshot.docs[0].data();
                if (patientData.patientName !== formData.patientName) {
                    setError('The patient name does not match the Moroccan ID.');
                    return;
                }
            } else {
                // Add patient if not existing
                const newPatient = {
                    patientName: formData.patientName,
                    moroccanId: formData.moroccanId,
                    doctorId: formData.doctorId
                };
                await setDoc(doc(db, 'patients', formData.moroccanId), newPatient);
            }

            // Check for existing pending appointments
            const pendingQuery = query(
                collection(db, 'appointments'),
                where('moroccanId', '==', formData.moroccanId),
                where('done', '==', false)
            );
            const querySnapshotPending = await getDocs(pendingQuery);

            if (!querySnapshotPending.empty) {
                setError('You already have a pending appointment.');
                return;
            }

            // Check for existing appointments at the same time
            const timeSlotQuery = query(
                collection(db, 'appointments'),
                where('doctorId', '==', formData.doctorId),
                where('appointmentDate', '==', appointmentDate)
            );
            const querySnapshotSameTime = await getDocs(timeSlotQuery);

            if (!querySnapshotSameTime.empty) {
                setError('This time slot is already booked. Please choose another time.');
                return;
            }

            await addDoc(collection(db, 'appointments'), {
                ...formData,
                appointmentDate,
                done: false,
                notes: '',
                prescribedMedicine: ''
            });

            alert('Appointment booked successfully!');
            setFormData({ patientName: '', moroccanId: '', appointmentDate: '', doctorId: '' });
        } catch (error) {
            console.error('Error booking appointment:', error);
            setError('Error booking appointment. Please try again later.');
        }
    };

    // Custom DatePicker Input
    const CustomInput = forwardRef(({ value, onClick }, ref) => (
        <TextField
            fullWidth
            label="Appointment Date"
            value={value}
            onClick={onClick}
            ref={ref}
            margin="normal"
            InputLabelProps={{ shrink: true }}
        />
    ));

    return (
        <Box sx={{ maxWidth: '500px', margin: 'auto', mt: 8, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
            <Typography variant="h4" mb={2} textAlign="center">
                Book Appointment
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <form onSubmit={handleSubmit} noValidate>
                <TextField
                    fullWidth
                    label="Patient Name"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Moroccan ID"
                    name="moroccanId"
                    value={formData.moroccanId}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal" required>
                    <DatePicker
                        selected={formData.appointmentDate}
                        onChange={handleDateChange}
                        showTimeSelect
                        filterTime={filterTime}
                        minDate={new Date()}
                        maxDate={new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)} // Limit to one week
                        dateFormat="MMMM d, yyyy h:mm aa"
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        placeholderText="Select a date and time"
                        filterDate={filterPassedTime}
                        customInput={<CustomInput />}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                    <InputLabel>Doctor</InputLabel>
                    <Select name="doctorId" value={formData.doctorId} onChange={handleChange}>
                        {doctors.map((doctor) => (
                            <MenuItem key={doctor.id} value={doctor.id}>
                                {doctor.name} - {doctor.specialty}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box mt={4}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Book Appointment
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default BookAppointment;