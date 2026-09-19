/**
 * Main Application Component
 *
 * This is the root component of the ShopSmart e-commerce application.
 * It handles routing, global state management, and renders the main layout.
 *
 * The component fetches product data on mount and manages UI state for modals
 * and notifications.
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Homepage from './components/Homepage';
import ProductList from './components/ProductList';
import About from './components/About';
import AuthPage from './components/AuthPage';
import NotFound from './components/NotFound';
import CartModal from './components/CartModal';
import ImageModal from './components/ImageModal';
import Toast from './components/Toast';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import './styles/main.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const App = () => {
    // State for product data and loading status
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI state for modals and notifications
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [imageModal, setImageModal] = useState({ isOpen: false, image: '', alt: '' });
    const [toast, setToast] = useState({ visible: false, message: '' });

    /**
     * Fetch all products from the API on component mount
     *
     * This effect runs once when the component mounts and populates
     * the products state with data from the backend API.
     */
    const fetchProducts = () => {
        setLoading(true);
        setError(null);
        fetch('http://localhost:3001/api/products')
            .then(response => {
                if (!response.ok) throw new Error('Unable to load products');
                return response.json();
            })
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    /**
     * Display a toast notification with the specified message
     *
     * @param {string} message - The message to display in the toast
     */
    const showToast = (message) => {
        setToast({ visible: true, message });
    };

    /**
     * Hide the currently displayed toast notification
     */
    const hideToast = () => {
        setToast({ visible: false, message: '' });
    };

    /**
     * Handle product image click to show the image modal
     *
     * @param {string} image - URL of the image to display
     * @param {string} alt - Alt text for the image
     */
    const handleImageClick = (image, alt) => {
        setImageModal({ isOpen: true, image, alt });
    };

    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div className="App">
                        <Header onCartClick={() => setIsCartOpen(true)} />
                        <main id="main-content">
                            <Routes>
                                <Route path="/" element={
                                    <Homepage products={products} loading={loading} error={error} onRetry={fetchProducts} onImageClick={handleImageClick} showToast={showToast} />
                                } />
                                <Route path="/products" element={
                                    <ProductList
                                        loading={loading} error={error} onRetry={fetchProducts}
                                        products={products}
                                        onImageClick={handleImageClick}
                                        showToast={showToast}
                                    />
                                } />
                                <Route path="/about" element={<About />} />
                                <Route path="/login" element={<AuthPage />} />
                                <Route path="/admin" element={
                                    <AdminRoute>
                                        <div className="admin-page">
                                            <h1>Admin Dashboard</h1>
                                            <p>This is a protected admin page. Only users with admin role can access it.</p>
                                        </div>
                                    </AdminRoute>
                                } />
                                <Route path="/profile" element={
                                    <ProtectedRoute>
                                        <div className="profile-page">
                                            <h1>User Profile</h1>
                                            <p>This is a protected page. Only authenticated users can access it.</p>
                                        </div>
                                    </ProtectedRoute>
                                } />
                                <Route path="/unauthorized" element={
                                    <div className="unauthorized-page">
                                        <h1>Unauthorized</h1>
                                        <p>You don't have permission to access this page.</p>
                                    </div>
                                } />
                                {/* Catch-all route for 404 Not Found */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </main>
                        <Footer />

                        {/* Modals */}
                        <CartModal
                            isOpen={isCartOpen}
                            onClose={() => setIsCartOpen(false)}
                            onCheckoutSuccess={() => {
                                setIsCartOpen(false);
                                fetchProducts();
                                showToast('Checkout successful');
                            }}
                        />
                        <ImageModal
                            isOpen={imageModal.isOpen}
                            image={imageModal.image}
                            alt={imageModal.alt}
                            onClose={() => setImageModal({ isOpen: false, image: '', alt: '' })}
                        />

                        {/* Toast notifications */}
                        <Toast
                            message={toast.message}
                            isVisible={toast.visible}
                            onHide={hideToast}
                        />
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;
