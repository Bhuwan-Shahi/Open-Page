'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentScreenshotsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'verified', 'all'
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (user.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      
      fetchScreenshots();
    }
  }, [user, authLoading, router, filter]);

  const fetchScreenshots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/payment-screenshots?status=${filter}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setScreenshots(data.screenshots || []);
      }
    } catch (error) {
      console.error('Error fetching screenshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (screenshotId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this payment?`)) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/admin/payment-screenshots', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screenshotId,
          action
        }),
      });

      if (response.ok) {
        alert(`Payment ${action}ed successfully!`);
        fetchScreenshots();
        setSelectedScreenshot(null);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    } finally {
      setProcessing(false);
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

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Screenshots</h1>
          <p className="text-gray-600">Verify and manage payment screenshots from customers</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'pending', label: 'Pending Verification', count: screenshots.filter(s => !s.verified).length },
                { key: 'verified', label: 'Verified', count: screenshots.filter(s => s.verified).length },
                { key: 'all', label: 'All Screenshots', count: screenshots.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {filter === tab.key && (
                    <span className="ml-2 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Screenshots Grid */}
        {screenshots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.id}
                className="bg-white rounded-lg shadow border overflow-hidden"
              >
                {/* Screenshot Image */}
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={screenshot.filePath}
                    alt="Payment Screenshot"
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setSelectedScreenshot(screenshot)}
                  />
                  {screenshot.verified && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      ✓ Verified
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Order #{screenshot.order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Amount: NPR {screenshot.order.total}
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3 text-sm">
                    <p className="text-gray-600">
                      <strong>Customer:</strong> {screenshot.order.user.name}
                    </p>
                    <p className="text-gray-600">
                      <strong>Email:</strong> {screenshot.order.user.email}
                    </p>
                    <p className="text-gray-600">
                      <strong>Phone:</strong> {screenshot.order.user.phone}
                    </p>
                  </div>

                  {/* Books */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Books:</p>
                    {screenshot.order.orderItems.map((item, index) => (
                      <p key={index} className="text-xs text-gray-600">
                        • {item.book.title} by {item.book.author}
                      </p>
                    ))}
                  </div>

                  {/* Upload Time */}
                  <div className="mb-4 text-xs text-gray-500">
                    Uploaded: {new Date(screenshot.uploadedAt).toLocaleString()}
                  </div>

                  {/* Action Buttons */}
                  {!screenshot.verified ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAction(screenshot.id, 'verify')}
                        disabled={processing}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                      >
                        ✓ Verify
                      </button>
                      <button
                        onClick={() => handleAction(screenshot.id, 'reject')}
                        disabled={processing}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-green-600 text-sm font-medium">
                        ✓ Payment Verified
                      </span>
                      {screenshot.verifiedAt && (
                        <p className="text-xs text-gray-500">
                          on {new Date(screenshot.verifiedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No payment screenshots
            </h3>
            <p className="text-gray-500">
              {filter === 'pending' 
                ? 'No pending screenshots to verify'
                : filter === 'verified'
                ? 'No verified screenshots yet'
                : 'No screenshots have been uploaded yet'
              }
            </p>
          </div>
        )}

        {/* Screenshot Modal */}
        {selectedScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Payment Screenshot - Order #{selectedScreenshot.order.id.slice(-8)}
                  </h3>
                  <button
                    onClick={() => setSelectedScreenshot(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4">
                <img
                  src={selectedScreenshot.filePath}
                  alt="Payment Screenshot"
                  className="w-full max-h-96 object-contain mb-4"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Customer:</strong> {selectedScreenshot.order.user.name}</p>
                    <p><strong>Email:</strong> {selectedScreenshot.order.user.email}</p>
                    <p><strong>Phone:</strong> {selectedScreenshot.order.user.phone}</p>
                  </div>
                  <div>
                    <p><strong>Amount:</strong> NPR {selectedScreenshot.order.total}</p>
                    <p><strong>Uploaded:</strong> {new Date(selectedScreenshot.uploadedAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> {selectedScreenshot.verified ? 'Verified' : 'Pending'}</p>
                  </div>
                </div>
                {!selectedScreenshot.verified && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleAction(selectedScreenshot.id, 'verify')}
                      disabled={processing}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      ✓ Verify Payment
                    </button>
                    <button
                      onClick={() => handleAction(selectedScreenshot.id, 'reject')}
                      disabled={processing}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      ✗ Reject Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
