import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, isVisible, onHide }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onHide();
            }, 2000); // Hide after 2 seconds

            return () => clearTimeout(timer);
        }
    }, [isVisible, onHide]);

    if (!isVisible) return null;

    return (
        <div className="toast-container">
            <div className="toast-message">
                <i className="fas fa-check-circle"></i>
                {message}
            </div>
        </div>
    );
};

export default Toast; 