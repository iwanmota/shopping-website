/**
 * Toast Notification Component
 * 
 * Displays temporary notification messages to provide feedback to users.
 * Automatically hides after a specified duration.
 * 
 * @component
 */
import React, { useEffect } from 'react';
import './Toast.css';

/**
 * Toast component for displaying temporary notification messages
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - The message to display in the toast
 * @param {boolean} props.isVisible - Whether the toast is currently visible
 * @param {Function} props.onHide - Handler function to hide the toast
 * @returns {React.ReactElement|null} Toast component or null when hidden
 */
const Toast = ({ message, isVisible, onHide }) => {
    /**
     * Set up auto-hide timer when toast becomes visible
     * 
     * Creates a timeout to automatically hide the toast after 2 seconds
     * Cleans up the timeout when component unmounts or visibility changes
     */
    useEffect(() => {
        if (isVisible) {
            // Create timer to auto-hide the toast
            const timer = setTimeout(() => {
                onHide();
            }, 2000); // Hide after 2 seconds

            // Clean up timer when component unmounts or visibility changes
            return () => clearTimeout(timer);
        }
    }, [isVisible, onHide]);

    // Don't render anything if toast is not visible
    if (!isVisible) return null;

    return (
        <div className="toast-container">
            <div className="toast-message">
                {/* Success icon */}
                <i className="fas fa-check-circle"></i>
                {/* Toast message text */}
                {message}
            </div>
        </div>
    );
};

export default Toast; 