import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaTags, FaUsers, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EventDetails.css';

const EventDetails = () => {
  const { eventname } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [registerStatus, setRegisterStatus] = useState(null);
  const navigate = useNavigate();

  const studentEmail = localStorage.getItem('email'); // Get email from localStorage

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/viewevent?eventname=${eventname}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const checkRegistrationStatus = async () => {
      if (studentEmail) {
        try {
          const response = await axios.get(`http://localhost:8080/check-registration`, {
            params: {
              email: studentEmail,
              eventname: eventname,
            },
          });
          if (response.data === true) {
            setRegisterStatus("Registered");
          }
        } catch (error) {
          console.error("Error checking registration status:", error);
        }
      }
    };

    fetchEventDetails();
    checkRegistrationStatus();
  }, [eventname, studentEmail]);

  const handleRegister = () => {
    if (!studentEmail) {
      toast.warning("Please log in to register for the event");
      return;
    }

    // Register the student
    axios.post(`http://localhost:8080/register`, null, {
      params: {
        email: studentEmail,
        eventname: eventname,
      },
    })
    .then((response) => {
      toast.success("Registered successfully!");
      setRegisterStatus('Registered');
    })
    .catch((error) => {
      console.error("Error registering for event:", error);
      toast.error("Registration failed. Please try again.");
    });
  };

  const handleUnregister = () => {
    if (!studentEmail) {
      toast.warning("Please log in to unregister from the event");
      return;
    }

    // Unregister the student
    axios.delete(`http://localhost:8080/unregister`, {
      params: {
        email: studentEmail,
        eventname: eventname,
      },
    })
    .then((response) => {
      toast.success("Unregistered successfully!");
      setRegisterStatus(null);
    })
    .catch((error) => {
      console.error("Error unregistering from event:", error);
      toast.error("Unregistration failed. Please try again.");
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
        <div className="event-details-container">
          <div className="event-image-container">
            <img
              src={`data:image/jpeg;base64,${event.image}` || '../assets/images/default-event.png'}
              alt={event.name}
              className="event-image"
            />
          </div>
          
          <h1 className="event-name">{event.eventName}</h1>
          
          <div className="event-info-container">
            <div className="event-info">
              <div className="info-item">
                <FaUser className="icon" />
                <p><strong>Organized by:</strong> {event.club?.clubName || 'N/A'}</p>
              </div>
              <div className="info-item">
                <FaCalendarAlt className="icon" />
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div className="info-item">
                <FaMapMarkerAlt className="icon" />
                <p><strong>Venue:</strong> {event.venue}</p>
              </div>
              <div className="info-item">
                <FaTags className="icon" />
                <p><strong>Category:</strong> {event.category}</p>
              </div>
              <div className="info-item">
                <FaUsers className="icon" />
                <p><strong>Capacity:</strong> {event.capacity}</p>
              </div>
              <div className="info-item">
                <FaUsers className="icon" />
                <p><strong>Slots Remaining:</strong> {event.capacity - event.registered}</p>
              </div>
            </div>
      
            <div className="info-item description-item">
              <FaInfoCircle className="icon" />
              <p><strong>Description:</strong> {event.description}</p>
            </div>
      
            {registerStatus === "Registered" ? (
              <div className="registration-status">
                <p className="registered-message">You are already registered for this event!</p>
                <button className="unregister-button" onClick={handleUnregister}>
                  Unregister
                </button>
              </div>
            ) : (
              <button className="register-button" onClick={handleRegister}>
                Register Now
              </button>
            )}
            
            <a href="#" className="go-back-link" onClick={handleGoBack}>
              <FaArrowLeft className="go-back-icon" />
              Back to Events
            </a>
          </div>
        </div>
      );
};

export default EventDetails;
