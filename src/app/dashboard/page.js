'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [bookAccess, setBookAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    // Check if redirected from successful payment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      // Remove the query parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
        return;
      }
      
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch notifications
      const notifResponse = await fetch('/api/notifications', {
        credentials: 'include'
      });
      
      if (notifResponse.ok) {
        const notifData = await notifResponse.json();
        setNotifications(notifData.notifications || []);
        setUnreadCount(notifData.notifications.filter(n => !n.read).length);
      }

      // Fetch purchased books (orders with PAID or COMPLETED status)
      const ordersResponse = await fetch('/api/user/orders', {
        credentials: 'include'
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setPurchasedBooks(ordersData.orders || []);
        setBookAccess(ordersData.bookAccess || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          notificationId,
          action: 'mark-read'
        }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'mark-all-read'
        }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const downloadBook = async (bookId, bookTitle) => {
    try {
      const response = await fetch(`/api/books/${bookId}/download`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${bookTitle}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download book. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading book:', error);
      alert('Error downloading book. Please try again.');
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

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Success Message */}
        {showPaymentSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-600 text-2xl">🎉</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">
                  Payment Verified Successfully!
                </h3>
                <p className="text-green-700 mt-1">
                  Your payment has been verified and your book is now available for download below.
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setShowPaymentSuccess(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">Manage your books and stay updated with notifications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📚</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Purchased Books</p>
                <p className="text-2xl font-semibold text-gray-900">{bookAccess.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🔔</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unread Notifications</p>
                <p className="text-2xl font-semibold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  NPR {purchasedBooks.reduce((sum, order) => sum + order.total, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Notifications {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h2>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                    >
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Purchased Books */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">My Books</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {bookAccess.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-2">📚</div>
                  <p>No purchased books yet</p>
                  <button
                    onClick={() => router.push('/books')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Browse Books
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {bookAccess.map((access) => (
                    <div key={access.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{access.book.title}</h4>
                          <p className="text-sm text-gray-600">by {access.book.author}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Access granted: {new Date(access.grantedAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              access.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {access.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Downloads: {access.downloadCount}
                            </span>
                            {access.lastAccessed && (
                              <span className="text-xs text-gray-500">
                                Last accessed: {new Date(access.lastAccessed).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {access.isActive && (
                          <button
                            onClick={() => downloadBook(access.book.id, access.book.title)}
                            className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            📥 Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
