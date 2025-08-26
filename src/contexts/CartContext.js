'use client'

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('bookCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bookCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (book) => {
    setIsLoading(true);
    
    // Add delay for testing loading spinner
    // await new Promise(resolve => setTimeout(resolve, 800));
    
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === book.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === book.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...book, quantity: 1 }];
    });
    
    setIsLoading(false);
  };

  const removeFromCart = async (bookId) => {
    setIsLoading(true);
    
    // Add delay for testing loading spinner
    // await new Promise(resolve => setTimeout(resolve, 500));
    
    setCartItems(prev => prev.filter(item => item.id !== bookId));
    setIsLoading(false);
  };

  const updateQuantity = async (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    
    setIsLoading(true);
    
    // Add delay for testing loading spinner
    // await new Promise(resolve => setTimeout(resolve, 300));
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === bookId 
          ? { ...item, quantity }
          : item
      )
    );
    
    setIsLoading(false);
  };

  const clearCart = async () => {
    setIsLoading(true);
    
    // Add delay for testing loading spinner
    // await new Promise(resolve => setTimeout(resolve, 600));
    
    setCartItems([]);
    setIsLoading(false);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
