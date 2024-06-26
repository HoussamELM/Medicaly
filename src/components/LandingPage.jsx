// src/components/LandingPage.jsx
import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import DoctorAppointment from '../assets/Doctor-Appointment.svg';
import BookAppointment from './BookAppointment.jsx';

const LandingPage = () => {
    return (
        <div className='h-[80vh] w-full flex justify-center items-center bg-white rounded-lg'>
            <div className='w-[50%] flex flex-col justify-center items-center'>
                <BookAppointment />
            </div>
            <div className='w-[50%]'>
                <img src={DoctorAppointment} alt="Doctor Appointment" className="w-[600px]" />
            </div>
        </div>
    );
};

export default LandingPage;