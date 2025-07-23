/**
 * Not Found Page Component
 * 
 * Displays a 404 error page when a user navigates to a non-existent route.
 * 
 * @component
 */
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFound component for 404 error page
 * 
 * @returns {React.ReactElement} Not found page component
 */
const NotFound = () => {
  return (
    <div className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>
        <Link to="/" className="home-link">Return to Homepage</Link>
      </p>
    </div>
  );
};

export default NotFound;