import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '../types';
import { db } from '../lib/database';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const cartItems = db.cart.getItems(user.id);
      // Populate product data
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await db.products.getById(item.product_id);
          return { ...item, product: product! };
        })
      );
      setItems(itemsWithProducts);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) return;

    try {
      await db.cart.addItem(user.id, productId, quantity);
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;

    try {
      db.cart.updateQuantity(user.id, itemId, quantity);
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    try {
      db.cart.removeItem(user.id, itemId);
      await fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      db.cart.clear(user.id);
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalAmount,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}