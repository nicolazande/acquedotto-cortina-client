import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './styles/ServerStatusIndicator.css'; // Add styles for the indicator
import authApi from './api/authApi'; // Updated to use authApi

const ServerStatusIndicator = () => {
    const [isServerAvailable, setIsServerAvailable] = useState(false);

    useEffect(() => {
        let intervalId;

        const checkServerStatus = async () => {
            try {
                await authApi.healthCheck(); // Use healthCheck from authApi
                setIsServerAvailable(true);
                clearInterval(intervalId); // Stop checking once the server is available
            } catch (error) {
                setIsServerAvailable(false);
            }
        };

        intervalId = setInterval(checkServerStatus, 5000); // Check every 5 seconds
        checkServerStatus(); // Initial check immediately

        return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);

    return (
        <div className="server-status-indicator">
            <div
                className={`status-circle ${isServerAvailable ? 'green' : 'red'}`}
                title={isServerAvailable ? 'Server is available' : 'Server is unavailable'}
            ></div>
        </div>
    );
};

ServerStatusIndicator.propTypes = {};

export default ServerStatusIndicator;