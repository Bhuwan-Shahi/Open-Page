'use client'

import { useState } from 'react';

export default function SearchBar({ onSearch, onCategoryFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'All Categories',
    'Classic Literature',
    'Science Fiction',
    'Business',
    'Technology',
    'Fiction',
    'Non-Fiction',
    'Self-Help',
    'History',
    'Science'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (onCategoryFilter) {
      onCategoryFilter(category === 'All Categories' ? '' : category);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6" style={{ borderColor: '#D1D5DB' }}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                borderColor: '#D1D5DB',
                color: '#2D3748'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4A90E2';
                e.target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5" style={{ color: '#4A90E2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </form>

        {/* Category Filter */}
        <div className="md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ 
              borderColor: '#D1D5DB',
              color: '#2D3748',
              backgroundColor: '#F5F7FA'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6B728E'}
            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
          >
            {categories.map((category) => (
              <option key={category} value={category} style={{ color: '#2D3748' }}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          onClick={handleSearch}
          className="px-6 py-3 rounded-lg font-semibold transition-colors text-white"
          style={{ backgroundColor: '#4A90E2' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#357ABD'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4A90E2'}
        >
          Search
        </button>
      </div>

      {/* Quick Filter Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm mr-2" style={{ color: '#1A1A1A' }}>Popular:</span>
        {['Fiction', 'Science Fiction', 'Business', 'Technology'].map((tag) => (
          <button
            key={tag}
            onClick={() => handleCategoryChange(tag)}
            className="px-3 py-1 text-sm rounded-full transition-colors"
            style={{ backgroundColor: '#E6F0FA', color: '#2E6B47' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2E6B47';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#E6F0FA';
              e.target.style.color = '#2E6B47';
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
