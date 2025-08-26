'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import InteractiveButton from '@/components/InteractiveButton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function CartPage() {
  const { cartItems, isLoading, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/cart');
    }
  }, [user, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  // Don't render cart if user is not authenticated
  if (!user) {
    return null;
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    // In a real app, this would process the payment
    alert('Checkout completed! (This is a demo)');
    clearCart();
    setIsCheckingOut(false);
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ color: '#6B728E' }}>🛒</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#2D3748' }}>Your Cart is Empty</h2>
          <p className="mb-6" style={{ color: '#6B728E' }}>Add some books to get started!</p>
          <InteractiveButton href="/books" variant="primary">
            Browse Books
          </InteractiveButton>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Loading overlay for cart operations */}
      {(isLoading || isCheckingOut) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner 
              size="large" 
              text={isCheckingOut ? "Processing checkout..." : "Updating cart..."} 
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#2D3748' }}>
            Shopping Cart
          </h1>
          <button
            onClick={clearCart}
            disabled={isLoading}
            className="transition-colors disabled:opacity-50"
            style={{ color: '#F87171' }}
            onMouseEnter={(e) => !isLoading && (e.target.style.color = '#EF4444')}
            onMouseLeave={(e) => !isLoading && (e.target.style.color = '#F87171')}
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center space-x-4">
                  {/* Book Cover */}
                  <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        width={64}
                        height={80}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="text-gray-400 text-2xl">📖</div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: '#2D3748' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm" style={{ color: '#6B728E' }}>by {item.author}</p>
                    <p className="font-bold" style={{ color: '#F5A623' }}>
                      Rs. {item.price}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={isLoading}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                      style={{ borderColor: '#D1D5DB' }}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isLoading}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                      style={{ borderColor: '#D1D5DB' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-6 bg-white sticky top-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D3748' }}>
                Order Summary
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs. {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>Rs. 0.00</span>
                </div>
                <div className="border-t pt-2" style={{ borderColor: '#D1D5DB' }}>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span style={{ color: '#F5A623' }}>Rs. {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading || isCheckingOut}
                className="w-full py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: '#4A90E2', 
                  color: 'white',
                  cursor: isLoading || isCheckingOut ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !isLoading && !isCheckingOut && (e.target.style.backgroundColor = '#357ABD')}
                onMouseLeave={(e) => !isLoading && !isCheckingOut && (e.target.style.backgroundColor = '#4A90E2')}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <div className="mt-4 text-center">
                <InteractiveButton href="/books" variant="secondary" className="w-full">
                  Continue Shopping
                </InteractiveButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
