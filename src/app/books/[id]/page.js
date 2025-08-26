'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import InteractiveButton from '@/components/InteractiveButton';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';

export default function BookDetailPage({ params }) {
  const resolvedParams = use(params);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { addToCart, isLoading } = useCart();

  useEffect(() => {
    if (resolvedParams.id) {
      fetchBook(resolvedParams.id);
    }
  }, [resolvedParams.id]);

  const fetchBook = async (bookId) => {
    try {
      setLoading(true);
      
      // Add delay for testing loading spinner
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const res = await fetch(`/api/books/${bookId}`);
      
      if (!res.ok) {
        throw new Error('Book not found');
      }
      
      const data = await res.json();
      setBook(data.book);
    } catch (error) {
      console.error('Error fetching book:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner size="large" text="Loading book details..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <InteractiveButton href="/books" variant="secondary">
            Back to Books
          </InteractiveButton>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Books
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Book Cover */}
          <div className="flex justify-center">
            <div className="w-80 h-96 bg-gray-100 rounded-lg flex items-center justify-center shadow-lg">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  width={320}
                  height={384}
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="text-gray-400 text-8xl">📖</div>
              )}
            </div>
          </div>

          {/* Book Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#2D3748' }}>
              {book.title}
            </h1>
            <p className="text-xl mb-4" style={{ color: '#6B728E' }}>by {book.author}</p>
            
            {book.category && (
              <span className="inline-block text-sm px-3 py-1 rounded-full mb-4" style={{ backgroundColor: '#A8B5A2', color: 'white' }}>
                {book.category}
              </span>
            )}

            <div className="mb-6">
              <span className="text-4xl font-bold" style={{ color: '#6B728E' }}>
                Rs. {book.price}
              </span>
            </div>

            <div className="flex gap-4 mb-6">
              <InteractiveButton href="#" variant="primary" className="flex-1">
                Buy PDF Now
              </InteractiveButton>
              <button 
                onClick={() => addToCart(book)}
                disabled={isLoading}
                className="flex-1 py-3 px-6 rounded-lg font-semibold transition-colors border-2 disabled:opacity-50"
                style={{ borderColor: '#28A745', color: '#28A745' }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = '#28A745';
                    e.target.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#28A745';
                  }
                }}
              >
                {isLoading ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            {/* Book Info */}
            <div className="space-y-4 mb-6">
              {book.isbn && (
                <div className="flex">
                  <span className="font-semibold w-20">ISBN:</span>
                  <span>{book.isbn}</span>
                </div>
              )}
              {book.pages && (
                <div className="flex">
                  <span className="font-semibold w-20">Pages:</span>
                  <span>{book.pages}</span>
                </div>
              )}
              <div className="flex">
                <span className="font-semibold w-20">Language:</span>
                <span>{book.language}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-20">Format:</span>
                <span>PDF Download</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2D3748' }}>Description</h3>
              <p className="leading-relaxed" style={{ color: '#6B728E' }}>
                {book.description || 'No description available for this book.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
