import React, { useEffect } from 'react';
import './ImageModal.css';

const ImageModal = ({ image, alt, isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleContentClick = (e) => {
        // Prevent click from reaching the overlay
        e.stopPropagation();
    };

    return (
        <div 
            className="image-modal-overlay" 
            onClick={onClose}
        >
            <div 
                className="image-modal-content" 
                onClick={handleContentClick}
            >
                <button 
                    className="close-button" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >
                    <i className="fas fa-times"></i>
                </button>
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