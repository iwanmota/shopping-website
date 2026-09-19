import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import './FloatingBag.css';

const FloatingBag = ({ onOpen, obscured, bagButtonRef }) => {
  const { cartItems } = useCart();
  const [headerBagVisible, setHeaderBagVisible] = useState(true);
  useEffect(() => {
    const button = bagButtonRef.current;
    if (!button) return;
    const observer = new IntersectionObserver(([entry]) => {
      setHeaderBagVisible(entry.isIntersecting);
    });
    observer.observe(button);
    return () => observer.disconnect();
  }, [bagButtonRef]);
  const hidden = obscured || headerBagVisible;
  const count = cartItems.reduce((total, item) => total + item.quantity, 0);
  if (count === 0) return null;

  return (
    <button
      className="floating-bag"
      onClick={onOpen}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      aria-label={`View shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`}
      aria-haspopup="dialog"
    >
      <svg
        width="25"
        height="25"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M7 10h18l2 18H5l2-18Z" />
        <path d="M11 12V8a5 5 0 0 1 10 0v4" />
      </svg>
      <span className="floating-bag-count" aria-hidden="true">
        {count > 99 ? '99+' : count}
      </span>
    </button>
  );
};

export default FloatingBag;
