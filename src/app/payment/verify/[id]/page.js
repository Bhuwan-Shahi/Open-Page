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
        if (data.order.status === 'PAID' || data.order.status === 'COMPLETED') {
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

      const data = await response.json();

      if (data.status === 'expired') {
        setPaymentStatus('expired');
        setOrder(prev => (prev ? { ...prev, status: 'EXPIRED' } : prev));
      } else if (data.status === 'completed' || data.status === 'paid') {
        setPaymentStatus('success');
        setOrder(prev => (prev ? { ...prev, status: data.status.toUpperCase() } : prev));
      } else {
        // Pending admin verification (manual bank-transfer flow)
        setPaymentStatus('pending');
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
            <h1 className="font-display text-2xl font-bold mb-4 text-red-700">Error</h1>
            <p className="mb-6 text-muted">{error}</p>
            <button
              onClick={() => router.push('/books')}
              className="px-6 py-2 bg-ink text-paper rounded-md hover:bg-night transition-colors"
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
            <h1 className="font-display text-2xl font-bold mb-4">Order Not Found</h1>
            <button
              onClick={() => router.push('/books')}
              className="px-6 py-2 bg-ink text-paper rounded-md hover:bg-night transition-colors"
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
        <div className="bg-card border border-line rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Payment Verification</h1>
            <p className="text-muted">Check your payment status and verify your purchase</p>
          </div>

          {/* Order Summary */}
          <div className="bg-paper border border-line rounded-xl p-6 mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Book:</span>
                <span className="font-medium text-ink">{order.book?.title || order.orderItems?.[0]?.book?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Amount Paid:</span>
                <span className="font-bold text-leaf">NPR {order.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Order ID:</span>
                <span className="font-mono text-sm text-ink">{order.id}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="text-center mb-8">
            {paymentStatus === 'pending' && (
              <div className="bg-amber/10 border border-amber/30 rounded-xl p-6">
                <div className="text-5xl mb-4" aria-hidden="true">⏳</div>
                <h3 className="font-display text-xl font-semibold mb-2 text-amber">Payment Pending</h3>
                <p className="text-ink/80">
                  We're waiting for your payment confirmation.
                  If you've already made the payment, click "Verify Payment" below.
                </p>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="bg-leaf/10 border border-leaf/30 rounded-xl p-6">
                <div className="text-5xl mb-4" aria-hidden="true">✅</div>
                <h3 className="font-display text-xl font-semibold mb-2 text-leaf">Payment Successful!</h3>
                <p className="mb-4 text-ink/80">
                  Your payment has been verified and your order is complete.
                  Your books are now available in your library.
                </p>
                <div className="space-y-3">
                  {order.orderItems?.length > 1 ? (
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full px-6 py-3 bg-leaf text-white rounded-md hover:brightness-110 font-medium transition-all"
                    >
                      📚 View Your Library
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/books/${order.orderItems?.[0]?.book?.id || order.book?.id}/success`)}
                      className="w-full px-6 py-3 bg-leaf text-white rounded-md hover:brightness-110 font-medium transition-all"
                    >
                      📖 Access Your PDF Now
                    </button>
                  )}
                  <div className="text-sm text-center text-ink/70">
                    <p>✓ Instant access to PDF download</p>
                    <p>✓ Read online or download to your device</p>
                    <p>✓ Lifetime access - no expiration</p>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="text-red-600 text-5xl mb-4" aria-hidden="true">❌</div>
                <h3 className="font-display text-xl font-semibold mb-2 text-red-700">Something went wrong</h3>
                <p className="text-red-700/90">
                  We couldn't check your payment status. Please try again in a moment.
                </p>
              </div>
            )}

            {paymentStatus === 'expired' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="text-red-600 text-5xl mb-4" aria-hidden="true">⏰</div>
                <h3 className="font-display text-xl font-semibold mb-2 text-red-700">Order Expired</h3>
                <p className="text-red-700/90">
                  This order has expired. Please create a new order to purchase this book.
                </p>
              </div>
            )}
          </div>

          {/* Bank Details Reference */}
          {paymentStatus === 'pending' && (
            <div className="bg-paper border border-line rounded-xl p-6 mb-6">
              <h3 className="font-display text-lg font-semibold mb-3">Need to Make Payment?</h3>
              <p className="mb-4 text-ink/80">
                If you haven't completed your payment yet, here are the payment details:
              </p>
              <div className="bg-card border border-line rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Bank Transfer Details:</h4>
                <div className="text-sm space-y-1 text-ink/80">
                  <p><strong>Bank:</strong> Siddhartha Bank</p>
                  <p><strong>Account:</strong> 55501525653</p>
                  <p><strong>Name:</strong> Bhuban Shahi</p>
                  <p><strong>Amount:</strong> NPR {order.total}</p>
                  <p><strong>Reference:</strong> {order.id}</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/payment/${id}`)}
                className="px-4 py-2 bg-amber text-white rounded-md hover:bg-amber-soft transition-colors"
              >
                Back to Payment Page
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/books')}
              className="flex-1 px-6 py-3 bg-ink text-paper rounded-md hover:bg-night transition-colors"
            >
              Back to Books
            </button>

            {paymentStatus === 'pending' && (
              <button
                onClick={verifyPayment}
                disabled={verifying}
                className="flex-1 px-6 py-3 bg-amber text-white rounded-md hover:bg-amber-soft transition-colors disabled:opacity-50 font-semibold"
              >
                {verifying ? 'Verifying...' : 'Verify Payment'}
              </button>
            )}

            {paymentStatus === 'failed' && (
              <button
                onClick={verifyPayment}
                disabled={verifying}
                className="flex-1 px-6 py-3 bg-amber text-white rounded-md hover:bg-amber-soft transition-colors disabled:opacity-50 font-semibold"
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
