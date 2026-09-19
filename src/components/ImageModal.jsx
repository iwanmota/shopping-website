/**
 * Image Modal Component
 *
 * Displays a product image in a full-screen modal overlay.
 * Handles click events to close the modal and prevents body scrolling when open.
 *
 * @component
 */
import React from 'react';
import useModalFocus from '../hooks/useModalFocus';
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
    const panel = useModalFocus(isOpen, onClose);

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
                ref={panel} role="dialog" aria-modal="true" aria-label={alt} tabIndex={-1}
                onClick={handleContentClick}
            >
                {/* Close button */}
                <button
                    className="close-button" aria-label="Close product image"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >
                    <span aria-hidden="true">×</span>
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
