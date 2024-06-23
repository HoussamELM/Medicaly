// src/utils/DateUtils.js
import { Timestamp } from 'firebase/firestore';

// Convert Firestore Timestamp to JavaScript Date object
export const timestampToDate = (timestamp) => {
    if (!timestamp) return null;
    return timestamp instanceof Timestamp ? new Date(timestamp.seconds * 1000) : timestamp;
};

// Convert JavaScript Date object to Firestore Timestamp
export const dateToTimestamp = (date) => {
    if (!date) return null;
    return date instanceof Date ? Timestamp.fromDate(date) : date;
};

// Format Date object to a string suitable for <input type="date">
export const formatDateForInput = (date) => {
    if (!date) return '';
    return date.toISOString().slice(0, 10);
};

// Format Date object to a string suitable for <input type="datetime-local">
export const formatDateTimeForInput = (date) => {
    if (!date) return '';
    return date.toISOString().slice(0, 16);
};