import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import CartModal from './components/CartModal';
import './styles/main.css';

const App = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="App">
            <Header onCartClick={() => setIsCartOpen(true)} cartItemCount={cartItems.length} />
            <ProductList products={products} />
            <CartModal 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
            />
        </div>
    );
};

export default App;