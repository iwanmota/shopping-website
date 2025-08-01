/**
 * About Page Component
 * 
 * Displays information about the ShopSmart company, including its story,
 * values, and mission. This component provides users with background
 * information about the business.
 * 
 * @component
 */
import React from 'react';
import './About.css';

/**
 * About component for displaying company information
 * 
 * @returns {React.ReactElement} About page component
 */
const About = () => {
    return (
        <div className="about-container">
            {/* Page header section */}
            <div className="about-header">
                <h1>About ShopSmart</h1>
                <div className="decorative-line"></div>
            </div>
            
            <div className="about-content">
                {/* Main company image */}
                <div className="about-image">
                    <img 
                        src="/images/about/store-front.jpg" 
                        alt="ShopSmart Store Front" 
                        className="main-image"
                    />
                </div>

                <div className="about-text">
                    {/* Company story section */}
                    <h2>Our Story</h2>
                    <p>
                        Founded in the heart of Canada, ShopSmart is a proudly Canadian, 
                        family-owned business committed to bringing you the finest selection 
                        of products at the best prices. Our journey began with a simple vision: 
                        to create a shopping experience that truly reflects Canadian values of 
                        quality, honesty, and exceptional service.
                    </p>

                    {/* Company values grid */}
                    <div className="values-grid">
                        {/* Value card: Sustainability */}
                        <div className="value-card">
                            <i className="fas fa-leaf"></i>
                            <h3>Sustainable Choices</h3>
                            <p>Supporting eco-friendly Canadian suppliers and reducing our 
                            environmental footprint.</p>
                        </div>

                        {/* Value card: Community */}
                        <div className="value-card">
                            <i className="fas fa-handshake"></i>
                            <h3>Community First</h3>
                            <p>Building strong relationships with local communities and 
                            Canadian suppliers.</p>
                        </div>

                        {/* Value card: Quality */}
                        <div className="value-card">
                            <i className="fas fa-star"></i>
                            <h3>Quality Promise</h3>
                            <p>Carefully selecting products that meet the highest Canadian 
                            standards.</p>
                        </div>

                        {/* Value card: Inclusivity */}
                        <div className="value-card">
                            <i className="fas fa-heart"></i>
                            <h3>Canadian Spirit</h3>
                            <p>Embracing diversity and inclusivity in everything we do.</p>
                        </div>
                    </div>

                    {/* Call to action section */}
                    <div className="about-cta">
                        <h2>Join Our Community</h2>
                        <p>
                            Discover why thousands of Canadians choose ShopSmart for their 
                            everyday needs. We're more than just a store – we're your 
                            neighborhood shopping destination.
                        </p>
                        <button className="learn-more-btn">
                            Contact Us <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About; 