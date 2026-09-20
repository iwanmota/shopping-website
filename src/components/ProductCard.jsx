import React from 'react';
import { useCart } from '../context/CartContext';
import { isSaleProduct, productCategory } from '../utils/catalogue';
import './ProductCard.css';

const ProductCard = ({ product, onImageClick, showToast }) => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const lines = cartItems.filter((item) => item.id === product.id);
  const quantity = lines.reduce((total, item) => total + item.quantity, 0);
  const removeOne = () => {
    // Undo full-price additions first, retaining the customer's discounted units.
    const line =
      lines.find((item) => item.pricingTier === 'regular') || lines[0];
    if (line) updateQuantity(line.lineId, line.quantity - 1);
  };
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
        <div
          className="product-quick-add"
          role="group"
          aria-label={`${product.name} bag quantity`}
        >
          {quantity > 0 && (
            <>
              <button
                onClick={removeOne}
                aria-label={`Remove one ${product.name} from bag`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                </svg>
              </button>
              <span
                className="product-bag-quantity"
                aria-live="polite"
                aria-atomic="true"
              >
                {quantity}
              </span>
            </>
          )}
          <button
            onClick={() => {
              addToCart(product);
              if (quantity === 0) showToast('Item added to bag');
            }}
            aria-label={`Add ${product.name} to bag`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5v14" />
            </svg>
          </button>
        </div>
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
      </div>
    </article>
  );
};
export default ProductCard;
