/**
 * Application Entry Point
 * 
 * This is the main entry file for the ShopSmart React application.
 * It renders the root App component into the DOM and sets up React StrictMode
 * for highlighting potential problems in the application.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.css';

// Get the root DOM element where the React app will be mounted
const container = document.getElementById('root');

// Create a root using the new React 18 createRoot API
const root = createRoot(container);

// Render the App component wrapped in StrictMode
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);