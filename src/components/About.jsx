import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const values = [
  [
    '01 / Sustainability',
    'A lighter footprint.',
    'Supporting eco-friendly Canadian suppliers and making more considered choices.',
  ],
  [
    '02 / Community',
    'Closer to home.',
    'Building relationships with local communities and Canadian suppliers.',
  ],
  [
    '03 / Quality',
    'Worth choosing.',
    'Carefully selecting useful products with everyday life in mind.',
  ],
  [
    '04 / Canadian spirit',
    'Everyone belongs.',
    'Embracing the diversity and inclusivity that make our communities stronger.',
  ],
];

const About = () => (
  <div className="about-container">
    <section className="about-introduction" aria-labelledby="about-title">
      <div className="about-heading">
        <p className="eyebrow">About ShopSmart / Rooted in Canada</p>
        <h1 id="about-title">
          Good things.
          <br />
          <em>Closer to home.</em>
        </h1>
        <p className="about-tagline">
          Thoughtful essentials. A local spirit.
          <br />A warmer way to shop online.
        </p>
      </div>
      <figure className="about-panorama">
        <img
          src="/images/about/concepts/packing-table.png"
          alt="An illustrative scene of two people carefully packing an online order in warm afternoon light"
          width="1536"
          height="1024"
        />
        <figcaption>
          <span>Everyday care, from our community to yours.</span>
          <span>ShopSmart / Our story</span>
        </figcaption>
      </figure>
    </section>

    <section className="about-story" aria-labelledby="story-title">
      <p className="eyebrow">Our story</p>
      <h2 id="story-title">
        A little more care.
        <br />
        <em>A lot more everyday.</em>
      </h2>
      <div className="about-story-copy">
        <p>
          Founded in the heart of Canada, ShopSmart is a family-owned online
          shop built around a simple idea: everyday shopping can feel a little
          more personal.
        </p>
        <p>
          We bring together thoughtfully selected products, honest value, and a
          connection to the communities around us. From your morning routine to
          the things you reach for every day, we want to help you choose well.
        </p>
      </div>
    </section>

    <section className="about-values" aria-labelledby="values-title">
      <div className="about-section-label">
        <p className="eyebrow">What matters to us</p>
        <h2 id="values-title">Thoughtful by nature.</h2>
      </div>
      <div className="about-value-grid">
        {values.map(([label, title, description]) => (
          <article key={label}>
            <span>{label}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="about-cta" aria-labelledby="about-cta-title">
      <div>
        <p className="eyebrow">Make yourself at home</p>
        <h2 id="about-cta-title">Find your next everyday favourite.</h2>
      </div>
      <Link to="/products" className="primary-button">
        Explore the collection <span aria-hidden="true">↗</span>
      </Link>
    </section>
  </div>
);

export default About;
