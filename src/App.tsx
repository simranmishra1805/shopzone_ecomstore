import React, { useState, useEffect } from 'react';
import { Product, Category } from './types';
import { db } from './lib/database';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import WishlistModal from './components/WishlistModal';
import OrderHistoryModal from './components/OrderHistoryModal';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('newest');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let productsData = await db.products.getAll();

      // Filter by category
      if (selectedCategory) {
        productsData = productsData.filter(p => p.category_id === selectedCategory);
      }

      // Filter by search query
      if (searchQuery) {
        productsData = productsData.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sort products
      switch (sortBy) {
        case 'name':
          productsData.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'price-low':
          productsData.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          productsData.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          productsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await db.categories.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Header
            onSearch={handleSearch}
            onCategorySelect={handleCategorySelect}
            onShowCart={() => setShowCart(true)}
            onShowAdmin={() => setShowAdmin(true)}
            onShowWishlist={() => setShowWishlist(true)}
            onShowOrderHistory={() => setShowOrderHistory(true)}
            categories={categories}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {searchQuery ? `Search results for "${searchQuery}"` :
                     selectedCategory ? 
                       categories.find(c => c.id === selectedCategory)?.name || 'Products' :
                       'All Products'}
                  </h1>
                  <p className="text-gray-600">
                    Discover amazing products at great prices
                  </p>
                </div>
                
                {/* Sort Options */}
                <div className="mt-4 sm:mt-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="name">Name A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${products.length} products found`}
              </div>
            </div>

            <ProductGrid
              products={products}
              loading={loading}
              onShowAuthModal={() => setShowAuthModal(true)}
            />
          </main>

          {/* Modals */}
          {showCart && <Cart onClose={() => setShowCart(false)} />}
          {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
          {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
          {showWishlist && <WishlistModal onClose={() => setShowWishlist(false)} />}
          {showOrderHistory && <OrderHistoryModal onClose={() => setShowOrderHistory(false)} />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;