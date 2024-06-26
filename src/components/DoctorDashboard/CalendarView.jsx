// src/components/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../auth/AuthProvider';
import './CalendarView.css';
import { Container } from 'postcss';
import { Box } from '@mui/material';


const CalendarView = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchAppointments = async () => {
      try {
        const q = query(collection(db, 'appointments'), where('doctorId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const eventsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            title: `Appointment with ${data.patientName}`,
            start: data.appointmentDate.toDate(),
            classNames: data.done ? ['done-event'] : [],
          };
        });
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching appointments: ', error);
      }
    };
    fetchAppointments();
  }, [currentUser]);

  const today = new Date();

  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      initialDate={today}
      events={events}
    />
  );
};

export default CalendarView;