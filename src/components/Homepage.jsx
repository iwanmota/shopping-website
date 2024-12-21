import React from 'react';
import './Homepage.css';

const Homepage = () => {
    return (
        <div className="homepage-container">
            <div className="construction-notice">
                <i className="fas fa-hard-hat construction-icon"></i>
                <h1>Coming Soon!</h1>
                <p>Our new homepage is under construction. Please check back later!</p>
                <div className="construction-line"></div>
            </div>
        </div>
    );
};

export default Homepage; 