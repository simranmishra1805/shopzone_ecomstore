import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { db } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface WishlistModalProps {
  onClose: () => void;
}

export default function WishlistModal({ onClose }: WishlistModalProps) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = () => {
    // Mock wishlist data - in a real app, this would come from the database
    const mockWishlist = JSON.parse(localStorage.getItem(`wishlist_${user?.id}`) || '[]');
    setWishlistItems(mockWishlist);
    setLoading(false);
  };

  const removeFromWishlist = (productId: string) => {
    if (!user) return;
    
    const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updatedWishlist);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updatedWishlist));
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(product.id);
    removeFromWishlist(product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please log in</h2>
            <p className="text-gray-600 mb-4">You need to log in to view your wishlist</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <Heart className="w-6 h-6 mr-2 text-red-500" />
            My Wishlist ({wishlistItems.length} items)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-4">Save items you love to buy them later</p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((product) => (
                <div key={product.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xl font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-sm text-green-600">
                        {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_quantity === 0}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}