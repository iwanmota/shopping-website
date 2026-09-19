import React from 'react';
import { Link } from 'react-router-dom';
import Brand from './Brand';

export default function Footer() {
    return <footer className="site-footer"><Brand /><span>Everyday essentials. Rooted in Canada.</span><Link to="/about">Our story ↗</Link></footer>;
}
