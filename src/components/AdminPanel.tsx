import React, { useState, useEffect } from 'react';
import { X, Package, ShoppingBag, Users, TrendingUp, AlertTriangle, Plus, Edit2, Trash2, Save, BarChart3, DollarSign } from 'lucide-react';
import { Product, Category, Order, DashboardStats } from '../types';
import { db } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { user } = useAuth();

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    stock_quantity: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData, ordersData] = await Promise.all([
        db.products.getAll(),
        db.categories.getAll(),
        db.orders.getAll()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setOrders(ordersData);
      
      // Calculate dashboard stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + order.total_amount, 0);
      const lowStockProducts = productsData.filter(p => p.stock_quantity < 10).length;
      const recentOrders = ordersData.slice(-5).reverse();
      
      // Calculate top products (mock data for demo)
      const topProducts = productsData.slice(0, 5).map(product => ({
        product,
        sales: Math.floor(Math.random() * 100) + 10
      }));

      // Calculate monthly revenue (mock data for demo)
      const monthlyRevenue = [
        { month: 'Jan', revenue: Math.floor(Math.random() * 100000) + 50000 },
        { month: 'Feb', revenue: Math.floor(Math.random() * 100000) + 50000 },
        { month: 'Mar', revenue: Math.floor(Math.random() * 100000) + 50000 },
        { month: 'Apr', revenue: Math.floor(Math.random() * 100000) + 50000 },
        { month: 'May', revenue: Math.floor(Math.random() * 100000) + 50000 },
        { month: 'Jun', revenue: Math.floor(Math.random() * 100000) + 50000 },
      ];

      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalRevenue,
        totalUsers: JSON.parse(localStorage.getItem('shopzone_users') || '[]').length,
        lowStockProducts,
        recentOrders,
        topProducts,
        monthlyRevenue
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      stock_quantity: ''
    });
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: ''
    });
    setEditingCategory(null);
    setShowAddCategory(false);
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category_id: product.category_id,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity.toString()
    });
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      name: category.name,
      description: category.description
    });
    setEditingCategory(category);
    setShowAddCategory(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category_id: productForm.category_id,
      image_url: productForm.image_url,
      stock_quantity: parseInt(productForm.stock_quantity)
    };

    try {
      if (editingProduct) {
        await db.products.update(editingProduct.id, productData);
      } else {
        await db.products.create(productData);
      }

      await fetchData();
      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await db.categories.update(editingCategory.id, categoryForm);
      } else {
        await db.categories.create(categoryForm);
      }

      await fetchData();
      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await db.products.delete(productId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await db.categories.delete(categoryId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleOrderStatusUpdate = (orderId: string, status: string) => {
    db.orders.updateStatus(orderId, status);
    fetchData();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart3 className="w-8 h-8 mr-3" />
            ShopZone Admin Dashboard
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b bg-gray-50">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'categories', label: 'Categories', icon: ShoppingBag },
            { id: 'orders', label: 'Orders', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && stats && (
                <div className="p-6 overflow-y-auto h-full">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Total Products</p>
                          <p className="text-3xl font-bold">{stats.totalProducts}</p>
                        </div>
                        <Package className="w-12 h-12 text-blue-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Total Orders</p>
                          <p className="text-3xl font-bold">{stats.totalOrders}</p>
                        </div>
                        <ShoppingBag className="w-12 h-12 text-green-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Total Revenue</p>
                          <p className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                        </div>
                        <DollarSign className="w-12 h-12 text-purple-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">Low Stock Alert</p>
                          <p className="text-3xl font-bold">{stats.lowStockProducts}</p>
                        </div>
                        <AlertTriangle className="w-12 h-12 text-orange-200" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders */}
                    <div className="bg-white border rounded-lg shadow-sm">
                      <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">Recent Orders</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {stats.recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">Order #{order.id.slice(-8)}</p>
                                <p className="text-sm text-gray-600">{formatPrice(order.total_amount)}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white border rounded-lg shadow-sm">
                      <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">Top Products</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {stats.topProducts.map((item, index) => (
                            <div key={item.product.id} className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                                {index + 1}
                              </div>
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium truncate">{item.product.name}</p>
                                <p className="text-sm text-gray-600">{item.sales} sales</p>
                              </div>
                              <p className="font-semibold">{formatPrice(item.product.price)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="flex h-full">
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Products ({products.length})</h3>
                      <button
                        onClick={() => setShowAddProduct(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <div key={product.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="p-4">
                            <h4 className="font-semibold mb-2 truncate">{product.name}</h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.stock_quantity > 10 ? 'bg-green-100 text-green-800' :
                                product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Stock: {product.stock_quantity}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add/Edit Product Form */}
                  {showAddProduct && (
                    <div className="w-96 border-l bg-gray-50 p-6 overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <button
                          onClick={resetProductForm}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name
                          </label>
                          <input
                            type="text"
                            value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={productForm.category_id}
                            onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image URL
                          </label>
                          <input
                            type="url"
                            value={productForm.image_url}
                            onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            value={productForm.stock_quantity}
                            onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="flex h-full">
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Categories ({categories.length})</h3>
                      <button
                        onClick={() => setShowAddCategory(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Category</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categories.map((category) => (
                        <div key={category.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                          <h4 className="font-semibold text-lg mb-2">{category.name}</h4>
                          <p className="text-gray-600 mb-4">{category.description}</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add/Edit Category Form */}
                  {showAddCategory && (
                    <div className="w-96 border-l bg-gray-50 p-6 overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">
                          {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h3>
                        <button
                          onClick={resetCategoryForm}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name
                          </label>
                          <input
                            type="text"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{editingCategory ? 'Update Category' : 'Add Category'}</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="p-6 overflow-y-auto h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Orders ({orders.length})</h3>
                  </div>

                  <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{order.id.slice(-8)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.user_id.slice(-8)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                {formatPrice(order.total_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                  className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button className="text-blue-600 hover:text-blue-800 font-medium">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}