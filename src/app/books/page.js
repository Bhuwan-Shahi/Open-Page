'use client'

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BookGrid from '@/components/BookGrid';
import SearchBar from '@/components/SearchBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books when search term or category changes
  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, selectedCategory]);

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

  const filterBooks = async () => {
    setSearching(true);
    
    let filtered = books;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.description && book.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(book => 
        book.category && book.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredBooks(filtered);
    setSearching(false);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner size="large" text="Loading books..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#2D3748' }}>All Books</h1>
        <p style={{ color: '#6B728E' }}>
          Browse our complete collection of digital books
        </p>
      </div>

      <SearchBar 
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
      />

      {/* Results Info */}
      <div className="mb-4">
        <p style={{ color: '#2D3748' }}>
          {searchTerm || selectedCategory ? (
            <>
              Showing {filteredBooks.length} results
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory && ` in ${selectedCategory}`}
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="ml-2 underline hover:opacity-80 transition-opacity"
                style={{ color: '#0066CC' }}
              >
                Clear filters
              </button>
            </>
          ) : (
            `Showing all ${books.length} books`
          )}
        </p>
      </div>

      {/* Search Results */}
      {searching ? (
        <div className="my-8">
          <LoadingSpinner size="medium" text="Searching books..." />
        </div>
      ) : (
        <BookGrid 
          books={filteredBooks} 
          title=""
          showAddButton={true}
          user={user}
          onBooksChange={(updatedBooks) => {
            setBooks(updatedBooks);
            setFilteredBooks(updatedBooks);
          }}
        />
      )}
    </Layout>
  );
}
