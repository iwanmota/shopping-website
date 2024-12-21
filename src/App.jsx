import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Homepage from './components/Homepage';
import ProductList from './components/ProductList';
import About from './components/About';
import CartModal from './components/CartModal';
import ImageModal from './components/ImageModal';
import './styles/main.css';
import { CartProvider } from './context/CartContext';

const App = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [imageModal, setImageModal] = useState({ isOpen: false, image: '', alt: '' });

    useEffect(() => {
        fetch('http://localhost:3001/api/products')
            .then(response => response.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleImageClick = (image, alt) => {
        setImageModal({ isOpen: true, image, alt });
    };

    if (loading) return <div className="loading">Loading</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <Router>
            <CartProvider>
                <div className="App">
                    <Header onCartClick={() => setIsCartOpen(true)} />
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/products" element={
                            <ProductList products={products} onImageClick={handleImageClick} />
                        } />
                        <Route path="/about" element={<About />} />
                    </Routes>
                    <CartModal 
                        isOpen={isCartOpen} 
                        onClose={() => setIsCartOpen(false)}
                    />
                    <ImageModal 
                        isOpen={imageModal.isOpen}
                        image={imageModal.image}
                        alt={imageModal.alt}
                        onClose={() => setImageModal({ isOpen: false, image: '', alt: '' })}
                    />
                </div>
            </CartProvider>
        </Router>
    );
};

export default App;