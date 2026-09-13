/**
 * Image Modal Component
 * 
 * Displays a product image in a full-screen modal overlay.
 * Handles click events to close the modal and prevents body scrolling when open.
 * 
 * @component
 */
import React, { useEffect } from 'react';
import './ImageModal.css';

/**
 * ImageModal component for displaying enlarged product images
 * 
 * @param {Object} props - Component props
 * @param {string} props.image - URL of the image to display
 * @param {string} props.alt - Alt text for the image
 * @param {boolean} props.isOpen - Whether the modal is currently visible
 * @param {Function} props.onClose - Handler function to close the modal
 * @returns {React.ReactElement|null} Image modal component or null when closed
 */
const ImageModal = ({ image, alt, isOpen, onClose }) => {
    /**
     * Control body scrolling based on modal state
     * 
     * Prevents the page from scrolling in the background when the modal is open
     * Restores scrolling when the modal is closed or unmounted
     */
    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = 'unset';
            return undefined;
        }

        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Don't render anything if modal is closed
    if (!isOpen) return null;

    /**
     * Prevent click events from bubbling to the overlay
     * 
     * This prevents the modal from closing when clicking on the content
     * 
     * @param {React.MouseEvent} e - Click event object
     */
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="image-modal-overlay"
            onClick={onClose}
        >
            <div
                className="image-modal-content"
                role="dialog"
                aria-modal="true"
                aria-label={`Enlarged image: ${alt}`}
                onClick={handleContentClick}
            >
                {/* Close button */}
                <button
                    type="button"
                    className="close-button"
                    aria-label="Close image"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >
                    <i className="fas fa-times"></i>
                </button>
                
                {/* Full-size product image */}
                <img 
                    src={image} 
                    alt={alt} 
                    className="full-size-image"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};

export default ImageModal; 