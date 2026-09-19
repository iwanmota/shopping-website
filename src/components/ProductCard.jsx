import React from 'react';
import { useCart } from '../context/CartContext';
import { isSaleProduct, productCategory } from '../utils/catalogue';
import './ProductCard.css';

const ProductCard = ({ product, onImageClick, showToast }) => {
  const { addToCart } = useCart();
  const onSale = isSaleProduct(product);
  const discount = Math.round(
    ((product.price - product.salePrice) / product.price) * 100
  );
  return (
    <article className="product-card">
      <div className="product-photo">
        {onSale && <span className="sale-badge">Save {discount}%</span>}
        <button
          className="product-image-button"
          onClick={() => onImageClick(product.image, product.name)}
          aria-label={`View ${product.name} image`}
        >
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        </button>
      </div>
      <div className="product-copy">
        <span className="product-category">{productCategory(product)}</span>
        <h2 className="product-name">{product.name}</h2>
        <div className="price-info">
          <span className={onSale ? 'sale-price' : 'regular-price'}>
            ${(onSale ? product.salePrice : product.price).toFixed(2)}
          </span>
          {onSale && (
            <del className="original-price">${product.price.toFixed(2)}</del>
          )}
        </div>
        <p className="product-description">{product.description}</p>
        {onSale && (
          <p className="stock-info">
            Only {product.onSaleQuantity} left at this price
          </p>
        )}
        <button
          className="add-to-cart-button"
          onClick={() => {
            addToCart(product);
            showToast('Item added to bag');
          }}
          aria-label={`Add ${product.name} to bag`}
        >
          Add to bag <span aria-hidden="true">+</span>
        </button>
      </div>
    </article>
  );
};
export default ProductCard;
