/**
 * Product List Component
 * 
 * Displays a grid of product cards showing all available products.
 * This component is responsible for rendering the main product catalog.
 * 
 * @component
 */
import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';
import './ProductList.css';

/**
 * ProductList component for displaying a collection of products
 * 
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of product objects to display
 * @param {Function} props.onImageClick - Handler for product image clicks
 * @param {Function} props.showToast - Function to display notification messages
 * @returns {React.ReactElement} Grid of product cards
 */
const ProductList = ({ products, onImageClick, showToast }) => {
    return (
        <div className="product-list">
            {/* Map through products array and render a ProductCard for each */}
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

/**
 * PropTypes for type checking and documentation
 * 
 * Defines the expected shape of the products array and required functions
 */
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