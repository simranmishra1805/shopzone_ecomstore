import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Order } from '../types';
import { db } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

interface OrderHistoryModalProps {
  onClose: () => void;
}

export default function OrderHistoryModal({ onClose }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = () => {
    if (!user) return;
    
    const userOrders = db.orders.getByUserId(user.id);
    setOrders(userOrders.reverse()); // Show newest first
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please log in</h2>
            <p className="text-gray-600 mb-4">You need to log in to view your order history</p>
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
            <Package className="w-6 h-6 mr-2 text-blue-600" />
            Order History ({orders.length} orders)
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
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">When you place orders, they'll appear here</p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border rounded-lg shadow-sm">
                  {/* Order Header */}
                  <div className="p-6 border-b bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.id.slice(-8)}</h3>
                          <p className="text-sm text-gray-600">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(order.total_amount)}
                          </p>
                          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h4 className="font-medium mb-4">Items ({order.order_items?.length || 0})</h4>
                    <div className="space-y-4">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          {item.product && (
                            <>
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium">{item.product.name}</h5>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium mb-2">Shipping Address</h5>
                      <p className="text-sm text-gray-700">{order.shipping_address}</p>
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