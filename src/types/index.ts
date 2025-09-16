export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  created_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  lowStockProducts: number;
  recentOrders: Order[];
  topProducts: { product: Product; sales: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}