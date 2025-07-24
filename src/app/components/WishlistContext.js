"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const toggleWishlist = (productId) => {
    const idStr = String(productId);
    setWishlist(prev =>
      prev.includes(idStr)
        ? prev.filter(id => id !== idStr)
        : [...prev, idStr]
    );
  };

  const isInWishlist = (productId) => wishlist.includes(String(productId));

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
} 