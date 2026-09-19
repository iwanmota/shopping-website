import React from 'react';
import { Link } from 'react-router-dom';
import ProductList from './ProductList';
import './Homepage.css';

const Homepage = ({
  products,
  loading,
  error,
  onRetry,
  onImageClick,
  showToast,
}) => (
  <div className="homepage-container">
    <section className="sale-banner" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="eyebrow">The Canadian autumn edit</p>
        <h1 id="home-title">
          Good things.
          <br />
          <em>For real life.</em>
        </h1>
        <p className="hero-intro">
          From your first coffee to your last song. Thoughtfully chosen
          essentials, at prices that feel right.
        </p>
        <a className="primary-button" href="#collection">
          Find your everyday <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="hero-photo">
        <img
          src="/images/products/coffee-maker.jpg"
          alt="Coffee maker for your morning ritual"
        />
        <div className="image-caption">
          <span>Make mornings yours</span>
          <a href="#collection">Explore the collection ↗</a>
        </div>
      </div>
    </section>
    <div className="benefits">
      <span>↗ Carefully selected essentials</span>
      <span>◇ Canadian, family-owned</span>
      <span>♡ Quality for everyday life</span>
    </div>
    <ProductList
      products={products}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onImageClick={onImageClick}
      showToast={showToast}
      embedded
    />
    <section className="home-story">
      <p className="eyebrow">Rooted in Canada</p>
      <h2>
        A little more care.
        <br />A lot more everyday.
      </h2>
      <p>
        We're a family-owned shop with a simple idea: good products, honest
        value, and a more thoughtful way to shop.
      </p>
      <Link to="/about">Get to know ShopSmart ↗</Link>
    </section>
  </div>
);
export default Homepage;
