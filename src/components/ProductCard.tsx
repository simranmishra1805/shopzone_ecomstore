import React, { useState } from 'react';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onShowAuthModal: () => void;
}

export default function ProductCard({ product, onShowAuthModal }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      onShowAuthModal();
      return;
    }
    await addToCart(product.id);
  };

  const handleWishlistToggle = () => {
    if (!user) {
      onShowAuthModal();
      return;
    }

    const wishlistKey = `wishlist_${user.id}`;
    const currentWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
    
    if (isWishlisted) {
      // Remove from wishlist
      const updatedWishlist = currentWishlist.filter((item: Product) => item.id !== product.id);
      localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
      setIsWishlisted(false);
    } else {
      // Add to wishlist
      const updatedWishlist = [...currentWishlist, product];
      localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
      setIsWishlisted(true);
    }
  };

  React.useEffect(() => {
    if (user) {
      const wishlistKey = `wishlist_${user.id}`;
      const currentWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
      setIsWishlisted(currentWishlist.some((item: Product) => item.id === product.id));
    }
  }, [user, product.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountPercentage = () => {
    // Mock discount calculation for demo
    return Math.floor(Math.random() * 30) + 10;
  };

  const getOriginalPrice = () => {
    const discount = getDiscountPercentage();
    return Math.floor(product.price * (100 + discount) / 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group relative">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
      >
        <Heart 
          className={`w-5 h-5 transition-colors ${
            isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'
          }`} 
        />
      </button>

      {/* Discount Badge */}
      <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
        {getDiscountPercentage()}% OFF
      </div>

      <div className="aspect-square overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-sm text-gray-500 ml-2">(4.0)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-gray-800">
                {formatPrice(product.price)}
              </div>
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(getOriginalPrice())}
              </div>
            </div>
            <div className="text-sm text-green-600">
              {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}