'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function BookSuccessPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [book, setBook] = useState(null);
  const [bookAccess, setBookAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id && user) {
      checkBookAccess();
    }
  }, [id, user, authLoading]);

  const checkBookAccess = async () => {
    try {
      setLoading(true);
      
      // Check if user has access to this book
      const accessResponse = await fetch(`/api/user/book-access?bookId=${id}`, {
        credentials: 'include'
      });

      if (accessResponse.ok) {
        const accessData = await accessResponse.json();
        
        if (!accessData.hasAccess) {
          // User doesn't have access, redirect to book page
          router.push(`/books/${id}`);
          return;
        }

        setBookAccess(accessData.bookAccess);
        
        // Get book details
        const bookResponse = await fetch(`/api/books/${id}`);
        if (bookResponse.ok) {
          const bookData = await bookResponse.json();
          setBook(bookData.book);
        }
      } else {
        router.push(`/books/${id}`);
      }
    } catch (error) {
      console.error('Error checking book access:', error);
      router.push(`/books/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadBook = async () => {
    try {
      setDownloading(true);
      const response = await fetch(`/api/books/${id}/download`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${book.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download book. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading book:', error);
      alert('Error downloading book. Please try again.');
    } finally {
      setDownloading(false);
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

  if (!book || !bookAccess) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2 text-green-600">Congratulations!</h1>
            <p className="text-lg text-gray-600">
              Your payment has been verified and your book is ready for download
            </p>
          </div>

          {/* Book Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-6">
              {book.coverImage && (
                <img 
                  src={book.coverImage} 
                  alt={book.title}
                  className="w-24 h-32 object-cover rounded-md shadow-sm"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h2>
                <p className="text-lg text-gray-600 mb-2">by {book.author}</p>
                <p className="text-sm text-gray-500">{book.category}</p>
                {book.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">{book.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Access Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Access Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Access Type:</span>
                <span className="ml-2 text-blue-800">{bookAccess.accessType}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Granted:</span>
                <span className="ml-2 text-blue-800">
                  {new Date(bookAccess.grantedAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Downloads:</span>
                <span className="ml-2 text-blue-800">{bookAccess.downloadCount}</span>
              </div>
              {bookAccess.lastAccessed && (
                <div>
                  <span className="text-blue-600 font-medium">Last Accessed:</span>
                  <span className="ml-2 text-blue-800">
                    {new Date(bookAccess.lastAccessed).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Download Section */}
          <div className="text-center mb-8">
            <button
              onClick={downloadBook}
              disabled={downloading}
              className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Preparing Download...
                </>
              ) : (
                <>
                  📥 Download Your Book
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Click to download your PDF book. You have lifetime access to this book.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/books')}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Browse More Books
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Need Help?</h4>
            <p className="text-sm text-yellow-700">
              If you have any issues downloading your book, please contact our support team.
              We're here to help you access your purchased content.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
