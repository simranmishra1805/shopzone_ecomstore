import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, LogOut, Settings, Heart, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AuthModal from './AuthModal';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCategorySelect: (categoryId: string | null) => void;
  onShowCart: () => void;
  onShowAdmin: () => void;
  onShowWishlist: () => void;
  onShowOrderHistory: () => void;
  categories: any[];
}

export default function Header({ 
  onSearch, 
  onCategorySelect, 
  onShowCart, 
  onShowAdmin, 
  onShowWishlist,
  onShowOrderHistory,
  categories 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-700">ShopZone</div>
              <div className="text-xs text-gray-500 ml-1">India</div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="flex w-full">
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* User Account */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:block">{user.email?.split('@')[0]}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:block">Login</span>
                  </button>
                )}

                {/* User Dropdown */}
                {showUserMenu && user && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        onShowOrderHistory();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Package className="w-4 h-4 inline mr-2" />
                      Order History
                    </button>
                    <button
                      onClick={() => {
                        onShowWishlist();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Heart className="w-4 h-4 inline mr-2" />
                      Wishlist
                    </button>
                    <button
                      onClick={() => {
                        onShowAdmin();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Admin Panel
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={onShowCart}
                className="relative flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:block">Cart</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-gray-700 hover:text-blue-600"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Categories - Desktop */}
          <div className="hidden md:flex space-x-8 py-2 border-t">
            <button
              onClick={() => onCategorySelect(null)}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t">
            {/* Mobile Search */}
            <div className="px-4 py-3">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-r-0 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Mobile Categories */}
            <div className="px-4 py-2 border-t">
              <button
                onClick={() => {
                  onCategorySelect(null);
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left py-2 text-sm text-gray-600"
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategorySelect(category.id);
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-left py-2 text-sm text-gray-600"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}