import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-container">
            <div className="about-header">
                <h1>About ShopSmart</h1>
                <div className="decorative-line"></div>
            </div>
            
            <div className="about-content">
                <div className="about-image">
                    <img 
                        src="/images/about/store-front.jpg" 
                        alt="ShopSmart Store Front" 
                        className="main-image"
                    />
                    <div className="image-overlay">
                        <span>Est. 2024</span>
                    </div>
                </div>

                <div className="about-text">
                    <h2>Our Story</h2>
                    <p>
                        Founded in the heart of Canada, ShopSmart is a family-owned business 
                        committed to bringing you the finest selection of electronics and 
                        home goods. Since our establishment, we've maintained a simple philosophy: 
                        provide exceptional products at fair prices while caring for our 
                        environment and community.
                    </p>

                    <div className="values-grid">
                        <div className="value-card">
                            <i className="fas fa-leaf"></i>
                            <h3>Sustainable Sourcing</h3>
                            <p>We partner exclusively with suppliers who share our commitment 
                            to environmental stewardship.</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-handshake"></i>
                            <h3>Family Values</h3>
                            <p>As a family-owned business, we treat every customer as part 
                            of our extended family.</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-star"></i>
                            <h3>Quality First</h3>
                            <p>Every product in our catalog is carefully selected and 
                            tested for quality and durability.</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-heart"></i>
                            <h3>Community Focus</h3>
                            <p>We're proud to be Canadian and actively contribute to our 
                            local community's growth.</p>
                        </div>
                    </div>

                    <div className="about-cta">
                        <h2>Our Commitment</h2>
                        <p>
                            We believe in a sustainable future where quality products don't 
                            come at the expense of our environment. That's why we carefully 
                            vet each supplier, ensuring they meet our strict standards for 
                            environmental responsibility and ethical practices.
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