import React from 'react';
import { Link } from 'react-router-dom';

export default function Brand() {
  return (
    <Link className="brand" to="/" aria-label="ShopSmart home">
      <svg className="maple-mark" viewBox="0 0 32 34" aria-hidden="true">
        <path d="M16 1 20 9 23 7 22 16 27 12 28 16 32 15 29 22 30 24 19 27 19 29 17 28 17 33 15 33 15 28 13 29 13 27 2 24 3 22 0 15 4 16 5 12 10 16 9 7 12 9Z" />
      </svg>
      ShopSmart
    </Link>
  );
}
