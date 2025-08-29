'use client'

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BookGrid from '@/components/BookGrid';
import InteractiveButton from '@/components/InteractiveButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      const res = await fetch('/api/books', {
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await res.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const featuredBooks = books.slice(0, 4); // Show only first 4 books on homepage

  if (loading) {
    return (
      <Layout>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#2D3748' }}>
            Welcome to Our Digital Bookstore
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#6B728E' }}>
            Discover and purchase amazing books in PDF format. 
            Download instantly after purchase and build your digital library.
          </p>
        </div>
        <LoadingSpinner size="large" text="Loading featured books..." />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#2D3748' }}>
          Welcome to Our Digital Bookstore
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#6B728E' }}>
          Discover and purchase amazing books in PDF format. 
          Download instantly after purchase and build your digital library.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <InteractiveButton href="/books" variant="primary">
            Browse All Books
          </InteractiveButton>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 text-center border-2" style={{ borderColor: '#4A90E2' }}>
          <div className="text-3xl font-bold mb-2" style={{ color: '#4A90E2' }}>{books.length}</div>
          <div style={{ color: '#2D3748' }}>Books Available</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center border-2" style={{ borderColor: '#6C757D' }}>
          <div className="text-3xl font-bold mb-2" style={{ color: '#6C757D' }}>PDF</div>
          <div style={{ color: '#2D3748' }}>Digital Format</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center border-2" style={{ borderColor: '#F5A623' }}>
          <div className="text-3xl font-bold mb-2" style={{ color: '#F5A623' }}>∞</div>
          <div style={{ color: '#2D3748' }}>Instant Downloads</div>
        </div>
      </div>

      {/* Featured Books */}
      <BookGrid 
        books={featuredBooks} 
        title="Featured Books" 
        showAddButton={true} 
        user={user}
        onBooksChange={(updatedBooks) => {
          setBooks(updatedBooks);
        }}
      />

      {/* Call to Action */}
      {books.length > 4 && (
        <div className="text-center mt-12 rounded-lg p-8 border-2" style={{ backgroundColor: '#F0F8FF', borderColor: '#4A90E2' }}>
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#2D3748' }}>
            Explore Our Complete Collection
          </h3>
          <p className="mb-6" style={{ color: '#4A90E2' }}>
            We have {books.length} books waiting for you to discover!
          </p>
          <InteractiveButton href="/books" variant="primary">
            View All Books
          </InteractiveButton>
        </div>
      )}
    </Layout>
  );
}
