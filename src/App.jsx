import React from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import products from './data/products';
import './styles/main.css';

const App = () => {
    return (
        <div className="App">
            <Header />
            <ProductList products={products} />
            <Cart />
        </div>
    );
};

export default App;