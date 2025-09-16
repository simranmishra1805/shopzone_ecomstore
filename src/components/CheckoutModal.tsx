import React, { useState } from 'react';
import { X, CreditCard, MapPin, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/database';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ onClose, onSuccess }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  
  const { items, getTotalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Create order
      const addressString = `${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`;
      
      const order = await db.orders.create({
        user_id: user.id,
        total_amount: getTotalAmount(),
        shipping_address: addressString,
        status: 'pending'
      });

      // Create order items
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
        product: item.product
      }));

      await db.orders.addOrderItems(order.id, orderItems);

      // Update product stock
      for (const item of items) {
        const product = await db.products.getById(item.product_id);
        if (product) {
          await db.products.update(item.product_id, {
            stock_quantity: Math.max(0, product.stock_quantity - item.quantity)
          });
        }
      }

      // Clear cart
      await clearCart();
      
      setOrderId(order.id);
      setOrderPlaced(true);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (orderPlaced) {
      onSuccess();
    } else {
      onClose();
    }
  };

  if (orderPlaced) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600">Thank you for your purchase</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-mono font-semibold">#{orderId.slice(-8)}</p>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p>• You will receive an email confirmation shortly</p>
            <p>• Your order will be processed within 24 hours</p>
            <p>• Estimated delivery: 3-5 business days</p>
          </div>
          
          <button
            onClick={handleClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Checkout</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(getTotalAmount())}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Method
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-gray-600">Pay when your order arrives</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Placing Order...' : `Place Order - ${formatPrice(getTotalAmount())}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}