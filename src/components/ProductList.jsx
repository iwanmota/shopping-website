import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';
import './ProductList.css';

const ProductList = ({ products, onImageClick, showToast }) => {
    return (
        <div className="product-list">
            {products.map(product => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    onImageClick={onImageClick}
                    showToast={showToast}
                />
            ))}
        </div>
    );
};

ProductList.propTypes = {
    products: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            image: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
            description: PropTypes.string.isRequired,
        })
    ).isRequired,
    onImageClick: PropTypes.func.isRequired,
    showToast: PropTypes.func.isRequired,
};

export default ProductList;