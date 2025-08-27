'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentVerificationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success, failed, expired
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

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        
        // Check if order is already paid
        if (data.order.status === 'COMPLETED') {
          setPaymentStatus('success');
        } else if (data.order.status === 'EXPIRED') {
          setPaymentStatus('expired');
        }
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

  const verifyPayment = async () => {
    setVerifying(true);
    try {
      const response = await fetch(`/api/orders/${id}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verified) {
          setPaymentStatus('success');
          setOrder(prev => ({ ...prev, status: 'COMPLETED' }));
        } else {
          setPaymentStatus('failed');
        }
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('failed');
    } finally {
      setVerifying(false);
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
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>Payment Verification</h1>
            <p style={{ color: '#6B7280' }}>Check your payment status and verify your purchase</p>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#1F2937' }}>Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span style={{ color: '#6B7280' }}>Book:</span>
                <span className="font-medium" style={{ color: '#1F2937' }}>{order.book?.title}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#6B7280' }}>Amount Paid:</span>
                <span className="font-bold" style={{ color: '#059669' }}>NPR {order.total}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#6B7280' }}>Order ID:</span>
                <span className="font-mono text-sm" style={{ color: '#1F2937' }}>{order.id}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="text-center mb-8">
            {paymentStatus === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="text-yellow-600 text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#D97706' }}>Payment Pending</h3>
                <p style={{ color: '#92400E' }}>
                  We're waiting for your payment confirmation. 
                  If you've already made the payment, click "Verify Payment" below.
                </p>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-green-600 text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#059669' }}>Payment Successful!</h3>
                <p className="mb-4" style={{ color: '#047857' }}>
                  Your payment has been verified and your order is complete.
                  You now have lifetime access to the PDF.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/books/${order.book?.id}`)}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    📖 Access Your PDF Now
                  </button>
                  <div className="text-sm text-center" style={{ color: '#047857' }}>
                    <p>✓ Instant access to PDF download</p>
                    <p>✓ Read online or download to your device</p>
                    <p>✓ Lifetime access - no expiration</p>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="text-red-600 text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#DC2626' }}>Payment Not Found</h3>
                <p style={{ color: '#B91C1C' }}>
                  We couldn't verify your payment. Please ensure you've completed the payment 
                  and try verifying again.
                </p>
              </div>
            )}

            {paymentStatus === 'expired' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="text-red-600 text-6xl mb-4">⏰</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#DC2626' }}>Order Expired</h3>
                <p style={{ color: '#B91C1C' }}>
                  This order has expired. Please create a new order to purchase this book.
                </p>
              </div>
            )}
          </div>

          {/* QR Code Reference */}
          {paymentStatus === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1E3A8A' }}>Need to Make Payment?</h3>
              <p className="mb-4" style={{ color: '#1E40AF' }}>
                If you haven't completed your payment yet, here are the payment details:
              </p>
              <div className="bg-white p-4 rounded border mb-4">
                <h4 className="font-semibold mb-2">Bank Transfer Details:</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Bank:</strong> Siddhartha Bank</p>
                  <p><strong>Account:</strong> 55501525653</p>
                  <p><strong>Name:</strong> Bhuban Shahi</p>
                  <p><strong>Amount:</strong> NPR {order.total}</p>
                  <p><strong>Reference:</strong> {order.id}</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/payment/${id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Payment Page
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/books')}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Books
            </button>
            
            {paymentStatus === 'pending' && (
              <button
                onClick={verifyPayment}
                disabled={verifying}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify Payment'}
              </button>
            )}

            {paymentStatus === 'failed' && (
              <button
                onClick={verifyPayment}
                disabled={verifying}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {verifying ? 'Checking...' : 'Check Again'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
