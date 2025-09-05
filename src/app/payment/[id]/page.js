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
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);

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
        
        // If order is already paid, redirect to success page or dashboard
        if (data.order.status === 'PAID' || data.order.status === 'COMPLETED') {
          router.push('/dashboard?payment=success');
          return;
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

  const handleScreenshotUpload = async (file) => {
    if (!file) return;

    setUploadingScreenshot(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', id);
      formData.append('type', 'payment-screenshot');

      const response = await fetch('/api/upload-payment-screenshot', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setScreenshotUploaded(true);
        setPaymentScreenshot(null);
        alert('Payment screenshot uploaded successfully! We will verify your payment shortly.');
      } else {
        setError(data.error || 'Failed to upload screenshot');
      }
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      setError('Failed to upload screenshot');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setPaymentScreenshot(file);
      setError('');
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
            <p style={{ color: '#6B7280' }}>
              Scan the QR code below to pay for your {order.orderItems?.length > 1 ? 'books' : 'book'}
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#1F2937' }}>Order Details</h2>
            
            {/* Multiple items display */}
            {order.orderItems && order.orderItems.length > 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <span className="font-medium" style={{ color: '#1F2937' }}>{item.book?.title}</span>
                        <br />
                        <span className="text-sm" style={{ color: '#6B7280' }}>by {item.book?.author}</span>
                      </div>
                      <span className="font-semibold" style={{ color: '#059669' }}>NPR {item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span style={{ color: '#6B7280' }}>Total Amount:</span>
                    <span className="font-bold" style={{ color: '#059669' }}>NPR {order.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#6B7280' }}>Order ID:</span>
                    <span className="font-mono text-sm" style={{ color: '#1F2937' }}>{order.id}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Single item display */
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Book:</span>
                  <span className="font-medium" style={{ color: '#1F2937' }}>{order.book?.title || order.orderItems?.[0]?.book?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Author:</span>
                  <span className="font-medium" style={{ color: '#1F2937' }}>{order.book?.author || order.orderItems?.[0]?.book?.author}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Price:</span>
                  <span className="font-bold" style={{ color: '#059669' }}>NPR {order.total}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Order ID:</span>
                  <span className="font-mono text-sm" style={{ color: '#1F2937' }}>{order.id}</span>
                </div>
              </div>
            )}
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
              {/* Official Siddhartha Bank QR Code */}
              <div className="mb-4">
                <img 
                  src="/siddartha-qr.png" 
                  alt="Siddhartha Bank QR Code" 
                  className="w-64 h-64 mx-auto object-contain"
                />
              </div>
              
              {/* Amount Alert */}
              <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-2">
                <p className="text-red-800 font-bold text-lg">
                  ⚠️ ENTER AMOUNT: NPR {order.total}
                </p>
                <p className="text-red-700 text-sm">
                  After scanning, manually enter the amount above
                </p>
              </div>
              
              
            </div>
            <p className="text-sm mt-4" style={{ color: '#6B7280' }}>
              Scan with Siddhartha Bank app or any mobile banking app
            </p>
          </div>


          {/* Payment Screenshot Upload */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#1F2937' }}>📸 Upload Payment Screenshot</h3>
            <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
              After completing your payment, upload a screenshot of your transaction for faster verification.
            </p>
            
            {!screenshotUploaded ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshot-upload"
                    disabled={uploadingScreenshot}
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="cursor-pointer"
                  >
                    <div className="text-blue-500 text-4xl mb-2">📱</div>
                    <p className="text-blue-600 font-medium">Click to select screenshot</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG, or JPEG (max 5MB)</p>
                  </label>
                </div>
                
                {paymentScreenshot && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm font-medium">{paymentScreenshot.name}</span>
                      </div>
                      <button
                        onClick={() => setPaymentScreenshot(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                    <button
                      onClick={() => handleScreenshotUpload(paymentScreenshot)}
                      disabled={uploadingScreenshot}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {uploadingScreenshot ? 'Uploading...' : 'Upload Screenshot'}
                    </button>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <p className="text-green-800 font-medium">Screenshot uploaded successfully!</p>
                <p className="text-green-700 text-sm mt-1">We will verify your payment and notify you soon.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => router.push('/books')}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel Order
            </button>
            <button
              onClick={fetchOrder}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Status
            </button>
          </div>

          
        </div>
      </div>
    </Layout>
  );
}
