'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id && user) {
      fetchOrder();
    }
  }, [id, user, authLoading]);

  useEffect(() => {
    if (order && order.expiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(order.expiresAt).getTime();
        const difference = expiry - now;

        if (difference > 0) {
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft('Expired');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#DC2626' }}>Error</h1>
            <p className="mb-6" style={{ color: '#6B7280' }}>{error}</p>
            <button
              onClick={() => router.push('/books')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Books
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#1F2937' }}>Order Not Found</h1>
            <button
              onClick={() => router.push('/books')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Books
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>Complete Payment</h1>
            <p style={{ color: '#6B7280' }}>Scan the QR code below to pay for your book</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#1F2937' }}>Order Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span style={{ color: '#6B7280' }}>Book:</span>
                <span className="font-medium" style={{ color: '#1F2937' }}>{order.book?.title}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#6B7280' }}>Author:</span>
                <span className="font-medium" style={{ color: '#1F2937' }}>{order.book?.author}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#6B7280' }}>Price:</span>
                <span className="font-bold" style={{ color: '#059669' }}>Rs. {order.total}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#6B7280' }}>Order ID:</span>
                <span className="font-mono text-sm" style={{ color: '#1F2937' }}>{order.id}</span>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-orange-100 px-4 py-2 rounded-full" style={{ color: '#9A3412' }}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">
                {timeLeft === 'Expired' ? 'Payment Expired' : `Time remaining: ${timeLeft}`}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center mb-8">
            <div className="inline-block bg-white p-4 rounded-lg shadow-md">
              <img 
                src={order.qrCode} 
                alt="Payment QR Code" 
                className="w-64 h-64 mx-auto"
              />
            </div>
            <p className="text-sm mt-4" style={{ color: '#6B7280' }}>
              Scan this QR code with your payment app
            </p>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#1E3A8A' }}>Payment Instructions</h3>
            <ol className="space-y-2" style={{ color: '#1E40AF' }}>
              <li>1. Open your preferred UPI payment app (PhonePe, Paytm, GPay, etc.)</li>
              <li>2. Scan the QR code above</li>
              <li>3. Verify the amount: Rs. {order.total}</li>
              <li>4. Complete the payment</li>
              <li>5. You'll receive access to the PDF immediately after payment</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/books')}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel Order
            </button>
            <button
              onClick={fetchOrder}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Check Payment Status
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
