import toast from 'react-hot-toast';
import api from './api';

/**
 * Fetches bookings from the server.
 * @param {boolean} myBookingFilter - Filter bookings based on the current user's primary or invited status.
 * @param {boolean} fromNow - Retrieve bookings from current time
 * @returns {Promise<Array>} - A promise that resolves to an array of bookings.
 */
export async function getBookings(myBookingFilter = null, fromNow = null) {
  try {
    let response;
    let url;
    if (myBookingFilter) {
      url = `/bookings?primary_user=true&invited_user=true`;
    } else if (fromNow) {
      url = `/bookings?primary_user=true&invited_user=true&start_time=(${new Date()})`
    } else {
      url = '/bookings';
    }
    response = await api.get(url)

    // Convert UTC times to local times
    const bookings = response.data.bookings.map((booking) => ({
      ...booking,
      start_time: new Date(booking.start_time),
      end_time: new Date(booking.end_time),
    }));
    return bookings;
  } catch (error) {
    handleApiError(error, 'Error fetching bookings');
  }
}

/**
 * Fetches bookings in which the current user is a participant.
 * @returns {Promise<Array>} - A promise that resolves to an array of bookings.
 */
export async function getBookingsParticipant() {
  try {
    const response = await api.get('/bookings?invited_user=true');

    // Convert UTC times to local times
    const bookings = response.data.bookings.map((booking) => ({
      ...booking,
      start_time: new Date(booking.start_time),
      end_time: new Date(booking.end_time),
    }));

    return bookings;
  } catch (error) {
    handleApiError(error, 'Error fetching bookings');
  }
}

/**
 * Fetches a booking by its ID.
 * @param {string} bookingId - The ID of the booking to fetch.
 * @returns {Promise<Object>} - A promise that resolves to the fetched booking object.
 */
export async function getBookingById(bookingId) {
  try {
    const response = await api.get(`/bookings/${bookingId}`);

    // Convert UTC times to local times
    const booking = {
      ...response.data,
      start_time: new Date(response.data.start_time),
      end_time: new Date(response.data.end_time),
    };

    return booking;
  } catch (error) {
    handleApiError(error, 'Error fetching bookings');
  }
}

/**
 * Creates a new booking.
 * @param {Object} bookingData - Data for creating the booking.
 * @returns {Promise<Object>} - A promise that resolves to the response from the server.
 */
export async function createBooking(bookingData) {
  // Destructure bookingData object
  const {
    room_id,
    title,
    description,
    startTime,
    endTime,
    invited_user_ids,
  } = bookingData;

  // Create booking object
  const booking = {
    room_id,
    title,
    invited_user_ids,
    description,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
  };

  try {
    const response = await api.post('/bookings', booking);
    console.log(response);
    toast.success('Booking successfully created!');
    return response;
  } catch (error) {
    handleApiError(error, 'Error creating booking');
  }
}

/**
 * Edits an existing booking.
 * @param {string} bookingId - The ID of the booking to edit.
 * @param {Object} bookingData - Data for editing the booking.
 * @returns {Promise<Object>} - A promise that resolves to the response from the server.
 */
export async function editBooking(bookingId, bookingData) {
  // Destructure bookingData object
  const {roomId, title, description, startTime, endTime} = bookingData;
  console.log(bookingData);

  // Convert times to UTC time
  const startUtcTime = new Date(startTime).toISOString();
  const endUtcTime = new Date(endTime).toISOString();

  // Create updated booking object
  const updatedBooking = {
    room_id: roomId,
    title: title,
    description: description,
    start_time: startUtcTime,
    end_time: endUtcTime,
  };

  // Testing log
  console.log('Updated Booking Object:', updatedBooking);

  try {
    const response = await api.put(`/bookings/${bookingId}`, updatedBooking);
    toast.success('Booking successfully updated!')
    return response;
  } catch (error) {
    handleApiError(error, 'Error editing booking');
  }
}

/**
 * Deletes a booking.
 * @param {string} bookingId - The ID of the booking to delete.
 * @returns {Promise<Object>} - A promise that resolves to the response from the server.
 */
export async function deleteBooking(bookingId) {
  try {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response;
  } catch (error) {
    handleApiError(error, 'Error deleting booking');
  }
}

export async function getAvailableTimeSlots() {
   try {
    const currentDate = new Date();
    const startTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getSeconds()
    );
    const endTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      17,
      0,
      0
    );

    const formattedStartTime = startTime.toISOString();
    const formattedEndTime = endTime.toISOString();

    const {data} = await api.get(
      `/bookings/available-time-slots?start_time=${formattedStartTime}&end_time=${formattedEndTime}&interval=60`
    );
    // console.log(data);
    return data;
  } catch (err) {
    console.error(err);
  }
}

/**
 * Handles API errors and displays a toast notification.
 * @param {Object} err - The error object.
 * @param {string} [customMessage='An error occurred'] - Custom error message.
 */
export function handleApiError(err, customMessage = 'An error occurred') {
  if (err.response) {
    console.error(customMessage + ':', err.response || err);
    toast.error(customMessage + '. Please try again later.');
  }
}
