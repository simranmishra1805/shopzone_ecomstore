import { Product, Category, CartItem, Order, OrderItem, User } from '../types';

// Local storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'shopzone_products',
  CATEGORIES: 'shopzone_categories',
  CART: 'shopzone_cart',
  ORDERS: 'shopzone_orders',
  USERS: 'shopzone_users',
  CURRENT_USER: 'shopzone_current_user',
};

// Generate UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Initialize sample data
const initializeData = () => {
  // Categories
  const categories: Category[] = [
    {
      id: '1',
      name: 'Electronics',
      description: 'Latest gadgets and electronics',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Fashion',
      description: 'Trendy clothing and accessories',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Home & Kitchen',
      description: 'Home appliances and kitchen essentials',
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Books',
      description: 'Books and educational materials',
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Sports',
      description: 'Sports equipment and fitness gear',
      created_at: new Date().toISOString(),
    },
  ];

  // Products
  const products: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced camera system and A17 Pro chip',
      price: 134900,
      category_id: '1',
      image_url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
      stock_quantity: 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Premium Android smartphone with S Pen and 200MP camera',
      price: 129999,
      category_id: '1',
      image_url: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg',
      stock_quantity: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'MacBook Air M3',
      description: '13-inch laptop with M3 chip, perfect for work and creativity',
      price: 114900,
      category_id: '1',
      image_url: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg',
      stock_quantity: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Nike Air Max 270',
      description: 'Comfortable running shoes with Max Air cushioning',
      price: 12995,
      category_id: '2',
      image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
      stock_quantity: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Levi\'s 501 Original Jeans',
      description: 'Classic straight-fit jeans, the original blue jean since 1873',
      price: 4999,
      category_id: '2',
      image_url: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg',
      stock_quantity: 40,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'KitchenAid Stand Mixer',
      description: 'Professional 5-quart stand mixer for all your baking needs',
      price: 34999,
      category_id: '3',
      image_url: 'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg',
      stock_quantity: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '7',
      name: 'The Psychology of Money',
      description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel',
      price: 399,
      category_id: '4',
      image_url: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
      stock_quantity: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '8',
      name: 'Yoga Mat Premium',
      description: 'Non-slip yoga mat with extra cushioning for comfortable practice',
      price: 2499,
      category_id: '5',
      image_url: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg',
      stock_quantity: 35,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Initialize data if not exists
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
};

// Database operations
export const db = {
  // Initialize
  init: () => {
    initializeData();
  },

  // Products
  products: {
    getAll: async (): Promise<Product[]> => {
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      
      return products.map((product: Product) => ({
        ...product,
        category: categories.find((cat: Category) => cat.id === product.category_id)
      }));
    },

    getById: async (id: string): Promise<Product | null> => {
      const products = await db.products.getAll();
      return products.find(p => p.id === id) || null;
    },

    create: async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const newProduct: Product = {
        ...productData,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      products.push(newProduct);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return newProduct;
    },

    update: async (id: string, updates: Partial<Product>): Promise<Product> => {
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const index = products.findIndex((p: Product) => p.id === id);
      if (index === -1) throw new Error('Product not found');
      
      products[index] = {
        ...products[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return products[index];
    },

    delete: async (id: string): Promise<void> => {
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const filtered = products.filter((p: Product) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    },
  },

  // Categories
  categories: {
    getAll: async (): Promise<Category[]> => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    },

    create: async (categoryData: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
      const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      const newCategory: Category = {
        ...categoryData,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      categories.push(newCategory);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return newCategory;
    },

    update: async (id: string, updates: Partial<Category>): Promise<Category> => {
      const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      const index = categories.findIndex((c: Category) => c.id === id);
      if (index === -1) throw new Error('Category not found');
      
      categories[index] = { ...categories[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return categories[index];
    },

    delete: async (id: string): Promise<void> => {
      const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      const filtered = categories.filter((c: Category) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    },
  },

  // Users
  users: {
    create: async (email: string, password: string): Promise<User> => {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const existingUser = users.find((u: User) => u.email === email);
      if (existingUser) throw new Error('User already exists');

      const newUser: User = {
        id: generateId(),
        email,
        password, // In production, this should be hashed
        created_at: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return newUser;
    },

    authenticate: async (email: string, password: string): Promise<User> => {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const user = users.find((u: User) => u.email === email && u.password === password);
      if (!user) throw new Error('Invalid credentials');
      return user;
    },

    getCurrentUser: (): User | null => {
      const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userStr ? JSON.parse(userStr) : null;
    },

    setCurrentUser: (user: User | null): void => {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    },
  },

  // Cart
  cart: {
    getItems: (userId: string): CartItem[] => {
      const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '{}');
      return cart[userId] || [];
    },

    addItem: async (userId: string, productId: string, quantity: number = 1): Promise<void> => {
      const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '{}');
      if (!cart[userId]) cart[userId] = [];

      const existingItem = cart[userId].find((item: CartItem) => item.product_id === productId);
      const product = await db.products.getById(productId);
      if (!product) throw new Error('Product not found');

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart[userId].push({
          id: generateId(),
          user_id: userId,
          product_id: productId,
          quantity,
          created_at: new Date().toISOString(),
          product,
        });
      }

      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    },

    updateQuantity: (userId: string, itemId: string, quantity: number): void => {
      const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '{}');
      if (!cart[userId]) return;

      const item = cart[userId].find((item: CartItem) => item.id === itemId);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      }
    },

    removeItem: (userId: string, itemId: string): void => {
      const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '{}');
      if (!cart[userId]) return;

      cart[userId] = cart[userId].filter((item: CartItem) => item.id !== itemId);
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    },

    clear: (userId: string): void => {
      const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '{}');
      cart[userId] = [];
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    },
  },

  // Orders
  orders: {
    create: async (orderData: Omit<Order, 'id' | 'created_at' | 'order_items'>): Promise<Order> => {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      const newOrder: Order = {
        ...orderData,
        id: generateId(),
        created_at: new Date().toISOString(),
        order_items: [],
      };
      orders.push(newOrder);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return newOrder;
    },

    addOrderItems: async (orderId: string, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]): Promise<void> => {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      const order = orders.find((o: Order) => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const orderItems = items.map(item => ({
        ...item,
        id: generateId(),
        order_id: orderId,
        created_at: new Date().toISOString(),
      }));

      order.order_items = orderItems;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    },

    getByUserId: (userId: string): Order[] => {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      return orders.filter((o: Order) => o.user_id === userId);
    },

    getAll: (): Order[] => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    },

    updateStatus: (orderId: string, status: string): void => {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      const order = orders.find((o: Order) => o.id === orderId);
      if (order) {
        order.status = status;
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      }
    },
  },
};