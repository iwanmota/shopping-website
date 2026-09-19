import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import { filterProducts, productCategory } from '../utils/catalogue';
import './ProductList.css';

const ProductList = ({
  products,
  onImageClick,
  showToast,
  embedded = false,
  loading = false,
  error,
  onRetry,
}) => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const categories = ['All', ...new Set(products.map(productCategory)), 'Sale'];
  const filter = categories.includes(params.get('filter'))
    ? params.get('filter')
    : 'All';
  const visible = filterProducts(products, filter, query);
  const changeFilter = (value) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value === 'All') next.delete('filter');
        else next.set('filter', value);
        return next;
      },
      { replace: true }
    );
  };
  const Heading = embedded ? 'h2' : 'h1';
  return (
    <section
      className={`catalogue${embedded ? ' catalogue-embedded' : ''}`}
      id="collection"
      aria-labelledby="collection-title"
    >
      <div className="collection-heading">
        <div>
          <p className="eyebrow">The ShopSmart selection</p>
          <Heading id="collection-title">
            {embedded
              ? 'Small upgrades, big difference.'
              : 'Find your everyday.'}
          </Heading>
        </div>
        <span className="selection-count" aria-live="polite">
          {loading
            ? 'Loading collection…'
            : `${visible.length} considered essential${visible.length === 1 ? '' : 's'}`}
        </span>
      </div>
      <div className="shop-tools">
        <div
          className="category-filters"
          role="group"
          aria-label="Filter products"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => changeFilter(category)}
              aria-pressed={filter === category}
            >
              {category === 'Sale' ? 'On sale' : category}
            </button>
          ))}
        </div>
        <label className="catalogue-search">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the collection"
          />
        </label>
      </div>
      {loading ? (
        <p className="collection-status" role="status">
          Loading your collection…
        </p>
      ) : error ? (
        <div className="collection-status" role="alert">
          <p>We couldn't load the collection. Please try again.</p>
          <button className="primary-button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="product-list">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onImageClick={onImageClick}
                showToast={showToast}
              />
            ))}
          </div>
          {visible.length === 0 && (
            <div className="collection-status">
              <p>
                {products.length
                  ? 'No matching essentials. Try another search or category.'
                  : 'New essentials are on their way. Check back soon.'}
              </p>
              {products.length > 0 && (
                <button
                  className="primary-button"
                  onClick={() => {
                    setQuery('');
                    changeFilter('All');
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};
export default ProductList;
