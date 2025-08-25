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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search books by title, author, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </form>

        {/* Category Filter */}
        <div className="md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Quick Filter Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 mr-2">Popular:</span>
        {['Fiction', 'Science Fiction', 'Business', 'Technology'].map((tag) => (
          <button
            key={tag}
            onClick={() => handleCategoryChange(tag)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
